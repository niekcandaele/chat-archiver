import convict from 'convict';
import * as dotenv from 'dotenv';


function getConfig() {
  dotenv.config()

  const config = convict({
    env: {
      doc: 'The application environment.',
      format: ['production', 'development', 'test'],
      default: 'development',
      env: 'NODE_ENV'
    },
    collectInterval: {
      doc: 'The interval in milliseconds to collect messages from Discord.',
      format: 'integer',
      default: 30000,
      env: 'COLLECT_INTERVAL'
    },
    http: {
      port: {
        doc: 'The port to listen on.',
        format: 'port',
        default: 12345,
        env: 'PORT'
      }
    },
    meilisearch: {
      apiKey: {
        doc: 'The api key for the Meilisearch instance.',
        format: String,
        default: '',
        env: 'MEILI_MASTER_KEY'
      },
      host: {
        doc: 'The host for the Meilisearch instance.',
        format: String,
        default: 'http://127.0.0.1:7700',
        env: 'MEILI_HOST'
      },
    },
    discord: {
      token: {
        doc: 'Discord bot token',
        format: String,
        default: '',
        env: 'DISCORDBOTTOKEN',
        sensitive: true
      },
      channels: {
        doc: 'Discord channels to listen to',
        format: Array,
        default: [],
        env: 'DISCORDBOTCHANNELS'
      },
      maxAttachmentSize: {
        doc: 'Maximum attachment size in bytes',
        format: 'integer',
        default: 1000000,
        env: 'MAX_ATTACHMENT_SIZE'
      }
    },

  });

  // Perform validation
  config.validate({ allowed: 'strict' });
  return config
}


export const config = getConfig()