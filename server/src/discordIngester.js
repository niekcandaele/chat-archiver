import axios from 'axios';
import hasha from 'hasha';

import { config } from './config.js';
import { getDiscordClient } from './discord.js';
import { Elastic } from './elastic.js';

export class DiscordIngester {
  constructor(channelId, direction) {
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

    try {
      const cursorInElastic = await Elastic.getOneBasedOnTimestamp(this.channelId, this.direction);
      if (cursorInElastic) {
        messageId = cursorInElastic.discordId;
        timestamp = new Date(cursorInElastic.timestamp);
      }

    } catch (error) {
      if (error.message.includes(`index_not_found_exception`)) {
        console.log(`New install, no data in Elastic found. Falling back to Discord for init`);

      } else if (error.message.includes(`No mapping found for [timestamp]`)) {
        console.log(`No documents in Elastic found. Falling back to Discord for init`);
      } else {
        throw error
      }
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

  async _downloadFile(url) {
    return axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
    }).then((response) => {
      return response.data
    });
  }

  async getAttachments(message) {
    const { attachments } = message;

    const results = await Promise.all(Array.from(attachments.values()).map(async (attachment) => {
      if (!attachment.contentType || !attachment.contentType.includes('text/plain')) {
        console.log(`Content type ${attachment.contentType} is not text/plain, skipping`)
        return null
      }

      if (attachment.size > config.get('discord.maxAttachmentSize')) {
        console.log(`Attachment is larger (${attachment.size}) than maxAttachmentSize (${config.get('maxAttachmentSize')}), skipping`)
        return null
      }

      return this._downloadFile(attachment.url);
    }))

    return results.filter(Boolean)
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
        if (!message.content && message.attachments.size === 0) {
          // Nothing in the message, so nothing to save
          return;
        }

        const attachments = await this.getAttachments(message);
        const type = attachments.length > 0 ? 'messageWithAttachments' : 'message';
        await Elastic.write(type, {
          content: message.cleanContent ? message.cleanContent : message.content,
          author: hasha(message.author.id),
          channel: message.channel.id,
          timestamp: message.createdAt,
          discordId: message.id,
          attachments
        });
        return message
      }))

      console.log(`Wrote ${results.length} messages to elastic for channel ${this.channelId}. Message timestamp: ${cursor.timestamp}`);

      if (!results.length && this.direction === 'desc') {
        console.log(`Scraped all messages for channel ${this.channelId} in direction ${this.direction}`);
        this.stop();
      }
    } catch (error) {
      console.error(error);
    }
  }
}