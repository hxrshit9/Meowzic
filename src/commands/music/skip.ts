import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const SkipCommand: Command = {
  name: 'skip',
  description: 'Skip the current playing track',
  category: 'music',
  aliases: ['s'],
  slashCommand: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current playing track'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no track currently playing to skip.')],
        ephemeral: true
      });
      return;
    }

    const currentTitle = player.queue.current.title;
    player.skip();

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Track Skipped', `Skipped **${currentTitle}**`)]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no track currently playing to skip.')]
      });
      return;
    }

    const currentTitle = player.queue.current.title;
    player.skip();

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Track Skipped', `Skipped **${currentTitle}**`)]
    });
  }
};
