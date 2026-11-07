import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { Logger } from './utils/logger.js';

// Music commands
import { PlayCommand } from './commands/music/play.js';
import { PauseCommand } from './commands/music/pause.js';
import { ResumeCommand } from './commands/music/resume.js';
import { SkipCommand } from './commands/music/skip.js';
import { SkipToCommand } from './commands/music/skipto.js';
import { PreviousCommand } from './commands/music/previous.js';
import { StopCommand } from './commands/music/stop.js';
import { QueueCommand } from './commands/music/queue.js';
import { NowPlayingCommand } from './commands/music/nowplaying.js';
import { VolumeCommand } from './commands/music/volume.js';
import { LoopCommand } from './commands/music/loop.js';
import { ShuffleCommand } from './commands/music/shuffle.js';
import { ClearCommand } from './commands/music/clear.js';
import { SeekCommand } from './commands/music/seek.js';
import { SearchCommand } from './commands/music/search.js';
import { LyricsCommand } from './commands/music/lyrics.js';
import { AutoplayCommand } from './commands/music/autoplay.js';

// Filter commands
import { FilterCommand } from './commands/filters/filter.js';

// Utility commands
import { HelpCommand } from './commands/utility/help.js';
import { PingCommand } from './commands/utility/ping.js';
import { StatsCommand } from './commands/utility/stats.js';
import { NodeCommand } from './commands/utility/node.js';
import { Mode247Command } from './commands/utility/mode247.js';

async function deploySlashCommands() {
  if (!config.DISCORD_TOKEN) {
    Logger.error('Cannot deploy slash commands: Missing DISCORD_TOKEN in .env', undefined, 'Deploy');
    process.exit(1);
  }

  const commandsList = [
    PlayCommand,
    PauseCommand,
    ResumeCommand,
    SkipCommand,
    SkipToCommand,
    PreviousCommand,
    StopCommand,
    QueueCommand,
    NowPlayingCommand,
    VolumeCommand,
    LoopCommand,
    ShuffleCommand,
    ClearCommand,
    SeekCommand,
    SearchCommand,
    LyricsCommand,
    AutoplayCommand,
    FilterCommand,
    HelpCommand,
    PingCommand,
    StatsCommand,
    NodeCommand,
    Mode247Command
  ];

  const slashPayload = commandsList
    .filter((c) => c.slashCommand)
    .map((c) => c.slashCommand!.toJSON());

  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  try {
    Logger.info(`Started refreshing ${slashPayload.length} application (/) commands...`, 'Deploy');

    let clientId = config.CLIENT_ID;
    if (!clientId) {
      // Fetch application id automatically from Discord token
      const me = (await rest.get(Routes.user('@me'))) as { id: string };
      clientId = me.id;
      Logger.info(`Auto-detected Client ID from token: ${clientId}`, 'Deploy');
    }

    const data = (await rest.put(Routes.applicationCommands(clientId), {
      body: slashPayload
    })) as unknown[];

    Logger.success(`Successfully registered ${data.length} application (/) commands globally!`, 'Deploy');
  } catch (error) {
    Logger.error('Failed to deploy application commands to Discord API', error, 'Deploy');
    process.exit(1);
  }
}

deploySlashCommands();
