import { ChatInputCommandInteraction, SlashCommandBuilder, Message, EmbedBuilder } from 'discord.js';
import os from 'os';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { formatBytes, formatDuration } from '../../utils/formatters.js';

export const StatsCommand: Command = {
  name: 'stats',
  description: 'View bot statistics, host memory, and active player metrics',
  category: 'utility',
  aliases: ['botinfo', 'info'],
  slashCommand: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot statistics, host memory, and active player metrics'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const embed = buildStatsEmbed(client);
    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const embed = buildStatsEmbed(client);
    await message.reply({ embeds: [embed] });
  }
};

function buildStatsEmbed(client: MeowzicClient): EmbedBuilder {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  const totalGuilds = client.guilds.cache.size;
  const totalUsers = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  const activePlayers = client.kazagumo.players.size;

  const uptime = formatDuration(client.uptime || 0);

  return new EmbedBuilder()
    .setColor(UIManager.BRAND_COLOR)
    .setTitle('🐾 Meowzic System Statistics')
    .addFields(
      {
        name: '📊 Guild & Audio Metrics',
        value:
          `• **Guilds:** \`${totalGuilds}\`\n` +
          `• **Total Users:** \`${totalUsers}\`\n` +
          `• **Active Voice Streams:** \`${activePlayers}\`\n` +
          `• **Client Uptime:** \`${uptime}\``,
        inline: true
      },
      {
        name: '💻 System Resources',
        value:
          `• **Node.js:** \`${process.version}\`\n` +
          `• **Process Heap:** \`${formatBytes(memUsage.heapUsed)} / ${formatBytes(memUsage.heapTotal)}\`\n` +
          `• **RSS Memory:** \`${formatBytes(memUsage.rss)}\`\n` +
          `• **System RAM:** \`${formatBytes(totalMem - freeMem)} / ${formatBytes(totalMem)}\``,
        inline: true
      },
      {
        name: '⚡ Audio Engine',
        value:
          `• **Lavalink Nodes:** \`${client.kazagumo.shoukaku.nodes.size}\`\n` +
          `• **Library:** \`discord.js v14\`\n` +
          `• **Architecture:** \`Lavalink v4 + FFmpeg\``,
        inline: false
      }
    )
    .setFooter({ text: 'Meowzic Core Metrics' })
    .setTimestamp();
}
