import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Message,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  GuildMember,
  VoiceBasedChannel
} from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { formatDuration } from '../../utils/formatters.js';

export const SearchCommand: Command = {
  name: 'search',
  description: 'Search for tracks and select from interactive menu',
  category: 'music',
  usage: '<query>',
  slashCommand: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for tracks and select from interactive menu')
    .addStringOption((opt) =>
      opt
        .setName('query')
        .setDescription('Song title or artist to search')
        .setRequired(true)
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member?.voice?.channel as VoiceBasedChannel | null;

    if (!voiceChannel) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'Please join a voice channel first.')],
        ephemeral: true
      });
      return;
    }

    const query = interaction.options.getString('query', true);
    await interaction.deferReply();

    const res = await client.kazagumo.search(query, { requester: interaction.user });
    if (!res.tracks.length) {
      await interaction.editReply({
        embeds: [UIManager.createErrorEmbed('No Results', `No tracks found for: \`${query}\``)]
      });
      return;
    }

    const tracks = res.tracks.slice(0, 5);
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('search_track_select')
      .setPlaceholder('Select a song to play 🎵')
      .addOptions(
        tracks.map((t, idx) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${idx + 1}. ${t.title.slice(0, 80)}`)
            .setDescription(`${t.author?.slice(0, 40) || 'Unknown'} • ${formatDuration(t.length)}`)
            .setValue(t.uri || t.title)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.editReply({
      embeds: [
        UIManager.createInfoEmbed(
          'Search Results',
          `Found **${tracks.length}** results for \`${query}\`. Please choose a track below:`
        )
      ],
      components: [row]
    });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    if (!args.length) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Query Required', 'Usage: `+search <song name>`')]
      });
      return;
    }

    const query = args.join(' ');
    const member = message.member;
    const voiceChannel = member?.voice?.channel;

    if (!voiceChannel) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Voice Channel Required', 'Please join a voice channel first.')]
      });
      return;
    }

    const res = await client.kazagumo.search(query, { requester: message.author });
    if (!res.tracks.length) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('No Results', `No tracks found for: \`${query}\``)]
      });
      return;
    }

    const tracks = res.tracks.slice(0, 5);
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('search_track_select')
      .setPlaceholder('Select a song to play 🎵')
      .addOptions(
        tracks.map((t, idx) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${idx + 1}. ${t.title.slice(0, 80)}`)
            .setDescription(`${t.author?.slice(0, 40) || 'Unknown'} • ${formatDuration(t.length)}`)
            .setValue(t.uri || t.title)
        )
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await message.reply({
      embeds: [
        UIManager.createInfoEmbed(
          'Search Results',
          `Found **${tracks.length}** results for \`${query}\`. Please select one below:`
        )
      ],
      components: [row]
    });
  }
};
