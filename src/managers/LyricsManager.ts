export interface LyricsResult {
  title: string;
  artist: string;
  lyrics: string;
  syncedLyrics?: string;
}

export class LyricsManager {
  /**
   * Cleans YouTube video titles to extract the core song title
   */
  public static cleanTitle(rawTitle: string): string {
    return rawTitle
      .replace(/\[.*?\]|\(.*?\)/g, '') // remove [...] and (...)
      .replace(/official\s+video|official\s+audio|lyric\s+video|music\s+video|4k|hd|remastered/gi, '')
      .replace(/ft\..*|feat\..*/gi, '')
      .replace(/\|\s*.*$/g, '')
      .trim();
  }

  /**
   * Search for lyrics via Lrclib API
   */
  public static async fetchLyrics(trackTitle: string, artist?: string): Promise<LyricsResult | null> {
    const cleanedTitle = this.cleanTitle(trackTitle);
    const query = artist ? `${cleanedTitle} ${artist}` : cleanedTitle;

    try {
      // 1. Try exact search
      const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Meowzic-Discord-Bot/1.0' }
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        // Find best match with lyrics
        const match = data.find((item) => item.plainLyrics || item.syncedLyrics);
        if (match) {
          return {
            title: match.trackName,
            artist: match.artistName,
            lyrics: match.plainLyrics || match.syncedLyrics,
            syncedLyrics: match.syncedLyrics
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}
