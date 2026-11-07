import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const AutoplayCommand: Command = {
  name: 'autoplay',
  description: 'Toggle smart autoplay when the queue runs out',
  category: 'music',
  aliases: ['auto'],
  slashCommand: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggle smart autoplay when the queue runs out'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')],
        ephemeral: true
      });
      return;
    }

    const currentAutoplay = Boolean(player.data.get('autoplay'));
    const newAutoplay = !currentAutoplay;
    player.data.set('autoplay', newAutoplay);

    await interaction.reply({
      embeds: [
        UIManager.createSuccessEmbed(
          'Autoplay Toggled',
          `Smart Autoplay is now **${newAutoplay ? 'Enabled ✅' : 'Disabled ❌'}**.\n${
            newAutoplay ? 'Meowzic will automatically find similar songs when the queue finishes!' : ''
          }`
        )
      ]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')]
      });
      return;
    }

    const currentAutoplay = Boolean(player.data.get('autoplay'));
    const newAutoplay = !currentAutoplay;
    player.data.set('autoplay', newAutoplay);

    await message.reply({
      embeds: [
        UIManager.createSuccessEmbed(
          'Autoplay Toggled',
          `Smart Autoplay is now **${newAutoplay ? 'Enabled ✅' : 'Disabled ❌'}**.`
        )
      ]
    });
  }
};
