import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const ShuffleCommand: Command = {
  name: 'shuffle',
  description: 'Randomly shuffle the tracks in the queue',
  category: 'music',
  slashCommand: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Randomly shuffle the tracks in the queue'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')],
        ephemeral: true
      });
      return;
    }

    if (player.queue.length <= 1) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Not Enough Tracks', 'There must be at least 2 tracks in the queue to shuffle.')],
        ephemeral: true
      });
      return;
    }

    player.queue.shuffle();
    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Queue Shuffled 🔀', `Randomized the order of **${player.queue.length}** tracks.`)]
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

    if (player.queue.length <= 1) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Not Enough Tracks', 'There must be at least 2 tracks in the queue to shuffle.')]
      });
      return;
    }

    player.queue.shuffle();
    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Queue Shuffled 🔀', `Randomized the order of **${player.queue.length}** tracks.`)]
    });
  }
};
