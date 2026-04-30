import { NextFunction, Request, Response } from 'express';
import AuditoriaController from '../../../src/Controllers/AuditoriaController';
import AuditoriaService from '../../../src/Services/AuditoriaService';
import AppError from '../../../src/errors/AppError';

jest.mock('../../../src/Services/AuditoriaService');

const mockStore = AuditoriaService.prototype.store as jest.Mock;
const mockGetAuditoria = AuditoriaService.prototype.getAuditoria as jest.Mock;
const mockGetAll = AuditoriaService.prototype.getAll as jest.Mock;

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  const validBody = {
    ip: '192.168.1.1',
    modulo: 'usuarios',
    autor: 'joao.silva',
    descricao: 'Login realizado',
    dispositivo: 'desktop',
    navegador: 'Chrome 123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuditoriaController();
    req = { body: { ...validBody } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('deve retornar 201 com a auditoria criada', async () => {
    const created = { id: 1, ...validBody };
    mockStore.mockResolvedValueOnce(created);

    await controller.store(req as Request, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next com AppError quando o service lança AppError', async () => {
    const error = new AppError('Os seguintes campos são obrigatórios: ip.');
    mockStore.mockRejectedValueOnce(error);

    await controller.store(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve chamar next com erro genérico em falha inesperada', async () => {
    const error = new Error('DB timeout');
    mockStore.mockRejectedValueOnce(error);

    await controller.store(req as Request, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve chamar service.store com os dados do body', async () => {
    mockStore.mockResolvedValueOnce({ id: 1, ...validBody });

    await controller.store(req as Request, res as Response, next as NextFunction);

    expect(mockStore).toHaveBeenCalledWith(validBody);
  });
});

describe('AuditoriaController.index', () => {
  let controller: AuditoriaController;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuditoriaController();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('deve retornar 200 com a lista de auditorias', async () => {
    const lista = [{ id: 1 }];
    mockGetAuditoria.mockResolvedValueOnce(lista);

    const req = { query: { data_inicio: '2026-01-01', data_fim: '2026-01-31' } } as unknown as Request;

    await controller.index(req, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(lista);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve passar os filtros opcionais ao service', async () => {
    mockGetAuditoria.mockResolvedValueOnce([]);

    const req = {
      query: { data_inicio: '2026-01-01', data_fim: '2026-01-31', modulo: 'usuarios', usuario: 'joao' },
    } as unknown as Request;

    await controller.index(req, res as Response, next as NextFunction);

    expect(mockGetAuditoria).toHaveBeenCalledWith({
      data_inicio: '2026-01-01',
      data_fim: '2026-01-31',
      modulo: 'usuarios',
      usuario: 'joao',
    });
  });

  it('deve chamar next quando o service lança erro', async () => {
    const error = new AppError('data_inicio e data_fim são obrigatórios.');
    mockGetAuditoria.mockRejectedValueOnce(error);

    const req = { query: { data_inicio: '', data_fim: '' } } as unknown as Request;

    await controller.index(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('AuditoriaController.datatable', () => {
  let controller: AuditoriaController;
  let res: Partial<Response>;
  let next: jest.Mock;

  const datatableResult = {
    draw: 1,
    recordsTotal: 1,
    recordsFiltered: 1,
    data: [
      {
        id: 1,
        autor: '124142@gmail.com',
        data: '28-04-2026 14:30:00',
        ip: '192.168.1.1',
        modulo: 'usuarios',
        descricao: 'Login realizado',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuditoriaController();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('deve retornar 200 com resposta no formato DataTables', async () => {
    mockGetAll.mockResolvedValueOnce(datatableResult);

    const req = {
      query: { dataInicio: '28/04/2026', dataFim: '28/04/2026', autor: '124142@gmail.com', modulo: 'todos' },
    } as unknown as Request;

    await controller.datatable(req, res as Response, next as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(datatableResult);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve repassar todos os query params ao service', async () => {
    mockGetAll.mockResolvedValueOnce(datatableResult);

    const req = {
      query: {
        dataInicio: '28/04/2026',
        dataFim: '28/04/2026',
        autor: '124142@gmail.com',
        modulo: 'usuarios',
        draw: '2',
        start: '10',
        length: '25',
      },
    } as unknown as Request;

    await controller.datatable(req, res as Response, next as NextFunction);

    expect(mockGetAll).toHaveBeenCalledWith({
      dataInicio: '28/04/2026',
      dataFim: '28/04/2026',
      autor: '124142@gmail.com',
      modulo: 'usuarios',
      draw: '2',
      start: '10',
      length: '25',
    });
  });

  it('deve chamar next com AppError quando o service lança AppError', async () => {
    const error = new AppError('Os campos dataInicio, dataFim e autor são obrigatórios.');
    mockGetAll.mockRejectedValueOnce(error);

    const req = { query: { dataInicio: '', dataFim: '', autor: '' } } as unknown as Request;

    await controller.datatable(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve chamar next com erro genérico em falha inesperada', async () => {
    const error = new Error('DB timeout');
    mockGetAll.mockRejectedValueOnce(error);

    const req = {
      query: { dataInicio: '28/04/2026', dataFim: '28/04/2026', autor: '124142@gmail.com' },
    } as unknown as Request;

    await controller.datatable(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
