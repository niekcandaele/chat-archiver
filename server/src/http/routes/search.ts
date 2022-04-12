import { Router } from 'express';

import { Search } from '../../service/search';
import { asyncRoute } from '../middleware/asyncRoute';

export const searchRouter = Router();

searchRouter.get('/:id/related', asyncRoute(async (req: any, res: any) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({
      error: 'ID is required'
    });
  }

  const message = await Search.getOne(id);
  const related = await Search.findRelated(message.platformChannelId, message.timestamp);

  res.json({
    results: related
  });
}))

searchRouter.get('/', asyncRoute(async (req: any, res: any) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).send({
      error: 'Query is required'
    });
  }

  const result = await Search.search(query);

  res.json({
    results: result
  });
}))


searchRouter.get('/stats', asyncRoute(async (req: any, res: any) => {
  const stats = await Search.getStats();

  res.json({
    stats
  });
}))
