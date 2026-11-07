import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const VolumeCommand: Command = {
  name: 'volume',
  description: 'Adjust the audio playback volume (1 - 150%)',
  category: 'music',
  aliases: ['vol', 'v'],
  usage: '<level 1-150>',
  slashCommand: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the audio playback volume (1 - 150%)')
    .addIntegerOption((opt) =>
      opt
        .setName('level')
        .setDescription('Volume level (1 to 150)')
        .setMinValue(1)
        .setMaxValue(150)
        .setRequired(true)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')],
        ephemeral: true
      });
      return;
    }

    const level = interaction.options.getInteger('level', true);
    player.setVolume(level);

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Volume Adjusted', `Volume has been set to **${level}%**`)]
    });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')]
      });
      return;
    }

    if (!args[0]) {
      await message.reply({
        embeds: [UIManager.createInfoEmbed('Current Volume', `The current volume is **${player.volume}%**`)]
      });
      return;
    }

    const level = parseInt(args[0], 10);
    if (isNaN(level) || level < 1 || level > 150) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Invalid Level', 'Please specify a volume number between 1 and 150.')]
      });
      return;
    }

    player.setVolume(level);
    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Volume Adjusted', `Volume has been set to **${level}%**`)]
    });
  }
};
