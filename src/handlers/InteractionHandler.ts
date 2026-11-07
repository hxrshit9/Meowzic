import {
  ButtonInteraction,
  StringSelectMenuInteraction,
  GuildMember,
  VoiceBasedChannel
} from 'discord.js';
import { MeowzicClient } from '../client/MeowzicClient.js';
import { UIManager } from '../managers/UIManager.js';
import { Logger } from '../utils/logger.js';

export class InteractionHandler {
  constructor(private client: MeowzicClient) {}

  /**
   * Handle Button interactions for Player controls
   */
  public async handleButton(interaction: ButtonInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const member = interaction.member as GuildMember | null;
    const voiceChannel = member?.voice?.channel as VoiceBasedChannel | null;

    if (!voiceChannel) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'You must be in a voice channel to control playback.')],
        ephemeral: true
      });
      return;
    }

    const player = this.client.kazagumo.players.get(guildId);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Active Player', 'There is no music currently playing in this server.')],
        ephemeral: true
      });
      return;
    }

    // Verify member is in the same voice channel as the bot
    if (player.voiceId && voiceChannel.id !== player.voiceId) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Wrong Voice Channel', `You must be in <#${player.voiceId}> to use the controls.`)],
        ephemeral: true
      });
      return;
    }

    try {
      switch (interaction.customId) {
        case 'player_playpause': {
          if (player.paused) {
            player.pause(false);
            await interaction.reply({
              embeds: [UIManager.createSuccessEmbed('Resumed', 'Playback has been resumed.')],
              ephemeral: true
            });
          } else {
            player.pause(true);
            await interaction.reply({
              embeds: [UIManager.createSuccessEmbed('Paused', 'Playback has been paused.')],
              ephemeral: true
            });
          }
          break;
        }

        case 'player_skip': {
          const currentTitle = player.queue.current?.title || 'Unknown track';
          player.skip();
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Skipped', `Skipped **${currentTitle}**`)],
            ephemeral: true
          });
          break;
        }

        case 'player_prev': {
          const previousTracks = player.queue.previous;
          if (!previousTracks || previousTracks.length === 0) {
            await interaction.reply({
              embeds: [UIManager.createErrorEmbed('No Previous Track', 'There is no previous track in history.')],
              ephemeral: true
            });
            return;
          }
          const previous = previousTracks[previousTracks.length - 1];
          player.queue.unshift(previous);
          player.skip();
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Previous Track', `Replaying **${previous.title}**`)],
            ephemeral: true
          });
          break;
        }

        case 'player_stop': {
          player.queue.clear();
          player.destroy();
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Stopped', 'Music stopped, queue cleared, and disconnected from voice.')],
            ephemeral: true
          });
          break;
        }

        case 'player_shuffle': {
          if (player.queue.length <= 1) {
            await interaction.reply({
              embeds: [UIManager.createErrorEmbed('Not Enough Tracks', 'Need at least 2 tracks in queue to shuffle.')],
              ephemeral: true
            });
            return;
          }
          player.queue.shuffle();
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Shuffled', `Shuffled **${player.queue.length}** tracks in the queue.`)],
            ephemeral: true
          });
          break;
        }

        case 'player_loop': {
          let nextMode: 'none' | 'track' | 'queue' = 'none';
          if (player.loop === 'none') nextMode = 'track';
          else if (player.loop === 'track') nextMode = 'queue';
          else nextMode = 'none';

          player.setLoop(nextMode);
          const modeName = nextMode === 'track' ? '🔂 Track' : nextMode === 'queue' ? '🔁 Queue' : 'Off';
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Loop Mode Updated', `Loop is now set to: **${modeName}**`)],
            ephemeral: true
          });
          break;
        }

        case 'player_voldown': {
          const newVol = Math.max(10, player.volume - 10);
          player.setVolume(newVol);
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Volume Decreased', `Volume set to **${newVol}%**`)],
            ephemeral: true
          });
          break;
        }

        case 'player_volup': {
          const newVol = Math.min(150, player.volume + 10);
          player.setVolume(newVol);
          await interaction.reply({
            embeds: [UIManager.createSuccessEmbed('Volume Increased', `Volume set to **${newVol}%**`)],
            ephemeral: true
          });
          break;
        }

        case 'player_queue': {
          const queueEmbed = UIManager.createQueueEmbed(player, 1);
          await interaction.reply({
            embeds: [queueEmbed],
            ephemeral: true
          });
          break;
        }

        case 'player_autoplay': {
          const currentAutoplay = Boolean(player.data.get('autoplay'));
          player.data.set('autoplay', !currentAutoplay);
          await interaction.reply({
            embeds: [
              UIManager.createSuccessEmbed(
                'Autoplay Toggled',
                `Autoplay mode is now **${!currentAutoplay ? 'Enabled ✅' : 'Disabled ❌'}**.`
              )
            ],
            ephemeral: true
          });
          break;
        }

        default:
          break;
      }
    } catch (error) {
      Logger.error(`Error handling button interaction: ${interaction.customId}`, error, 'InteractionHandler');
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          embeds: [UIManager.createErrorEmbed('Action Failed', 'An error occurred while executing this action.')],
          ephemeral: true
        });
      }
    }
  }

  /**
   * Handle StringSelectMenu interactions (e.g. /search results)
   */
  public async handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
    if (interaction.customId === 'search_track_select') {
      const selectedUri = interaction.values[0];
      const member = interaction.member as GuildMember | null;
      const voiceChannel = member?.voice?.channel as VoiceBasedChannel | null;

      if (!voiceChannel) {
        await interaction.reply({
          embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'Please join a voice channel first.')],
          ephemeral: true
        });
        return;
      }

      await interaction.deferReply();

      let player = this.client.kazagumo.players.get(interaction.guildId!);
      if (!player) {
        player = await this.client.kazagumo.createPlayer({
          guildId: interaction.guildId!,
          textId: interaction.channelId,
          voiceId: voiceChannel.id,
          volume: 80,
          deaf: true
        });
      }

      const res = await this.client.kazagumo.search(selectedUri, { requester: interaction.user });
      if (!res.tracks.length) {
        await interaction.editReply({
          embeds: [UIManager.createErrorEmbed('Search Error', 'Unable to load the selected track.')]
        });
        return;
      }

      const track = res.tracks[0];
      player.queue.add(track);

      if (!player.playing && !player.paused) {
        player.play();
      }

      await interaction.editReply({
        embeds: [UIManager.createTrackAddedEmbed(track, player.queue.length)]
      });
    }
  }
}
