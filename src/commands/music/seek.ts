import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { parseTimeString, formatDuration } from '../../utils/formatters.js';

export const SeekCommand: Command = {
  name: 'seek',
  description: 'Jump to a specific timestamp in the current track',
  category: 'music',
  usage: '<timestamp (e.g. 1:30 or 90s)>',
  slashCommand: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Jump to a specific timestamp in the current track')
    .addStringOption((opt) =>
      opt
        .setName('time')
        .setDescription('Timestamp to seek to (e.g. 1:30, 2m, or 90s)')
        .setRequired(true)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')],
        ephemeral: true
      });
      return;
    }

    const currentTrack = player.queue.current;
    if (currentTrack.isStream) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Live Stream', 'Cannot seek in a live audio stream.')],
        ephemeral: true
      });
      return;
    }

    const timeInput = interaction.options.getString('time', true);
    const ms = parseTimeString(timeInput);

    if (ms === null || ms < 0 || ms > (currentTrack.length || 0)) {
      await interaction.reply({
        embeds: [
          UIManager.createErrorEmbed(
            'Invalid Timestamp',
            `Please specify a time between \`00:00\` and \`${formatDuration(currentTrack.length)}\` (e.g. \`1:30\`).`
          )
        ],
        ephemeral: true
      });
      return;
    }

    player.seek(ms);
    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Seeked Timestamp', `Jumped to **${formatDuration(ms)}** in the track.`)]
    });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')]
      });
      return;
    }

    const currentTrack = player.queue.current;
    if (currentTrack.isStream) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Live Stream', 'Cannot seek in a live audio stream.')]
      });
      return;
    }

    if (!args[0]) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Time Required', 'Please provide a time to seek to (e.g. `+seek 1:30`).')]
      });
      return;
    }

    const ms = parseTimeString(args[0]);
    if (ms === null || ms < 0 || ms > (currentTrack.length || 0)) {
      await message.reply({
        embeds: [
          UIManager.createErrorEmbed(
            'Invalid Timestamp',
            `Please specify a time between \`00:00\` and \`${formatDuration(currentTrack.length)}\`.`
          )
        ]
      });
      return;
    }

    player.seek(ms);
    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Seeked Timestamp', `Jumped to **${formatDuration(ms)}** in the track.`)]
    });
  }
};
