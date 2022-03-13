import { Router } from 'express';

import { Elastic } from '../../elastic.js';
import { asyncRoute } from '../middleware/asyncRoute.js';
import { formatElasticToHttp } from '../util/formatElasticToHttp.js';

export const searchRouter = Router();

searchRouter.get('/:id/related', asyncRoute(async (req, res) => {
  const { id } = req.params;
  const { direction, limit = 5 } = req.query;

  if (limit > 25) {
    return res.status(400).send({
      error: 'limit must be less than 25'
    });
  }

  if (direction !== 'older' && direction !== 'newer') {
    return res.status(400).send({
      error: 'order must be older or newer'
    });
  }

  if (!id) {
    return res.status(400).send({
      error: 'ID is required'
    });
  }

  const message = await Elastic.getOne(id);
  const related = await Elastic.findRelated(message.channel, message.timestamp, direction, limit);

  res.json({
    results: formatElasticToHttp(related)
  });
}))

searchRouter.get('/', asyncRoute(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send({
      error: 'Query is required'
    });
  }

  const result = await Elastic.search({
    content: query,
  });

  res.json({
    score: result.hits.max_score,
    results: formatElasticToHttp(result)
  });
}))


searchRouter.get('/stats', asyncRoute(async (req, res) => {
  const stats = await Elastic.getStats();

  res.json({
    stats
  });
}))
