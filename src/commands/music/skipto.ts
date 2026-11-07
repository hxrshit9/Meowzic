import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const SkipToCommand: Command = {
  name: 'skipto',
  description: 'Skip directly to a specific position in the queue',
  category: 'music',
  usage: '<position>',
  slashCommand: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Skip directly to a specific position in the queue')
    .addIntegerOption((opt) =>
      opt
        .setName('position')
        .setDescription('The queue number to jump to')
        .setRequired(true)
        .setMinValue(1)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const position = interaction.options.getInteger('position', true);
    const player = client.kazagumo.players.get(interaction.guildId!);

    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no active playback.')],
        ephemeral: true
      });
      return;
    }

    if (position > player.queue.length) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Invalid Position', `Queue only contains ${player.queue.length} upcoming tracks.`)],
        ephemeral: true
      });
      return;
    }

    // Remove songs prior to position - 1
    player.queue.splice(0, position - 1);
    const targetTitle = player.queue[0]?.title || 'Next track';
    player.skip();

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Skipped Directly', `Skipped forward to position #${position}: **${targetTitle}**`)]
    });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const pos = parseInt(args[0], 10);
    const player = client.kazagumo.players.get(message.guildId!);

    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no active playback.')]
      });
      return;
    }

    if (isNaN(pos) || pos < 1 || pos > player.queue.length) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Invalid Position', `Please provide a valid number between 1 and ${player.queue.length}.`)]
      });
      return;
    }

    player.queue.splice(0, pos - 1);
    const targetTitle = player.queue[0]?.title || 'Next track';
    player.skip();

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Skipped Directly', `Skipped forward to position #${pos}: **${targetTitle}**`)]
    });
  }
};
