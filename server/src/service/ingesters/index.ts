import { config } from '../../config';
import { DiscordIngester } from './Discord';

export async function startIngesters() {
  const discordChannels = config.get('discord.channels');
  for (const channelId of discordChannels) {
    const ingester = new DiscordIngester(channelId);
    await ingester.start();
  }
}