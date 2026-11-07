import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { FilterManager, FilterPreset } from '../../managers/FilterManager.js';

export const FilterCommand: Command = {
  name: 'filter',
  description: 'Apply audio effects (bassboost, 8D, nightcore, lofi, etc.)',
  category: 'filters',
  aliases: ['filters', 'fx'],
  usage: '<preset>',
  slashCommand: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply real-time audio filters and sound effects')
    .addStringOption((opt) =>
      opt
        .setName('preset')
        .setDescription('Filter effect to apply')
        .setRequired(true)
        .addChoices(
          { name: 'Reset / Clear All Filters', value: 'reset' },
          { name: 'Low Bassboost', value: 'bassboost_low' },
          { name: 'Medium Bassboost', value: 'bassboost_medium' },
          { name: 'High Bassboost', value: 'bassboost_high' },
          { name: '8D Audio (Rotating Stereo)', value: '8d' },
          { name: 'Nightcore (Speed & Pitch Boost)', value: 'nightcore' },
          { name: 'Vaporwave (Slowed & Reverb)', value: 'vaporwave' },
          { name: 'Lo-Fi (Chill / Warm Bass)', value: 'lofi' },
          { name: 'Karaoke (Vocal Suppression)', value: 'karaoke' },
          { name: 'Tremolo', value: 'tremolo' },
          { name: 'Vibrato', value: 'vibrato' },
          { name: 'Treble Boost', value: 'treble' },
          { name: 'Speed 0.5x', value: 'speed_0.5' },
          { name: 'Speed 1.5x', value: 'speed_1.5' },
          { name: 'Speed 2.0x', value: 'speed_2.0' }
        )
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'Music must be playing to apply audio filters.')],
        ephemeral: true
      });
      return;
    }

    const preset = interaction.options.getString('preset', true) as FilterPreset;
    await interaction.deferReply();

    try {
      const response = await FilterManager.applyPreset(player, preset);
      await interaction.editReply({
        embeds: [UIManager.createSuccessEmbed('Audio Filter Applied', response)]
      });
    } catch {
      await interaction.editReply({
        embeds: [UIManager.createErrorEmbed('Filter Error', 'Failed to apply audio filter.')]
      });
    }
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'Music must be playing to apply audio filters.')]
      });
      return;
    }

    const arg = args[0]?.toLowerCase();
    if (!arg) {
      await message.reply({
        embeds: [
          UIManager.createInfoEmbed(
            'Available Audio Filters',
            'Usage: `+filter <preset>`\n\n' +
            '`reset` • `bassboost_low` • `bassboost_medium` • `bassboost_high`\n' +
            '`8d` • `nightcore` • `vaporwave` • `lofi` • `karaoke`\n' +
            '`tremolo` • `vibrato` • `treble` • `speed_0.5` • `speed_1.5` • `speed_2.0`'
          )
        ]
      });
      return;
    }

    try {
      const response = await FilterManager.applyPreset(player, arg as FilterPreset);
      await message.reply({
        embeds: [UIManager.createSuccessEmbed('Audio Filter Applied', response)]
      });
    } catch {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Filter Error', `Unknown filter: \`${arg}\`. Use \`+filter\` to list valid presets.`)]
      });
    }
  }
};
