import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const StopCommand: Command = {
  name: 'stop',
  description: 'Stop music playback, clear queue, and leave voice channel',
  category: 'music',
  slashCommand: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music playback, clear queue, and leave voice channel'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no active music player to stop.')],
        ephemeral: true
      });
      return;
    }

    player.queue.clear();
    player.destroy();

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Stopped', 'Queue cleared and bot disconnected. Have a meow-tastic day! 🐾')]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no active music player to stop.')]
      });
      return;
    }

    player.queue.clear();
    player.destroy();

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Playback Stopped', 'Queue cleared and bot disconnected. Have a meow-tastic day! 🐾')]
    });
  }
};
