import { ChatInputCommandInteraction, SlashCommandBuilder, Message, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { LyricsManager } from '../../managers/LyricsManager.js';

export const LyricsCommand: Command = {
  name: 'lyrics',
  description: 'Display lyrics for the current song or a specified title',
  category: 'music',
  aliases: ['ly'],
  usage: '[song title]',
  slashCommand: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Display lyrics for the current song or a specified title')
    .addStringOption((opt) =>
      opt
        .setName('title')
        .setDescription('Optional song name (defaults to currently playing track)')
        .setRequired(false)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    const specifiedTitle = interaction.options.getString('title');

    let searchTitle = specifiedTitle;
    let artist: string | undefined = undefined;

    if (!searchTitle) {
      if (!player || !player.queue.current) {
        await interaction.reply({
          embeds: [UIManager.createErrorEmbed('Nothing Playing', 'No track is currently playing. Please provide a song name.')],
          ephemeral: true
        });
        return;
      }
      searchTitle = player.queue.current.title;
      artist = player.queue.current.author;
    }

    await interaction.deferReply();

    const result = await LyricsManager.fetchLyrics(searchTitle, artist);
    if (!result || !result.lyrics) {
      await interaction.editReply({
        embeds: [UIManager.createErrorEmbed('Lyrics Not Found', `Could not find lyrics for: **${searchTitle}**`)]
      });
      return;
    }

    const lyricsText = result.lyrics.length > 4000 ? result.lyrics.slice(0, 3990) + '...\n*(truncated)*' : result.lyrics;

    const embed = new EmbedBuilder()
      .setColor(UIManager.BRAND_COLOR)
      .setTitle(`📜 Lyrics: ${result.title} — ${result.artist}`)
      .setDescription(lyricsText)
      .setFooter({ text: 'Meowzic Lyrics Engine' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    let searchTitle = args.join(' ');
    let artist: string | undefined = undefined;

    if (!searchTitle) {
      if (!player || !player.queue.current) {
        await message.reply({
          embeds: [UIManager.createErrorEmbed('Nothing Playing', 'No track is currently playing. Please specify a song name.')]
        });
        return;
      }
      searchTitle = player.queue.current.title;
      artist = player.queue.current.author;
    }

    const result = await LyricsManager.fetchLyrics(searchTitle, artist);
    if (!result || !result.lyrics) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Lyrics Not Found', `Could not find lyrics for: **${searchTitle}**`)]
      });
      return;
    }

    const lyricsText = result.lyrics.length > 4000 ? result.lyrics.slice(0, 3990) + '...\n*(truncated)*' : result.lyrics;

    const embed = new EmbedBuilder()
      .setColor(UIManager.BRAND_COLOR)
      .setTitle(`📜 Lyrics: ${result.title} — ${result.artist}`)
      .setDescription(lyricsText)
      .setFooter({ text: 'Meowzic Lyrics Engine' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
