import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Message,
  AutocompleteInteraction
} from 'discord.js';
import { KazagumoPlayer } from 'kazagumo';
import { MeowzicClient } from '../client/MeowzicClient.js';

export interface Command {
  name: string;
  description: string;
  category: 'music' | 'filters' | 'utility' | 'settings';
  aliases?: string[];
  usage?: string;
  slashCommand?: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  executeSlash: (interaction: ChatInputCommandInteraction, client: MeowzicClient) => Promise<unknown>;
  executePrefix?: (message: Message, args: string[], client: MeowzicClient) => Promise<unknown>;
  autocomplete?: (interaction: AutocompleteInteraction, client: MeowzicClient) => Promise<unknown>;
}

export type LoopMode = 'off' | 'track' | 'queue';

export interface GuildSettings {
  guildId: string;
  prefix: string;
  defaultVolume: number;
  twentyFourSeven: boolean;
  autoplay: boolean;
  textChannelId?: string;
  djRoleId?: string;
}

export interface PlayerMetadata {
  channelId: string;
  voiceChannelId: string;
  guildId: string;
  lastMessageId?: string;
  twentyFourSeven?: boolean;
}

export interface ExtendedPlayer extends KazagumoPlayer {
  data: Map<string, unknown>;
}
