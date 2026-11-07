import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const QueueCommand: Command = {
  name: 'queue',
  description: 'Display the current server music queue',
  category: 'music',
  aliases: ['q'],
  slashCommand: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Display the current server music queue')
    .addIntegerOption((opt) =>
      opt
        .setName('page')
        .setDescription('Page number of the queue')
        .setMinValue(1)
        .setRequired(false)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || (!player.queue.current && player.queue.length === 0)) {
      await interaction.reply({
        embeds: [UIManager.createInfoEmbed('Queue Empty', 'There are no songs in the queue right now.')],
        ephemeral: true
      });
      return;
    }

    const page = interaction.options.getInteger('page') || 1;
    const embed = UIManager.createQueueEmbed(player, page);

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || (!player.queue.current && player.queue.length === 0)) {
      await message.reply({
        embeds: [UIManager.createInfoEmbed('Queue Empty', 'There are no songs in the queue right now.')]
      });
      return;
    }

    const page = args[0] ? parseInt(args[0], 10) || 1 : 1;
    const embed = UIManager.createQueueEmbed(player, page);

    await message.reply({ embeds: [embed] });
  }
};
