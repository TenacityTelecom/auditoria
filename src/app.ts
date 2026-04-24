import express from 'express';
import bodyParser from 'body-parser';
import { router } from './Routes';
import { errorHandler } from './Middlewares/errorHandler';

export function createApp() {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(router);
  app.use(errorHandler);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 6777;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[auditoria] HTTP listening on port ${PORT}`);
  });
}
