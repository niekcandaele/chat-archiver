import { difference } from 'lodash';
import MeiliSearch, { MeiliSearchApiError } from 'meilisearch';

import { config } from '../../config';
import { IDocument } from '../../types/Document';

const client = new MeiliSearch({
  host: config.get('meilisearch.host'),
  apiKey: config.get('meilisearch.apiKey'),
})

const filterableAttributes: Array<keyof IDocument> = ['timestamp', 'platformChannelId', 'uid']
const sortableAttributes: Array<keyof IDocument> = ['timestamp']

export class Search {

  static getIndex() {
    const index = client.index<IDocument>('test-index');
    index.primaryKey = 'platformId';
    return index;
  }

  static async createIndex() {
    console.log('Creating a new index...');
    const task = await client.createIndex('test-index', {
      primaryKey: 'platformId',
    });
    await client.waitForTask(task.uid);
  }

  static async setup() {
    const index = Search.getIndex();
    try {
      await index.getStats()
    } catch (error) {
      const e = error as typeof MeiliSearchApiError.prototype;
      if (e.code && e.code === 'index_not_found') {
        await Search.createIndex();
      } else {
        throw error
      }
    }

    const activeFilters = await index.getFilterableAttributes();
    const activeSorters = await index.getSortableAttributes();

    const filterDiff = difference(filterableAttributes, activeFilters);
    if (filterDiff.length) {
      await index.updateFilterableAttributes(filterableAttributes);
    }

    const sortDiff = difference(sortableAttributes, activeSorters);
    if (sortDiff.length) {
      await index.updateSortableAttributes(sortableAttributes);
    }

  }

  static async getOne(id: string) {
    const index = Search.getIndex();
    const response = await index.search('*', {
      filter: `uid = "${id}"`,
    });
    return response.hits[0];
  }

  static async write(documents: IDocument[]) {
    const index = Search.getIndex();
    return index.addDocuments(documents);
  }

  static async search(content: string): Promise<IDocument[]> {
    const index = Search.getIndex();
    const response = await index.search(content);
    return response.hits as IDocument[];
  }

  static async findRelated(channelId: string, timestamp: string): Promise<IDocument[]> {
    const index = Search.getIndex();
    const before = await index.search('*', {
      limit: 5,
      filter: `timestamp < ${timestamp} AND platformChannelId=${channelId}`,
      sort: ['timestamp:desc'],
    })

    const after = await index.search('*', {
      limit: 20,
      filter: `timestamp >= ${timestamp} AND platformChannelId=${channelId}`,
      sort: ['timestamp:asc'],
    })
    return [...before.hits, ...after.hits] as IDocument[];
  }

  static async getOldest() {
    const index = this.getIndex();
    const response = await index.search('*', {
      limit: 1,
      sort: ['timestamp:asc'],
    })
    return response.hits[0] as IDocument;
  }

  static async getNewest() {
    const index = this.getIndex();
    const response = await index.search('*', {
      limit: 1,
      sort: ['timestamp:desc'],
    })
    return response.hits[0] as IDocument;
  }

  static async getStats() {
    const index = Search.getIndex();
    const stats = await index.getStats();

    return {
      total: stats.numberOfDocuments,
      channels: config.get('discord.channels').length,
      oldest: (await this.getOldest()).timestamp,
      newest: (await this.getNewest()).timestamp,
    };
  }

}