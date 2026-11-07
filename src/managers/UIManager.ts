import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  User,
  ColorResolvable
} from 'discord.js';
import { KazagumoPlayer, KazagumoTrack } from 'kazagumo';
import { config } from '../config.js';
import { formatDuration, createProgressBar } from '../utils/formatters.js';

export class UIManager {
  public static readonly BRAND_COLOR: ColorResolvable = (config.EMBED_COLOR || '#7C3AED') as ColorResolvable;
  public static readonly ERROR_COLOR: ColorResolvable = '#EF4444';
  public static readonly SUCCESS_COLOR: ColorResolvable = '#10B981';

  /**
   * Build the rich "Now Playing" embed
   */
  public static createNowPlayingEmbed(player: KazagumoPlayer, track: KazagumoTrack): EmbedBuilder {
    const position = player.position || 0;
    const duration = track.length || 0;
    const isLive = track.isStream;
    const requester = track.requester as User | undefined;

    const progressBar = isLive
      ? '🔴 LIVE STREAM'
      : `${createProgressBar(position, duration, 14)} \`[${formatDuration(position)} / ${formatDuration(duration)}]\``;

    const loopMode = player.loop === 'track' ? '🔂 Track' : player.loop === 'queue' ? '🔁 Queue' : 'Off';
    const volume = player.volume;
    const autoplay = (player.data.get('autoplay') as boolean) ? '✅ Enabled' : '❌ Disabled';

    const embed = new EmbedBuilder()
      .setColor(this.BRAND_COLOR)
      .setAuthor({
        name: 'Now Playing 🎵',
        iconURL: requester?.displayAvatarURL() || undefined
      })
      .setTitle(track.title.length > 256 ? track.title.slice(0, 253) + '...' : track.title)
      .setURL(track.uri || 'https://discord.com')
      .setDescription(
        `**Artist / Author:** \`${track.author || 'Unknown'}\`\n` +
        `**Requester:** ${requester ? `<@${requester.id}>` : '`Unknown`'}\n\n` +
        `${progressBar}\n`
      )
      .addFields(
        { name: '🔊 Volume', value: `\`${volume}%\``, inline: true },
        { name: '🔁 Loop', value: `\`${loopMode}\``, inline: true },
        { name: '📻 Autoplay', value: `\`${autoplay}\``, inline: true }
      )
      .setFooter({
        text: 'Meowzic • Ultra Low-Latency Audio Streaming',
        iconURL: 'https://cdn.discordapp.com/emojis/1049284988773994516.webp?size=96&quality=lossless'
      })
      .setTimestamp();

    if (track.thumbnail) {
      embed.setThumbnail(track.thumbnail);
    }

    return embed;
  }

  /**
   * Interactive ActionRow button controls for Now Playing
   */
  public static createPlayerButtons(player: KazagumoPlayer): ActionRowBuilder<ButtonBuilder>[] {
    const isPaused = player.paused;
    const loopMode = player.loop; // 'none' | 'track' | 'queue'
    const isAutoplay = Boolean(player.data.get('autoplay'));

    // Row 1: Core playback navigation
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('player_prev')
        .setEmoji('⏮️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_playpause')
        .setEmoji(isPaused ? '▶️' : '⏸️')
        .setStyle(isPaused ? ButtonStyle.Success : ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_skip')
        .setEmoji('⏭️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_stop')
        .setEmoji('⏹️')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('player_shuffle')
        .setEmoji('🔀')
        .setStyle(ButtonStyle.Secondary)
    );

    // Row 2: Queue, Volume, Loop and Autoplay utilities
    const loopLabel = loopMode === 'track' ? 'Track' : loopMode === 'queue' ? 'Queue' : 'Loop';
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('player_loop')
        .setEmoji('🔁')
        .setLabel(loopLabel)
        .setStyle(loopMode !== 'none' ? ButtonStyle.Primary : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_voldown')
        .setEmoji('🔉')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_volup')
        .setEmoji('🔊')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_queue')
        .setEmoji('📜')
        .setLabel('Queue')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_autoplay')
        .setEmoji('📻')
        .setLabel(isAutoplay ? 'Auto: ON' : 'Auto: OFF')
        .setStyle(isAutoplay ? ButtonStyle.Success : ButtonStyle.Secondary)
    );

    return [row1, row2];
  }

  /**
   * Embed when a track is added to the queue
   */
  public static createTrackAddedEmbed(track: KazagumoTrack, queuePosition: number): EmbedBuilder {
    const requester = track.requester as User | undefined;
    return new EmbedBuilder()
      .setColor(this.BRAND_COLOR)
      .setAuthor({ name: 'Track Queued 🐾' })
      .setTitle(track.title)
      .setURL(track.uri || 'https://discord.com')
      .setDescription(
        `**Author:** \`${track.author || 'Unknown'}\`\n` +
        `**Duration:** \`${track.isStream ? 'Live' : formatDuration(track.length)}\`\n` +
        `**Position in Queue:** \`#${queuePosition}\`\n` +
        `**Requested by:** ${requester ? `<@${requester.id}>` : '`Unknown`'}`
      )
      .setThumbnail(track.thumbnail || null)
      .setFooter({ text: 'Meowzic Music Player' })
      .setTimestamp();
  }

  /**
   * Embed when a playlist is added
   */
  public static createPlaylistAddedEmbed(
    name: string,
    tracksCount: number,
    durationMs: number,
    requester?: User
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(this.BRAND_COLOR)
      .setAuthor({ name: 'Playlist Queued 🎶' })
      .setTitle(name)
      .setDescription(
        `**Tracks Added:** \`${tracksCount}\`\n` +
        `**Total Duration:** \`${formatDuration(durationMs)}\`\n` +
        `**Requested by:** ${requester ? `<@${requester.id}>` : '`Unknown`'}`
      )
      .setFooter({ text: 'Meowzic Music Player' })
      .setTimestamp();
  }

  /**
   * Build Queue listing embed
   */
  public static createQueueEmbed(player: KazagumoPlayer, page: number = 1): EmbedBuilder {
    const queue = player.queue;
    const current = player.queue.current;
    const totalTracks = queue.length;
    const totalPages = Math.max(1, Math.ceil(totalTracks / 10));
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (currentPage - 1) * 10;
    const slice = queue.slice(startIndex, startIndex + 10);

    let description = '';
    if (current) {
      description += `**Now Playing:**\n[${current.title}](${current.uri || 'https://discord.com'}) | \`${formatDuration(current.length)}\`\n\n`;
    }

    if (slice.length === 0) {
      description += '*No upcoming tracks in queue.*';
    } else {
      description += '**Up Next:**\n';
      slice.forEach((track, i) => {
        const index = startIndex + i + 1;
        description += `\`${index}.\` [${track.title.slice(0, 50)}](${track.uri || 'https://discord.com'}) - \`${formatDuration(track.length)}\`\n`;
      });
    }

    const totalDuration = player.queue.durationLength + (current?.length || 0);

    return new EmbedBuilder()
      .setColor(this.BRAND_COLOR)
      .setTitle(`🐾 Meowzic Queue — Total: ${totalTracks} tracks`)
      .setDescription(description)
      .setFooter({
        text: `Page ${currentPage}/${totalPages} • Total Queue Duration: ${formatDuration(totalDuration)}`
      })
      .setTimestamp();
  }

  /**
   * Generic Success Embed
   */
  public static createSuccessEmbed(title: string, message?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(this.SUCCESS_COLOR)
      .setTitle(`🐾 ${title}`);
    if (message) embed.setDescription(message);
    return embed;
  }

  /**
   * Generic Error Embed
   */
  public static createErrorEmbed(title: string, message?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(this.ERROR_COLOR)
      .setTitle(`❌ ${title}`);
    if (message) embed.setDescription(message);
    return embed;
  }

  /**
   * Generic Info Embed
   */
  public static createInfoEmbed(title: string, message?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(this.BRAND_COLOR)
      .setTitle(`ℹ️ ${title}`);
    if (message) embed.setDescription(message);
    return embed;
  }
}
