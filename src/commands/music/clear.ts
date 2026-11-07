import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const ClearCommand: Command = {
  name: 'clear',
  description: 'Clear all upcoming tracks from the queue',
  category: 'music',
  aliases: ['queueclear', 'clearqueue'],
  slashCommand: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear all upcoming tracks from the queue'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')],
        ephemeral: true
      });
      return;
    }

    if (player.queue.length === 0) {
      await interaction.reply({
        embeds: [UIManager.createInfoEmbed('Queue Already Empty', 'There are no upcoming tracks in the queue to clear.')],
        ephemeral: true
      });
      return;
    }

    const clearedCount = player.queue.length;
    player.queue.clear();

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Queue Cleared', `Removed **${clearedCount}** tracks from the upcoming queue.`)]
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

    if (player.queue.length === 0) {
      await message.reply({
        embeds: [UIManager.createInfoEmbed('Queue Already Empty', 'There are no upcoming tracks in the queue to clear.')]
      });
      return;
    }

    const clearedCount = player.queue.length;
    player.queue.clear();

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Queue Cleared', `Removed **${clearedCount}** tracks from the upcoming queue.`)]
    });
  }
};
