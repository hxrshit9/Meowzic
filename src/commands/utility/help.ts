import { ChatInputCommandInteraction, SlashCommandBuilder, Message, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/index.js';
import { MeowzicClient } from '../../client/MeowzicClient.js';
import { UIManager } from '../../managers/UIManager.js';

export const HelpCommand: Command = {
  name: 'help',
  description: 'Display all Meowzic commands and usage guide',
  category: 'utility',
  aliases: ['h', 'commands'],
  slashCommand: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all Meowzic commands and usage guide'),

  async executeSlash(interaction: ChatInputCommandInteraction, client: MeowzicClient) {
    const embed = buildHelpEmbed(client);
    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message: Message, _args: string[], client: MeowzicClient) {
    const embed = buildHelpEmbed(client);
    await message.reply({ embeds: [embed] });
  }
};

function buildHelpEmbed(client: MeowzicClient): EmbedBuilder {
  const musicCmds = [
    '`/play <query>` - Play song/playlist from YouTube, Spotify, etc.',
    '`/pause` - Pause playback',
    '`/resume` - Resume playback',
    '`/skip` - Skip current track',
    '`/skipto <position>` - Jump to position in queue',
    '`/previous` - Replay previous track from history',
    '`/stop` - Stop playback, clear queue, and leave voice',
    '`/queue [page]` - Display upcoming tracks',
    '`/nowplaying` - Show current track with interactive controls',
    '`/volume <1-150>` - Change playback volume',
    '`/loop [off|track|queue]` - Set repeat mode',
    '`/shuffle` - Randomize track order in queue',
    '`/clear` - Clear all upcoming queue tracks',
    '`/seek <time>` - Seek to timestamp (e.g. 1:30)',
    '`/search <query>` - Interactive 5-result picker',
    '`/lyrics [title]` - Fetch synchronized/plain lyrics',
    '`/autoplay` - Toggle smart recommendation engine'
  ];

  const filterCmds = [
    '`/filter <preset>` - Real-time Lavalink audio DSP:',
    '• `bassboost_low`, `bassboost_medium`, `bassboost_high`',
    '• `8d`, `nightcore`, `vaporwave`, `lofi`, `karaoke`',
    '• `tremolo`, `vibrato`, `treble`, `speed_0.5`, `speed_1.5`, `reset`'
  ];

  const utilCmds = [
    '`/247` - Keep bot in voice channel 24/7',
    '`/node` - Inspect Lavalink server node health',
    '`/ping` - Check bot gateway and WebSocket latency',
    '`/stats` - System resources and active stream metrics',
    '`/help` - Show this menu'
  ];

  return new EmbedBuilder()
    .setColor(UIManager.BRAND_COLOR)
    .setAuthor({
      name: 'Meowzic Music Bot — Command Guide 🐾',
      iconURL: client.user?.displayAvatarURL()
    })
    .setDescription(
      '**Meowzic** is a high-fidelity Discord music bot engineered with TypeScript, discord.js, Lavalink v4, and FFmpeg.\n' +
      'All commands work seamlessly as both **Slash Commands** (`/`) and **Prefix Commands** (`+`).'
    )
    .addFields(
      { name: '🎵 Music Commands', value: musicCmds.join('\n') },
      { name: '🎛️ Audio Filters', value: filterCmds.join('\n') },
      { name: '⚙️ Utilities & Info', value: utilCmds.join('\n') }
    )
    .setFooter({ text: 'Meowzic • Ultra Low-Latency Audio Streaming' })
    .setTimestamp();
}
