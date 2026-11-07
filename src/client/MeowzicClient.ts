import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType
} from 'discord.js';
import { Kazagumo, Plugins } from 'kazagumo';
import { Connectors, NodeOption } from 'shoukaku';
import SpotifyPlugin from 'kazagumo-spotify';
import { config } from '../config.js';
import { Command } from '../types/index.js';
import { Logger } from '../utils/logger.js';
import { CommandHandler } from '../handlers/CommandHandler.js';
import { EventHandler } from '../handlers/EventHandler.js';

export class MeowzicClient extends Client {
  public commands: Collection<string, Command> = new Collection();
  public aliases: Collection<string, string> = new Collection();
  public kazagumo: Kazagumo;
  public commandHandler: CommandHandler;
  public eventHandler: EventHandler;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
      presence: {
        activities: [
          {
            name: config.BOT_ACTIVITY_NAME,
            type: ActivityType.Listening
          }
        ],
        status: 'online'
      }
    });

    const nodes: NodeOption[] = [
      {
        name: config.LAVALINK_NAME,
        url: `${config.LAVALINK_HOST}:${config.LAVALINK_PORT}`,
        auth: config.LAVALINK_PASSWORD,
        secure: config.LAVALINK_SECURE
      }
    ];

    if (config.FALLBACK_LAVALINK_HOST) {
      nodes.push({
        name: 'Fallback-Lavalink',
        url: `${config.FALLBACK_LAVALINK_HOST}:${config.FALLBACK_LAVALINK_PORT}`,
        auth: config.FALLBACK_LAVALINK_PASSWORD,
        secure: config.FALLBACK_LAVALINK_SECURE
      });
    }

    const kazagumoPlugins: any[] = [];
    if (config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET) {
      kazagumoPlugins.push(
        new SpotifyPlugin({
          clientId: config.SPOTIFY_CLIENT_ID,
          clientSecret: config.SPOTIFY_CLIENT_SECRET
        })
      );
    }

    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: 'youtube',
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        plugins: kazagumoPlugins
      },
      new Connectors.DiscordJS(this),
      nodes,
      {
        moveOnDisconnect: true,
        resume: true,
        reconnectTries: 10,
        restTimeout: 15000
      }
    );

    this.commandHandler = new CommandHandler(this);
    this.eventHandler = new EventHandler(this);
  }

  public async start(): Promise<void> {
    Logger.info('Initializing Meowzic system modules...', 'Startup');

    // Load commands and event handlers
    await this.commandHandler.loadCommands();
    this.eventHandler.registerEvents();

    if (!config.DISCORD_TOKEN) {
      Logger.warn(
        'No DISCORD_TOKEN found in .env! Meowzic is primed and ready. Please add your token to .env to connect to Discord.',
        'Auth'
      );
      return;
    }

    try {
      await this.login(config.DISCORD_TOKEN);
      Logger.success('Successfully logged into Discord Gateway!', 'Client');
    } catch (error) {
      Logger.error('Failed to log into Discord Gateway', error, 'Client');
    }
  }
}
