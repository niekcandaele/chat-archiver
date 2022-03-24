import { config } from './src/config.js';
import { DiscordIngester } from './src/discordIngester.js';
import { getHttp } from './src/http/http.js';

async function main() {
  await getHttp();

  const ascIngesters = config.get('discord.channels').map((channelId: any) => new DiscordIngester(channelId, 'asc'));
  const descIngesters = config.get('discord.channels').map((channelId: any) => new DiscordIngester(channelId, 'desc'));
  for (const ingester of [...ascIngesters, ...descIngesters]) {
    await ingester.start()
  }

}

main()
  .catch(console.error)

