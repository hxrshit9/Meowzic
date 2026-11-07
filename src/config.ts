import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  DISCORD_TOKEN: z.string().default(''),
  CLIENT_ID: z.string().default(''),
  DEFAULT_PREFIX: z.string().default('+'),
  DEFAULT_VOLUME: z.coerce.number().min(1).max(150).default(80),
  
  // Lavalink Primary Node
  LAVALINK_HOST: z.string().default('lavalink.nazha.online'),
  LAVALINK_PORT: z.coerce.number().default(443),
  LAVALINK_PASSWORD: z.string().default('nazhafreelava'),
  LAVALINK_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  LAVALINK_NAME: z.string().default('Global-Lavalink-v4'),

  // Fallback Lavalink Node
  FALLBACK_LAVALINK_HOST: z.string().default('lava-v4.millohost.my.id'),
  FALLBACK_LAVALINK_PORT: z.coerce.number().default(443),
  FALLBACK_LAVALINK_PASSWORD: z.string().default('https://discord.gg/mjS5J2K3ep'),
  FALLBACK_LAVALINK_SECURE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),

  // Spotify (Optional)
  SPOTIFY_CLIENT_ID: z.string().optional().default(''),
  SPOTIFY_CLIENT_SECRET: z.string().optional().default(''),

  // Branding
  EMBED_COLOR: z.string().default('#7C3AED'),
  BOT_ACTIVITY_NAME: z.string().default('Meowzic | /play'),
  BOT_ACTIVITY_TYPE: z.string().default('LISTENING')
});

export const config = ConfigSchema.parse(process.env);
export type Config = z.infer<typeof ConfigSchema>;
