import express from 'express';
import rateLimit from 'express-rate-limit';

import { config } from '../config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { searchRouter } from './routes/search.js';

export async function getHttp() {
  return new Promise((resolve, reject) => {
    const app = express();

    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    }))

    app.use(express.static('public'));

    app.use('/search', searchRouter)

    app.use(errorHandler)

    app.listen(config.get('http.port'), () => {
      console.log('HTTP server listening on port ' + config.get('http.port'));
      resolve(app);
    })
  })
}