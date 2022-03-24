import axios from 'axios';
import hasha from 'hasha';

import { config } from './config.js';
import { getDiscordClient } from './discord.js';
import { Elastic } from './elastic.js';

export class DiscordIngester {
  channel: any;
  channelId: any;
  client: any;
  direction: any;
  interval: any;
  constructor(channelId: any, direction: any) {
    if (direction !== 'asc' && direction !== 'desc') {
      throw new Error('direction must be asc or desc')
    }

    this.channelId = channelId;
    this.direction = direction;
    this.interval;
  }

  async start() {
    console.log(`Starting ingestion of channel ${this.channelId}`)
    this.client = await getDiscordClient();
    this.channel = await this.client.channels.fetch(this.channelId);
    this.interval = setInterval(this.intervalFunc.bind(this), config.get('collectInterval'));
    await this.intervalFunc()
  }

  async getCursor() {
    let messageId = null;
    let timestamp = null;

    const cursorInElastic = await Elastic.getOneBasedOnTimestamp(this.channelId, this.direction);
    if (cursorInElastic) {
      messageId = cursorInElastic.discordId;
      timestamp = new Date(cursorInElastic.timestamp);
    }


    if (!messageId) {
      console.log(`Elastic has no messages for channel ${this.channelId}, fetching from Discord instead`)
      const lastMessage = await this.channel.messages.fetch({ limit: 1 });
      for (const [id, message] of lastMessage) {
        messageId = id;
        timestamp = new Date(message.createdTimestamp);
      }
    }

    return {
      messageId,
      timestamp,
    }
  }

  async stop() {
    clearInterval(this.interval);
  }

  async _downloadFile(url: any) {
    return axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      return response.data
    });
  }

  _isTextAttachment(contentType: any) {
    return contentType && contentType.includes('text/plain');
  }

  async getAttachments(message: any) {
    const { attachments } = message;

    const results = await Promise.all(Array.from(attachments.values()).map(async (attachment) => {
      const returnValue = {
        data: null,
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        url: attachment.url
      }

      // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
      if (this._isTextAttachment(attachment.contentType)) {
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        if (attachment.size < config.get('discord.maxAttachmentSize')) {
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          returnValue.data = await this._downloadFile(attachment.url)
        }
      }

      return returnValue
    }))

    return results;
  }

  async intervalFunc() {
    try {
      let messages = [];
      const cursor = await this.getCursor()

      if (this.direction === 'asc') {
        messages = await this.channel.messages.fetch({ after: cursor.messageId, limit: 100 })
      } else {
        messages = await this.channel.messages.fetch({ before: cursor.messageId, limit: 100 })
      }

      const results = await Promise.all(Array.from(messages.values()).map(async (message) => {
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        if (!message.content && message.attachments.size === 0) {
          // Nothing in the message, so nothing to save
          return;
        }

        const attachments = await this.getAttachments(message);
        const type = attachments.length > 0 ? 'messageWithAttachments' : 'message';
        await Elastic.write(type, {
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          content: message.cleanContent ? message.cleanContent : message.content,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          author: hasha(message.author.id),
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          timestamp: message.createdAt,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          discordId: message.id,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          channelId: message.channel.id,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          channelName: message.channel.name,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          guildId: message.guild.id,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          guildName: message.guild.name,
          // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
          isBot: message.author.bot,
          attachments
        });
        return message
      }))

      if (results.length) {
        console.log(`Wrote ${results.length} messages for channel ${this.channel.guild.name}-${this.channel.name}. Message timestamp: ${cursor.timestamp}`);
      }

      if (!results.length && this.direction === 'desc') {
        console.log(`Scraped all messages for channel ${this.channelId} in direction ${this.direction}`);
        this.stop();
      }
    } catch (error) {
      console.error(error);
    }
  }
}