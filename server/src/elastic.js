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

  static async write(data) {
    return client.index({
      index: 'discord',
      document: {
        type: 'message',
        ...data,
      }
    })
  }

  static async search({ content }) {
    return client.search({
      index: 'discord',
      body: {
        query: {
          match: {
            content
          }
        }
      }
    })
  }

  static async findRelated(channelId, timestamp) {
    const response = await client.search({
      index: 'discord',
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  channel: channelId
                }
              },
              {
                range: {
                  timestamp: {
                    gte: timestamp
                  }
                }
              }
            ]
          }
        },
        sort: {
          timestamp: {
            order: 'asc'
          }
        },
        size: 25
      }
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

    const response = await client.search({
      index: 'discord',
      body: {
        query: {
          match: {
            channel: channelId
          }
        },
        sort: {
          timestamp: {
            order: order === 'asc' ? 'desc' : 'asc'
          }
        },
        size: 1
      }
    })
    if (response.hits.hits[0]) {
      return response.hits.hits[0]._source
    } else {
      return null;
    }
  }

}