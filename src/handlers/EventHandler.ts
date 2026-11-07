import {
  Interaction,
  Message,
  VoiceState,
  TextChannel
} from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { MeowzicClient } from '../client/MeowzicClient.js';
import { InteractionHandler } from './InteractionHandler.js';
import { UIManager } from '../managers/UIManager.js';
import { Logger } from '../utils/logger.js';
import { config } from '../config.js';

export class EventHandler {
  private interactionHandler: InteractionHandler;

  constructor(private client: MeowzicClient) {
    this.interactionHandler = new InteractionHandler(client);
  }

  public registerEvents(): void {
    this.registerClientEvents();
    this.registerKazagumoEvents();
  }

  private registerClientEvents(): void {
    // 1. Ready event
    this.client.once('ready', () => {
      Logger.success(`Logged in as ${this.client.user?.tag}! Ready to rock! 🎸`, 'Gateway');
      Logger.info(`Connected to ${this.client.guilds.cache.size} servers across Discord.`, 'Gateway');
    });

    // 2. Interaction event
    this.client.on('interactionCreate', async (interaction: Interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          const command = this.client.commands.get(interaction.commandName);
          if (!command) return;
          await command.executeSlash(interaction, this.client);
        } else if (interaction.isButton()) {
          await this.interactionHandler.handleButton(interaction);
        } else if (interaction.isStringSelectMenu()) {
          await this.interactionHandler.handleSelectMenu(interaction);
        } else if (interaction.isAutocomplete()) {
          const command = this.client.commands.get(interaction.commandName);
          if (command?.autocomplete) {
            await command.autocomplete(interaction, this.client);
          }
        }
      } catch (error) {
        Logger.error(`Error processing interaction: ${interaction.id}`, error, 'InteractionEvent');
      }
    });

    // 3. MessageCreate event (Prefix command support)
    this.client.on('messageCreate', async (message: Message) => {
      if (message.author.bot || !message.guild) return;

      const prefix = config.DEFAULT_PREFIX;
      if (!message.content.startsWith(prefix)) return;

      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;

      const command =
        this.client.commands.get(commandName) ||
        this.client.commands.get(this.client.aliases.get(commandName) || '');

      if (!command || !command.executePrefix) return;

      try {
        await command.executePrefix(message, args, this.client);
      } catch (error) {
        Logger.error(`Error executing prefix command: ${commandName}`, error, 'MessageEvent');
        await message.reply({
          embeds: [UIManager.createErrorEmbed('Command Failed', 'An error occurred while executing this command.')]
        });
      }
    });

    // 4. VoiceStateUpdate event (Multi-server resilience & empty channel management)
    this.client.on('voiceStateUpdate', async (oldState: VoiceState, newState: VoiceState) => {
      const guildId = oldState.guild.id;
      const player = this.client.kazagumo.players.get(guildId);
      if (!player) return;

      const is247 = Boolean(player.data.get('247'));
      if (is247) return; // Never leave when 24/7 is enabled

      // If the bot itself was disconnected or moved
      if (oldState.member?.id === this.client.user?.id) {
        if (!newState.channelId) {
          // Bot was forcibly disconnected from voice
          Logger.info(`Bot disconnected from voice channel in guild ${guildId}`, 'VoiceState');
          player.destroy();
          return;
        }
      }

      // Check if all human members left the voice channel
      const voiceChannel = oldState.guild.channels.cache.get(player.voiceId!);
      if (voiceChannel && voiceChannel.isVoiceBased()) {
        const humanMembers = voiceChannel.members.filter((m) => !m.user.bot);
        if (humanMembers.size === 0) {
          Logger.info(`Voice channel empty in guild ${guildId}. Scheduling auto-disconnect.`, 'VoiceState');
          setTimeout(() => {
            const freshPlayer = this.client.kazagumo.players.get(guildId);
            if (!freshPlayer) return;
            const freshChannel = oldState.guild.channels.cache.get(freshPlayer.voiceId!);
            if (freshChannel && freshChannel.isVoiceBased()) {
              const freshHumans = freshChannel.members.filter((m) => !m.user.bot);
              if (freshHumans.size === 0 && !freshPlayer.data.get('247')) {
                freshPlayer.destroy();
                Logger.info(`Auto-disconnected from empty voice channel in guild ${guildId}`, 'VoiceState');
              }
            }
          }, 30000); // 30 second grace period
        }
      }
    });
  }

  private registerKazagumoEvents(): void {
    // 1. Shoukaku node events
    this.client.kazagumo.shoukaku.on('ready', (name: string) => {
      Logger.success(`Lavalink Node [${name}] connected successfully!`, 'Lavalink');
    });

    this.client.kazagumo.shoukaku.on('error', (name: string, error: Error) => {
      Logger.error(`Lavalink Node [${name}] error: ${error.message}`, error, 'Lavalink');
    });

    this.client.kazagumo.shoukaku.on('close', (name: string, code: number, reason: string) => {
      Logger.warn(`Lavalink Node [${name}] connection closed: Code ${code} (${reason})`, 'Lavalink');
    });

    this.client.kazagumo.shoukaku.on('disconnect', (name: string, count: number) => {
      Logger.warn(`Lavalink Node [${name}] disconnected. Reconnect attempt #${count}`, 'Lavalink');
    });

    // 2. Kazagumo player events
    this.client.kazagumo.on('playerStart', async (player: KazagumoPlayer, track: KazagumoTrack) => {
      Logger.info(`Started playing: "${track.title}" in guild ${player.guildId}`, 'Player');
      const channel = this.client.channels.cache.get(player.textId!) as TextChannel | undefined;
      if (!channel) return;

      const embed = UIManager.createNowPlayingEmbed(player, track);
      const components = UIManager.createPlayerButtons(player);

      try {
        const msg = await channel.send({ embeds: [embed], components });
        player.data.set('lastMessageId', msg.id);
      } catch (err) {
        Logger.error(`Could not send Now Playing message in guild ${player.guildId}`, err, 'Player');
      }
    });

    this.client.kazagumo.on('playerEnd', async (player: KazagumoPlayer) => {
      // Clean up previous message components if necessary
      const lastMsgId = player.data.get('lastMessageId') as string | undefined;
      if (lastMsgId) {
        const channel = this.client.channels.cache.get(player.textId!) as TextChannel | undefined;
        if (channel) {
          channel.messages.fetch(lastMsgId).then((msg) => {
            msg.edit({ components: [] }).catch(() => {});
          }).catch(() => {});
        }
      }
    });

    this.client.kazagumo.on('playerEmpty', async (player: KazagumoPlayer) => {
      const isAutoplay = Boolean(player.data.get('autoplay'));
      const previousTracks = player.queue.previous;
      const previous = previousTracks.length ? previousTracks[previousTracks.length - 1] : undefined;

      // Autoplay recommendation algorithm
      if (isAutoplay && previous) {
        try {
          Logger.info(`Autoplay active in guild ${player.guildId}. Finding similar tracks...`, 'Autoplay');
          const searchQuery = `ytsearch:${previous.author} ${previous.title} mix`;
          const res = await this.client.kazagumo.search(searchQuery, { requester: this.client.user! });

          // Pick first candidate that wasn't the previous track
          const candidate = res.tracks.find((t) => t.title.toLowerCase() !== previous.title.toLowerCase());
          if (candidate) {
            player.queue.add(candidate);
            player.play();
            const channel = this.client.channels.cache.get(player.textId!) as TextChannel | undefined;
            if (channel) {
              await channel.send({
                embeds: [
                  UIManager.createInfoEmbed(
                    'Autoplay Triggered 📻',
                    `Queued recommendation: [${candidate.title}](${candidate.uri}) by \`${candidate.author}\``
                  )
                ]
              });
            }
            return;
          }
        } catch (error) {
          Logger.error('Failed to trigger autoplay track resolution', error, 'Autoplay');
        }
      }

      // If autoplay did not queue anything and 24/7 is disabled, notify and leave after timeout
      const is247 = Boolean(player.data.get('247'));
      if (!is247) {
        const channel = this.client.channels.cache.get(player.textId!) as TextChannel | undefined;
        if (channel) {
          await channel.send({
            embeds: [
              UIManager.createInfoEmbed(
                'Queue Concluded',
                'The music queue is now empty. Disconnecting in 2 minutes unless more songs are added.'
              )
            ]
          }).catch(() => {});
        }

        setTimeout(() => {
          const freshPlayer = this.client.kazagumo.players.get(player.guildId);
          if (freshPlayer && !freshPlayer.playing && freshPlayer.queue.length === 0 && !freshPlayer.data.get('247')) {
            freshPlayer.destroy();
          }
        }, 120000);
      }
    });

    this.client.kazagumo.on('playerException', async (player: KazagumoPlayer) => {
      Logger.error(`Player exception in guild ${player.guildId}`, undefined, 'Player');
      const channel = this.client.channels.cache.get(player.textId!) as TextChannel | undefined;
      if (channel) {
        await channel.send({
          embeds: [UIManager.createErrorEmbed('Playback Stream Error', 'An error occurred during audio streaming.')]
        }).catch(() => {});
      }
    });
  }
}
