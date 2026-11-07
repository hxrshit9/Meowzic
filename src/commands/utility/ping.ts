import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const PingCommand: Command = {
  name: 'ping',
  description: 'Check bot gateway latency and REST ping',
  category: 'utility',
  slashCommand: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot gateway latency and REST ping'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const wsPing = client.ws.ping;
    const sent = await interaction.reply({
      embeds: [UIManager.createInfoEmbed('Pinging...', 'Measuring latency...')],
      fetchReply: true
    });

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      embeds: [
        UIManager.createSuccessEmbed(
          'Pong! 🏓',
          `📡 **Gateway Ping:** \`${wsPing}ms\`\n⚡ **Roundtrip Latency:** \`${roundtrip}ms\``
        )
      ]
    });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const wsPing = client.ws.ping;
    const sent = await message.reply({
      embeds: [UIManager.createInfoEmbed('Pinging...', 'Measuring latency...')]
    });

    const roundtrip = sent.createdTimestamp - message.createdTimestamp;

    await sent.edit({
      embeds: [
        UIManager.createSuccessEmbed(
          'Pong! 🏓',
          `📡 **Gateway Ping:** \`${wsPing}ms\`\n⚡ **Roundtrip Latency:** \`${roundtrip}ms\``
        )
      ]
    });
  }
};
