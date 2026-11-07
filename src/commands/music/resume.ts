import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const ResumeCommand: Command = {
  name: 'resume',
  description: 'Resume paused audio playback',
  category: 'music',
  slashCommand: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume paused audio playback'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no track currently in the player.')],
        ephemeral: true
      });
      return;
    }

    if (!player.paused) {
      await interaction.reply({
        embeds: [UIManager.createInfoEmbed('Not Paused', 'The player is already playing music.')],
        ephemeral: true
      });
      return;
    }

    player.pause(false);
    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Resumed', 'Music playback has resumed.')]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no track currently in the player.')]
      });
      return;
    }

    if (!player.paused) {
      await message.reply({
        embeds: [UIManager.createInfoEmbed('Not Paused', 'The player is already playing music.')]
      });
      return;
    }

    player.pause(false);
    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Resumed', 'Music playback has resumed.')]
    });
  }
};
