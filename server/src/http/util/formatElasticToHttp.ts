export function formatElasticToHttp(data: any) {
  return data.hits.hits.map((hit: any) => ({
    message: hit._source,
    score: hit._score,
    id: hit._id,
    ...hit
  })).map((e: any) => ({
    content: e.message.content,
    timestamp: e.message.timestamp,
    channel: e.message.channelId,
    author: e.message.author,
    score: e.score,
    type: e.message.type,
    id: e.id,
    attachments: e.message.attachments
  }));
}