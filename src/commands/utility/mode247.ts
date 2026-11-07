import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const Mode247Command: Command = {
  name: '247',
  description: 'Toggle 24/7 presence (prevents bot from leaving when voice channel is empty)',
  category: 'settings',
  aliases: ['stay', 'alwayson'],
  slashCommand: new SlashCommandBuilder()
    .setName('247')
    .setDescription('Toggle 24/7 presence (prevents bot from leaving when channel is empty)'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'Bot must be in a voice channel to enable 24/7 mode.')],
        ephemeral: true
      });
      return;
    }

    const current247 = Boolean(player.data.get('247'));
    const next247 = !current247;
    player.data.set('247', next247);

    await interaction.reply({
      embeds: [
        UIManager.createSuccessEmbed(
          '24/7 Mode Toggled',
          `24/7 Voice Channel Stay is now **${next247 ? 'Enabled 🟢' : 'Disabled 🔴'}**.\n${
            next247 ? 'Meowzic will stay connected even when the queue finishes or all users leave!' : 'Bot will disconnect when empty.'
          }`
        )
      ]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'Bot must be in a voice channel to enable 24/7 mode.')]
      });
      return;
    }

    const current247 = Boolean(player.data.get('247'));
    const next247 = !current247;
    player.data.set('247', next247);

    await message.reply({
      embeds: [
        UIManager.createSuccessEmbed(
          '24/7 Mode Toggled',
          `24/7 Voice Channel Stay is now **${next247 ? 'Enabled 🟢' : 'Disabled 🔴'}**.`
        )
      ]
    });
  }
};
