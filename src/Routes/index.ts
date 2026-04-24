import { Router } from 'express';
import auditoriaRoutes from './auditoria.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'auditoria' });
});

router.use(auditoriaRoutes);

export { router };
