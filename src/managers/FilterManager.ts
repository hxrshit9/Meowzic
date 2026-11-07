import { KazagumoPlayer } from 'kazagumo';

export type FilterPreset =
  | 'reset'
  | 'bassboost_low'
  | 'bassboost_medium'
  | 'bassboost_high'
  | 'nightcore'
  | 'vaporwave'
  | '8d'
  | 'karaoke'
  | 'lofi'
  | 'tremolo'
  | 'vibrato'
  | 'treble'
  | 'speed_0.5'
  | 'speed_1.5'
  | 'speed_2.0';

export class FilterManager {
  /**
   * Applies an audio filter preset to the Kazagumo/Lavalink player
   */
  public static async applyPreset(player: KazagumoPlayer, preset: FilterPreset): Promise<string> {
    const shoukakuPlayer = player.shoukaku;
    if (!shoukakuPlayer) {
      throw new Error('Shoukaku player instance not available');
    }

    switch (preset) {
      case 'reset': {
        await shoukakuPlayer.clearFilters();
        player.data.set('filter', 'none');
        return 'All audio filters have been reset to normal.';
      }

      case 'bassboost_low': {
        await shoukakuPlayer.setFilters({
          equalizer: [
            { band: 0, gain: 0.15 },
            { band: 1, gain: 0.12 },
            { band: 2, gain: 0.08 },
            { band: 3, gain: 0.04 }
          ]
        });
        player.data.set('filter', 'bassboost_low');
        return 'Applied **Low Bassboost** filter.';
      }

      case 'bassboost_medium': {
        await shoukakuPlayer.setFilters({
          equalizer: [
            { band: 0, gain: 0.25 },
            { band: 1, gain: 0.2 },
            { band: 2, gain: 0.15 },
            { band: 3, gain: 0.1 },
            { band: 4, gain: 0.05 }
          ]
        });
        player.data.set('filter', 'bassboost_medium');
        return 'Applied **Medium Bassboost** filter.';
      }

      case 'bassboost_high': {
        await shoukakuPlayer.setFilters({
          equalizer: [
            { band: 0, gain: 0.35 },
            { band: 1, gain: 0.3 },
            { band: 2, gain: 0.25 },
            { band: 3, gain: 0.15 },
            { band: 4, gain: 0.1 }
          ]
        });
        player.data.set('filter', 'bassboost_high');
        return 'Applied **High Bassboost** filter.';
      }

      case 'nightcore': {
        await shoukakuPlayer.setFilters({
          timescale: {
            speed: 1.25,
            pitch: 1.25,
            rate: 1.0
          }
        });
        player.data.set('filter', 'nightcore');
        return 'Applied **Nightcore** filter (Speed & Pitch 1.25x).';
      }

      case 'vaporwave': {
        await shoukakuPlayer.setFilters({
          timescale: {
            speed: 0.85,
            pitch: 0.8,
            rate: 1.0
          }
        });
        player.data.set('filter', 'vaporwave');
        return 'Applied **Vaporwave** filter (Slowed & Reverb).';
      }

      case '8d': {
        await shoukakuPlayer.setFilters({
          rotation: {
            rotationHz: 0.2
          }
        });
        player.data.set('filter', '8d');
        return 'Applied **8D Audio** filter (Rotating stereo panning).';
      }

      case 'karaoke': {
        await shoukakuPlayer.setFilters({
          karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
          }
        });
        player.data.set('filter', 'karaoke');
        return 'Applied **Karaoke** filter (Vocal suppression).';
      }

      case 'lofi': {
        await shoukakuPlayer.setFilters({
          lowPass: {
            smoothing: 20.0
          },
          equalizer: [
            { band: 0, gain: 0.2 },
            { band: 1, gain: 0.15 },
            { band: 12, gain: -0.2 },
            { band: 13, gain: -0.3 },
            { band: 14, gain: -0.4 }
          ]
        });
        player.data.set('filter', 'lofi');
        return 'Applied **Lo-Fi** filter (Mellow bass, low-pass damped highs).';
      }

      case 'tremolo': {
        await shoukakuPlayer.setFilters({
          tremolo: {
            frequency: 4.0,
            depth: 0.6
          }
        });
        player.data.set('filter', 'tremolo');
        return 'Applied **Tremolo** filter.';
      }

      case 'vibrato': {
        await shoukakuPlayer.setFilters({
          vibrato: {
            frequency: 5.0,
            depth: 0.6
          }
        });
        player.data.set('filter', 'vibrato');
        return 'Applied **Vibrato** filter.';
      }

      case 'treble': {
        await shoukakuPlayer.setFilters({
          equalizer: [
            { band: 10, gain: 0.15 },
            { band: 11, gain: 0.2 },
            { band: 12, gain: 0.25 },
            { band: 13, gain: 0.3 },
            { band: 14, gain: 0.35 }
          ]
        });
        player.data.set('filter', 'treble');
        return 'Applied **Treble Boost** filter.';
      }

      case 'speed_0.5': {
        await shoukakuPlayer.setFilters({
          timescale: { speed: 0.5, pitch: 1.0, rate: 1.0 }
        });
        player.data.set('filter', 'speed_0.5');
        return 'Audio playback speed set to **0.5x**.';
      }

      case 'speed_1.5': {
        await shoukakuPlayer.setFilters({
          timescale: { speed: 1.5, pitch: 1.0, rate: 1.0 }
        });
        player.data.set('filter', 'speed_1.5');
        return 'Audio playback speed set to **1.5x**.';
      }

      case 'speed_2.0': {
        await shoukakuPlayer.setFilters({
          timescale: { speed: 2.0, pitch: 1.0, rate: 1.0 }
        });
        player.data.set('filter', 'speed_2.0');
        return 'Audio playback speed set to **2.0x**.';
      }

      default:
        throw new Error(`Unknown filter preset: ${preset}`);
    }
  }
}
