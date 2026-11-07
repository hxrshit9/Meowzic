import { Collection } from 'discord.js';
import { MeowzicClient } from '../client/MeowzicClient.js';
import { Command } from '../types/index.js';
import { Logger } from '../utils/logger.js';

// Music commands
import { PlayCommand } from '../commands/music/play.js';
import { PauseCommand } from '../commands/music/pause.js';
import { ResumeCommand } from '../commands/music/resume.js';
import { SkipCommand } from '../commands/music/skip.js';
import { SkipToCommand } from '../commands/music/skipto.js';
import { PreviousCommand } from '../commands/music/previous.js';
import { StopCommand } from '../commands/music/stop.js';
import { QueueCommand } from '../commands/music/queue.js';
import { NowPlayingCommand } from '../commands/music/nowplaying.js';
import { VolumeCommand } from '../commands/music/volume.js';
import { LoopCommand } from '../commands/music/loop.js';
import { ShuffleCommand } from '../commands/music/shuffle.js';
import { ClearCommand } from '../commands/music/clear.js';
import { SeekCommand } from '../commands/music/seek.js';
import { SearchCommand } from '../commands/music/search.js';
import { LyricsCommand } from '../commands/music/lyrics.js';
import { AutoplayCommand } from '../commands/music/autoplay.js';

// Filter commands
import { FilterCommand } from '../commands/filters/filter.js';

// Utility commands
import { HelpCommand } from '../commands/utility/help.js';
import { PingCommand } from '../commands/utility/ping.js';
import { StatsCommand } from '../commands/utility/stats.js';
import { NodeCommand } from '../commands/utility/node.js';
import { Mode247Command } from '../commands/utility/mode247.js';

export class CommandHandler {
  constructor(private client: MeowzicClient) {}

  public async loadCommands(): Promise<void> {
    const commandsList: Command[] = [
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

    for (const cmd of commandsList) {
      this.client.commands.set(cmd.name, cmd);
      if (cmd.aliases && Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) {
          this.client.aliases.set(alias, cmd.name);
        }
      }
    }

    Logger.success(`Registered ${this.client.commands.size} commands (${this.client.aliases.size} aliases)`, 'CommandHandler');
  }
}
