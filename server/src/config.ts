// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'conv... Remove this comment to see the full error message
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
    elastic: {
      cloudId: {
        doc: 'The cloud id for the Elasticsearch cluster.',
        format: String,
        default: '',
        env: 'ELASTIC_CLOUD_ID'
      },
      node: {
        doc: 'The node url for the Elasticsearch cluster.',
        format: String,
        default: 'http://127.0.0.1:9200',
        env: 'ELASTIC_NODE'
      },
      authUserName: {
        doc: 'The username for the Elasticsearch cluster.',
        format: String,
        default: 'elastic',
        env: 'ELASTIC_AUTH_USER_NAME'
      },
      authPassword: {
        doc: 'The password for the Elasticsearch cluster.',
        format: String,
        default: '',
        env: 'ELASTIC_AUTH_PASSWORD'
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