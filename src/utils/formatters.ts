/**
 * Format milliseconds into MM:SS or HH:MM:SS
 */
export function formatDuration(ms: number | undefined | null): string {
  if (!ms || isNaN(ms) || ms < 0) return '00:00';
  if (ms >= 86400000000) return 'Live Stream'; // Infinity / Live stream check

  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Parses time strings like "1:30", "90s", "2m", "02:45:10" into milliseconds
 */
export function parseTimeString(timeStr: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toLowerCase();

  // e.g. 90s, 2m, 1h
  if (/^\d+[smh]$/.test(cleaned)) {
    const val = parseInt(cleaned.slice(0, -1), 10);
    const unit = cleaned.slice(-1);
    if (unit === 's') return val * 1000;
    if (unit === 'm') return val * 60 * 1000;
    if (unit === 'h') return val * 60 * 60 * 1000;
  }

  // e.g. 01:30 or 01:20:15
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':').map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) {
      return (parts[0] * 60 + parts[1]) * 1000;
    }
    if (parts.length === 3) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
  }

  // purely numeric seconds
  const num = parseInt(cleaned, 10);
  if (!isNaN(num) && num >= 0) {
    return num * 1000;
  }

  return null;
}

/**
 * Creates a visual Unicode progress bar for Discord embeds
 */
export function createProgressBar(
  current: number,
  total: number,
  barLength: number = 14,
  line: string = '▬',
  slider: string = '🔘'
): string {
  if (!total || total <= 0 || current < 0) {
    return `${slider}${line.repeat(barLength - 1)}`;
  }
  const progress = Math.min(Math.max(current / total, 0), 1);
  const position = Math.round(progress * (barLength - 1));

  const bar = line.repeat(position) + slider + line.repeat(barLength - 1 - position);
  return bar;
}

/**
 * Format bytes to readable string (MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
