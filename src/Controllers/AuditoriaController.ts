import { NextFunction, Request, Response } from 'express';
import AuditoriaService from '../Services/AuditoriaService';

class AuditoriaController {
  private service: AuditoriaService;

  constructor() {
    this.service = new AuditoriaService();
    this.store = this.store.bind(this);
    this.index = this.index.bind(this);
    this.datatable = this.datatable.bind(this);
  }

  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auditoria = await this.service.store(req.body);
      res.status(201).json(auditoria);
    } catch (err) {
      next(err);
    }
  }

  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data_inicio, data_fim, modulo, usuario } = req.query as Record<string, string>;
      const auditorias = await this.service.getAuditoria({ data_inicio, data_fim, modulo, usuario });
      res.status(200).json(auditorias);
    } catch (err) {
      next(err);
    }
  }

  async datatable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dataInicio, dataFim, autor, modulo, livre, draw, start, length } = req.query as Record<string, string>;
      const result = await this.service.getAll({ dataInicio, dataFim, autor, modulo, livre, draw, start, length });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default AuditoriaController;
