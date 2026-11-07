import { ChatInputCommandInteraction, SlashCommandBuilder, Message } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const LoopCommand: Command = {
  name: 'loop',
  description: 'Cycle or set loop mode: off, track, or queue',
  category: 'music',
  usage: '[off | track | queue]',
  slashCommand: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set or cycle loop mode: off, track, or queue')
    .addStringOption((opt) =>
      opt
        .setName('mode')
        .setDescription('Loop mode')
        .setRequired(false)
        .addChoices(
          { name: 'Off (Disable Looping)', value: 'none' },
          { name: 'Track (Repeat Current Song)', value: 'track' },
          { name: 'Queue (Repeat Entire Queue)', value: 'queue' }
        )
    ),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const player = client.kazagumo.players.get(interaction.guildId!);
    if (!player || !player.queue.current) {
      await interaction.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')],
        ephemeral: true
      });
      return;
    }

    const chosenMode = interaction.options.getString('mode') as 'none' | 'track' | 'queue' | null;

    let targetMode: 'none' | 'track' | 'queue';
    if (chosenMode) {
      targetMode = chosenMode;
    } else {
      // Cycle: none -> track -> queue -> none
      if (player.loop === 'none') targetMode = 'track';
      else if (player.loop === 'track') targetMode = 'queue';
      else targetMode = 'none';
    }

    player.setLoop(targetMode);
    const label = targetMode === 'track' ? '🔂 Track' : targetMode === 'queue' ? '🔁 Queue' : 'Off';

    await interaction.reply({
      embeds: [UIManager.createSuccessEmbed('Loop Mode Updated', `Loop mode is now set to: **${label}**`)]
    });
  },

  async executePrefix(message: Message, args: string[], client: MeowzicClient) {
    const player = client.kazagumo.players.get(message.guildId!);
    if (!player || !player.queue.current) {
      await message.reply({
        embeds: [UIManager.createErrorEmbed('Nothing Playing', 'There is no music currently playing.')]
      });
      return;
    }

    const arg = args[0]?.toLowerCase();
    let targetMode: 'none' | 'track' | 'queue';

    if (arg === 'track' || arg === 'song' || arg === 'single') {
      targetMode = 'track';
    } else if (arg === 'queue' || arg === 'all') {
      targetMode = 'queue';
    } else if (arg === 'off' || arg === 'disable' || arg === 'none') {
      targetMode = 'none';
    } else {
      // Cycle
      if (player.loop === 'none') targetMode = 'track';
      else if (player.loop === 'track') targetMode = 'queue';
      else targetMode = 'none';
    }

    player.setLoop(targetMode);
    const label = targetMode === 'track' ? '🔂 Track' : targetMode === 'queue' ? '🔁 Queue' : 'Off';

    await message.reply({
      embeds: [UIManager.createSuccessEmbed('Loop Mode Updated', `Loop mode is now set to: **${label}**`)]
    });
  }
};
