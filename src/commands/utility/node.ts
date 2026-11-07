import { ChatInputCommandInteraction, SlashCommandBuilder, Message, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';
import { formatBytes, formatDuration } from '../../utils/formatters.js';

export const NodeCommand: Command = {
  name: 'node',
  description: 'Inspect status, latency, and load of all Lavalink audio nodes',
  category: 'utility',
  aliases: ['nodes', 'lavalink'],
  slashCommand: new SlashCommandBuilder()
    .setName('node')
    .setDescription('Inspect status, latency, and load of all Lavalink audio nodes'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const embed = buildNodeEmbed(client);
    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const embed = buildNodeEmbed(client);
    await message.reply({ embeds: [embed] });
  }
};

function buildNodeEmbed(client: MeowzicClient): EmbedBuilder {
  const nodes = client.kazagumo.shoukaku.nodes;
  const embed = new EmbedBuilder()
    .setColor(UIManager.BRAND_COLOR)
    .setTitle('⚡ Lavalink Cluster Health')
    .setDescription(`Total Nodes Configured: **${nodes.size}**`)
    .setTimestamp();

  for (const [name, node] of nodes) {
    const stats = node.stats;
    const stateStr = node.state === 2 ? '🟢 Connected' : node.state === 1 ? '🟡 Connecting' : '🔴 Disconnected';

    if (stats) {
      const cpuLoad = (stats.cpu.lavalinkLoad * 100).toFixed(1);
      const systemLoad = (stats.cpu.systemLoad * 100).toFixed(1);
      const usedMem = formatBytes(stats.memory.used);
      const allocatedMem = formatBytes(stats.memory.allocated);
      const uptime = formatDuration(stats.uptime);

      embed.addFields({
        name: `Node: ${name} [${stateStr}]`,
        value:
          `• **Players:** \`${stats.playingPlayers} playing / ${stats.players} total\`\n` +
          `• **Uptime:** \`${uptime}\`\n` +
          `• **CPU Load:** \`Lavalink: ${cpuLoad}% | System: ${systemLoad}%\`\n` +
          `• **Memory:** \`${usedMem} / ${allocatedMem}\`\n` +
          `• **Penalties:** \`${node.penalties}\``
      });
    } else {
      embed.addFields({
        name: `Node: ${name}`,
        value: `• **Status:** ${stateStr}\n• **Stats:** *Awaiting node statistics handshake...*`
      });
    }
  }

  return embed;
}
