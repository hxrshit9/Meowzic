import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const PreviousCommand: Command = {
  name: 'previous',
  description: 'Replay the previous track from history',
  category: 'music',
  aliases: ['prev'],
  slashCommand: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Replay the previous track from history'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No Player Found', 'There is no music player in this server.')],
        ephemeral: true
      });
      return;
    }

    const previousTracks = player.queue.previous;
    if (!previousTracks || previousTracks.length === 0) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('No History', 'There is no previous track in the history.')],
        ephemeral: true
      });
      return;
    }

    const previous = previousTracks[previousTracks.length - 1];
    player.queue.unshift(previous);
    player.skip();

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Replaying Previous Track', `Now playing **${previous.title}**`)]
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

    const previousTracks = player.queue.previous;
    if (!previousTracks || previousTracks.length === 0) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No History', 'There is no previous track in the history.')]
      });
      return;
    }

    const previous = previousTracks[previousTracks.length - 1];
    player.queue.unshift(previous);
    player.skip();

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Replaying Previous Track', `Now playing **${previous.title}**`)]
    });
  }
};
