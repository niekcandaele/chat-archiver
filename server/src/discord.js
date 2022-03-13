import { Client, Intents } from 'discord.js';

import { config } from './config.js';

let readyClient = null;
export async function getDiscordClient() {
  return new Promise((resolve, reject) => {
    const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

    if (readyClient) {
      return resolve(readyClient)
    }

    client.once('ready', async () => {
      console.log('Discord bot logged in.');
      readyClient = client;
      resolve(readyClient);
    });

    client.on('rateLimit', (info) => {
      console.log(`Rate limit of ${info.limit} reached: ${info.path} ends in ${info.timeout}ms.`);
    })

    client.login(config.get('discord.token'));
  })

}