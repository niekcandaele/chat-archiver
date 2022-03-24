import { Client } from '@elastic/elasticsearch';

import { config } from './config.js';

let client: any

if (config.get('env') === 'production') {
  client = new Client({
    cloud: {
      id: config.get('elastic.cloudId'),
    },
    auth: {
      username: config.get('elastic.authUserName'),
      password: config.get('elastic.authPassword'),
    },
  })
} else {
  client = new Client({
    node: config.get('elastic.node'),
    auth: {
      username: config.get('elastic.authUserName'),
      password: config.get('elastic.authPassword'),
    },
  })
}


export class Elastic {

  static async write(type: any, data: any) {
    return client.index({
      index: 'discord',
      document: {
        type,
        ...data,
      }
    })
  }

  static async search({
    content
  }: any) {
    return client.search({
      index: 'discord',
      body: {
        sort: [
          "_score",
          {
            timestamp: {
              order: 'desc'
            }
          },
        ],
        query: {
          multi_match: {
            query: content,
            fuzziness: 2,
            fields: [
              'content',
              'attachments'
            ],
          }
        }
      }
    })
  }

  static async findRelated(channelId: any, timestamp: any, order: any, limit = 5) {
    const body = {
      query: {
        bool: {
          must: [
            {
              match: {
                channelId
              }
            }
          ]
        }
      },
      size: limit
    }

    if (order === 'older') {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ query: {... Remove this comment to see the full error message
      body.sort = {
        timestamp: {
          order: 'desc'
        }
      }
      body.query.bool.must.push({
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ range: { timestamp: { lte: any... Remove this comment to see the full error message
        range: {
          timestamp: {
            lte: timestamp
          }
        }
      })
    } else {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ query: {... Remove this comment to see the full error message
      body.sort = {
        timestamp: {
          order: 'asc'
        }
      }
      body.query.bool.must.push({
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ range: { timestamp: { gte: any... Remove this comment to see the full error message
        range: {
          timestamp: {
            gte: timestamp
          }
        }
      })
    }

    const response = await client.search({
      index: 'discord',
      body
    })
    return response
  }

  static async getOne(id: any) {
    const response = await client.get({
      index: 'discord',
      id
    })
    return response._source
  }

  static async getOneBasedOnTimestamp(channelId: any, order: any) {
    if (order !== 'asc' && order !== 'desc') {
      throw new Error('order must be asc or desc')
    }

    const body = {
      size: 1,
      sort: {
        timestamp: {
          order: order === 'asc' ? 'desc' : 'asc'
        }
      },
    }

    if (channelId) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type '{ size: n... Remove this comment to see the full error message
      body.query = {
        match: {
          channelId
        }
      }
    }

    const response = await client.search({
      index: 'discord',
      body
    })
    if (response.hits.hits[0]) {
      return response.hits.hits[0]._source
    } else {
      return null;
    }
  }

  static async getStats() {
    const response = await client.indices.stats()

    const { docs } = response.indices.discord.total

    const oldest = await this.getOneBasedOnTimestamp(null, 'desc')
    const newest = await this.getOneBasedOnTimestamp(null, 'asc')

    return {
      total: docs.count,
      channels: config.get('discord.channels').length,
      oldest: oldest ? oldest.timestamp : null,
      newest: newest ? newest.timestamp : null,
    };
  }

}