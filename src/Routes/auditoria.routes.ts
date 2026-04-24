import { Router } from 'express';
import AuditoriaController from '../Controllers/AuditoriaController';

const router = Router();
const auditoriaController = new AuditoriaController();

router.post('/auditoria/store', auditoriaController.store);
router.get('/auditoria', auditoriaController.index);

export default router;
