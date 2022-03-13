export function formatElasticToHttp(data) {
  return data.hits.hits.map(hit => ({ message: hit._source, score: hit._score, id: hit._id })).map(e => ({
    content: e.message.content,
    timestamp: e.message.timestamp,
    channel: e.message.channel,
    author: e.message.author,
    score: e.score,
    id: e.id,
  }))
}