import { Client } from '@elastic/elasticsearch';

import { config } from './config.js';

let client

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

  static async write(type, data) {
    return client.index({
      index: 'discord',
      document: {
        type,
        ...data,
      }
    })
  }

  static async search({ content }) {
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
            fields: [
              // ^3 to boost messages where main content is found
              'content^3',
              'attachments'
            ],
          }
        }
      }
    })
  }

  static async findRelated(channelId, timestamp, order, limit = 5) {
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
      body.sort = {
        timestamp: {
          order: 'desc'
        }
      }
      body.query.bool.must.push({
        range: {
          timestamp: {
            lte: timestamp
          }
        }
      })
    } else {
      body.sort = {
        timestamp: {
          order: 'asc'
        }
      }
      body.query.bool.must.push({
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

  static async getOne(id) {
    const response = await client.get({
      index: 'discord',
      id
    })
    return response._source
  }

  static async getOneBasedOnTimestamp(channelId, order) {
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