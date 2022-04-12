import { Collection, Message } from 'discord.js';
import hasha from 'hasha';

import { getDiscordClient } from '../../discord';
import { IDocument } from '../../types/Document';
import { Search } from '../search';
import { Ingester } from './base';

export class DiscordIngester extends Ingester {
  constructor(private channelId: string) {
    super();
    this.channelId = channelId;
  }

  protected async init() {
    console.log(`Starting ingestion of channel ${this.channelId}`);
  }

  async intervalFunction() {
    console.log("Running Discord ingester");
    const channel = await (
      await getDiscordClient()
    ).channels.fetch(this.channelId);

    if (!channel || channel.type !== "GUILD_TEXT") {
      console.log(`Channel ${this.channelId} is not a text channel`);
      return;
    }

    const newest = await Search.getNewest();
    const oldest = await Search.getOldest();

    let discordMessages: Array<Promise<Collection<string, Message<boolean>>>> = [];

    if (!newest || !oldest) {
      discordMessages = [channel.messages.fetch({ limit: 100 })]
    } else {
      discordMessages = [
        channel.messages.fetch({ limit: 100, after: newest.platformId }),
        channel.messages.fetch({ limit: 100, before: oldest.platformId }),
      ]
    }


    const messages = (await Promise.all(discordMessages)).map(m => Array.from(m.values())).flat().sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const docs: IDocument[] = messages.map((m) => {
      return {
        uid: `discord:${m.id}`,
        discordId: m.id,
        timestamp: m.createdTimestamp,
        content: m.cleanContent ? m.cleanContent : m.content,
        author: hasha(m.author.id),
        platformType: "discord",
        platformChannelId: m.channel.id,
        platformGuildId: m.guildId,
        platformId: m.id,
        attachments: Array.from(m.attachments.mapValues(a => ({ url: a.url, contentType: a.contentType })).values()),
      };
    });

    if (docs.length) {
      await Search.write(docs);
      console.log(`Wrote ${docs.length} messages to search index.`, {
        channel: this.channelId,
        newest: new Date(docs[0].timestamp).toISOString(),
        oldest: new Date(docs[docs.length - 1].timestamp).toISOString(),
      });
    }
  }
}
