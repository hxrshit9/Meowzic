import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const PauseCommand: Command = {
  name: 'pause',
  description: 'Pause the current audio playback',
  category: 'music',
  slashCommand: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current audio playback'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no active playback to pause.')],
        ephemeral: true
      });
      return;
    }

    if (player.paused) {
      await interaction.reply({
        embeds: [UIManager.createInfoEmbed('Already Paused', 'The player is already paused. Use `/resume` to continue.')],
        ephemeral: true
      });
      return;
    }

    player.pause(true);
    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Paused', 'Music has been paused. Press ⏯️ or use `/resume` to continue.')]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no active playback to pause.')]
      });
      return;
    }

    if (player.paused) {
      await message.reply({
        embeds: [UIManager.createInfoEmbed('Already Paused', 'The player is already paused. Use `+resume` to continue.')]
      });
      return;
    }

    player.pause(true);
    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Paused', 'Music has been paused.')]
    });
  }
};
