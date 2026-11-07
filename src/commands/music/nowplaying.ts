import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const NowPlayingCommand: Command = {
  name: 'nowplaying',
  description: 'Show what is currently playing with interactive controls',
  category: 'music',
  aliases: ['np'],
  slashCommand: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show what is currently playing with interactive controls'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')],
        ephemeral: true
      });
      return;
    }

    const embed = UIManager.createNowPlayingEmbed(player, player.queue.current);
    const buttons = UIManager.createPlayerButtons(player);

    await interaction.reply({
      embeds: [embed],
      components: buttons
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')]
      });
      return;
    }

    const embed = UIManager.createNowPlayingEmbed(player, player.queue.current);
    const buttons = UIManager.createPlayerButtons(player);

    await message.reply({
      embeds: [embed],
      components: buttons
    });
  }
};
