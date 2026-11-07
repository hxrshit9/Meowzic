import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  GuildMember,
  VoiceBasedChannel,
  Message
} from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { Logger } from '../../utils/logger.js';

export const PlayCommand: Command = {
  name: 'play',
  description: 'Play a song or playlist from YouTube, Spotify, SoundCloud, etc.',
  category: 'music',
  aliases: ['p'],
  usage: '<query or URL>',
  slashCommand: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube, Spotify, SoundCloud, etc.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The song title, YouTube/Spotify link, or playlist')
        .setRequired(true)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const query = interaction.options.getString('query', true);
    const member = interaction.member as GuildMember;
    const voiceChannel = member?.voice?.channel as VoiceBasedChannel | null;

    if (!voiceChannel) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'Please join a voice channel before using `/play`.')],
        ephemeral: true
      });
      return;
    }

    const permissions = voiceChannel.permissionsFor(client.user!);
    if (!permissions?.has('Connect') || !permissions?.has('Speak')) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Missing Permissions', 'I do not have permission to `Connect` and `Speak` in your voice channel.')],
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      let player = client.kazagumo.players.get(interaction.guildId!);
      if (!player) {
        player = await client.kazagumo.createPlayer({
          guildId: interaction.guildId!,
          textId: interaction.channelId,
          voiceId: voiceChannel.id,
          volume: 80,
          deaf: true
        });
      }

      const res = await client.kazagumo.search(query, { requester: interaction.user });

      if (!res.tracks.length) {
        await interaction.editReply({
          embeds: [UIManager.createErrorEmbed('No Tracks Found', `No results found for: \`${query}\``)]
        });
        return;
      }

      if (res.type === 'PLAYLIST') {
        for (const track of res.tracks) {
          player.queue.add(track);
        }

        const totalLength = res.tracks.reduce((acc, t) => acc + (t.length || 0), 0);
        await interaction.editReply({
          embeds: [
            UIManager.createPlaylistAddedEmbed(
              res.playlistName || 'Custom Playlist',
              res.tracks.length,
              totalLength,
              interaction.user
            )
          ]
        });
      } else {
        const track = res.tracks[0];
        player.queue.add(track);

        if (player.playing || player.paused) {
          await interaction.editReply({
            embeds: [UIManager.createTrackAddedEmbed(track, player.queue.length)]
          });
        } else {
          await interaction.editReply({
            embeds: [UIManager.createSuccessEmbed('Starting Playback', `Now queueing [${track.title}](${track.uri})`)]
          });
        }
      }

      if (!player.playing && !player.paused) {
        await player.play();
      }
    } catch (error) {
      Logger.error('Failed to execute /play command', error, 'PlayCommand');
      await interaction.editReply({
        embeds: [UIManager.createErrorEmbed('Playback Error', 'An unexpected error occurred while processing your request.')]
      });
    }
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    if (!args.length) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Query Required', 'Please provide a song title or URL. Example: `+play Faded Alan Walker`')]
      });
      return;
    }

    const query = args.join(' ');
    const member = message.member;
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'Please join a voice channel first.')]
      });
      return;
    }

    let player = client.kazagumo.players.get(message.guildId!);
    if (!player) {
      player = await client.kazagumo.createPlayer({
        guildId: message.guildId!,
        textId: message.channelId,
        voiceId: voiceChannel.id,
        volume: 80,
        deaf: true
      });
    }

    const res = await client.kazagumo.search(query, { requester: message.author });
    if (!res.tracks.length) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Tracks Found', `No results found for: \`${query}\``)]
      });
      return;
    }

    if (res.type === 'PLAYLIST') {
      for (const track of res.tracks) {
        player.queue.add(track);
      }
      const totalLength = res.tracks.reduce((acc, t) => acc + (t.length || 0), 0);
      await message.reply({
        embeds: [
          UIManager.createPlaylistAddedEmbed(
            res.playlistName || 'Custom Playlist',
            res.tracks.length,
            totalLength,
            message.author
          )
        ]
      });
    } else {
      const track = res.tracks[0];
      player.queue.add(track);

      if (player.playing || player.paused) {
        await message.reply({
          embeds: [UIManager.createTrackAddedEmbed(track, player.queue.length)]
        });
      } else {
        await message.reply({
          embeds: [UIManager.createSuccessEmbed('Starting Playback', `Now queueing [${track.title}](${track.uri})`)]
        });
      }
    }

    if (!player.playing && !player.paused) {
      await player.play();
    }
  }
};
