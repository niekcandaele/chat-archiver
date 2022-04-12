import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config } from '../config';
import { errorHandler } from './middleware/errorHandler';
import { searchRouter } from './routes/search';

export async function getHttp() {
  return new Promise((resolve, reject) => {
    const app = express();
    app.set('trust proxy', true)
    app.use(express.static('public'));

    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    }))


    app.use('/search', searchRouter)

    app.use(errorHandler)

    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(__dirname + '/../../public/index.html'));
    });

    app.listen(config.get('http.port'), () => {
      console.log('HTTP server listening on port ' + config.get('http.port'));
      resolve(app);
    })
  });
}