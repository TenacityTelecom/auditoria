import AuditoriaService from '../../../src/Services/AuditoriaService';
import AuditoriaRepository from '../../../src/Repositories/AuditoriaRepository';
import AppError from '../../../src/errors/AppError';

jest.mock('../../../src/Repositories/AuditoriaRepository');

const mockCreate = AuditoriaRepository.prototype.create as jest.Mock;
const mockFindByFiltros = AuditoriaRepository.prototype.findByFiltros as jest.Mock;
const mockFindForDatatable = AuditoriaRepository.prototype.findForDatatable as jest.Mock;

describe('AuditoriaService', () => {
  let service: AuditoriaService;

  const validData = {
    ip: '192.168.1.1',
    modulo: 'usuarios',
    autor: 'joao.silva',
    descricao: 'Login realizado',
    dispositivo: 'desktop',
    navegador: 'Chrome 123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditoriaService();
  });

  it('deve chamar repository.create com dados válidos e retornar o resultado', async () => {
    const created = { id: 1, ...validData };
    mockCreate.mockResolvedValueOnce(created);

    const result = await service.store(validData);

    expect(mockCreate).toHaveBeenCalledWith({ ...validData, modulo: validData.modulo.toLowerCase() });
    expect(result).toEqual(created);
  });

  it('deve converter o campo modulo para minúsculas', async () => {
    const dados = { ...validData, modulo: 'USUARIOS' };
    mockCreate.mockResolvedValueOnce({ id: 1, ...dados, modulo: 'usuarios' });

    await service.store(dados);

    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ modulo: 'usuarios' }));
  });

  it.each(['ip', 'modulo', 'autor', 'descricao', 'dispositivo', 'navegador'])(
    'deve lançar AppError quando "%s" está ausente',
    async (campo) => {
      const dados = { ...validData, [campo]: '' };

      await expect(service.store(dados)).rejects.toThrow(AppError);
      await expect(service.store(dados)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining(campo),
      });
    },
  );

  it('deve lançar AppError quando dispositivo é inválido', async () => {
    const dados = { ...validData, dispositivo: 'tablet' };

    await expect(service.store(dados)).rejects.toThrow(AppError);
    await expect(service.store(dados)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('"desktop"'),
    });
  });

  it('não deve chamar repository.create se a validação falhar', async () => {
    const dados = { ...validData, ip: '' };

    await expect(service.store(dados)).rejects.toThrow(AppError);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('deve propagar erro do repository', async () => {
    mockCreate.mockRejectedValueOnce(new Error('DB Error'));

    await expect(service.store(validData)).rejects.toThrow('DB Error');
  });
});

describe('AuditoriaService.getAuditoria', () => {
  let service: AuditoriaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditoriaService();
  });

  it('deve retornar auditorias com data_inicio e data_fim válidos', async () => {
    const lista = [{ id: 1, modulo: 'usuarios' }];
    mockFindByFiltros.mockResolvedValueOnce(lista);

    const result = await service.getAuditoria({ data_inicio: '2026-01-01', data_fim: '2026-01-31' });

    expect(mockFindByFiltros).toHaveBeenCalledWith(
      expect.objectContaining({
        data_inicio: new Date('2026-01-01'),
      }),
    );
    expect(result).toEqual(lista);
  });

  it('deve passar modulo em minúsculas ao repository', async () => {
    mockFindByFiltros.mockResolvedValueOnce([]);

    await service.getAuditoria({ data_inicio: '2026-01-01', data_fim: '2026-01-31', modulo: 'USUARIOS' });

    expect(mockFindByFiltros).toHaveBeenCalledWith(
      expect.objectContaining({ modulo: 'USUARIOS' }),
    );
  });

  it('deve lançar AppError quando data_inicio está ausente', async () => {
    await expect(service.getAuditoria({ data_inicio: '', data_fim: '2026-01-31' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('data_inicio'),
    });
    expect(mockFindByFiltros).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando data_fim está ausente', async () => {
    await expect(service.getAuditoria({ data_inicio: '2026-01-01', data_fim: '' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('data_fim'),
    });
    expect(mockFindByFiltros).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando a data é inválida', async () => {
    await expect(
      service.getAuditoria({ data_inicio: 'invalid', data_fim: '2026-01-31' }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('Formato de data') });
    expect(mockFindByFiltros).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando data_inicio é maior que data_fim', async () => {
    await expect(
      service.getAuditoria({ data_inicio: '2026-02-01', data_fim: '2026-01-01' }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('data_inicio') });
    expect(mockFindByFiltros).not.toHaveBeenCalled();
  });

  it('deve propagar erro do repository', async () => {
    mockFindByFiltros.mockRejectedValueOnce(new Error('DB Error'));

    await expect(
      service.getAuditoria({ data_inicio: '2026-01-01', data_fim: '2026-01-31' }),
    ).rejects.toThrow('DB Error');
  });
});

describe('AuditoriaService.getAll', () => {
  let service: AuditoriaService;

  const validParams = {
    dataInicio: '2026-04-28',
    dataFim: '2026-04-28',
    autor: '124142@gmail.com',
  };

  const mockRows = [
    {
      id: 1,
      autor: '124142@gmail.com',
      created_at: new Date('2026-04-28T14:30:00'),
      ip: '192.168.1.1',
      modulo: 'usuarios',
      descricao: 'Login realizado',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditoriaService();
  });

  it('deve retornar resposta compatível com DataTables', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 1, rows: mockRows });

    const result = await service.getAll({ ...validParams, draw: '1' });

    expect(result).toMatchObject({
      draw: 1,
      recordsTotal: 1,
      recordsFiltered: 1,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 1,
      autor: '124142@gmail.com',
      ip: '192.168.1.1',
      modulo: 'usuarios',
      descricao: 'Login realizado',
    });
  });

  it('deve formatar a data no padrão DD-MM-YYYY HH:mm:ss', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 1, rows: mockRows });

    const result = await service.getAll(validParams);

    expect(result.data[0].data).toMatch(/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/);
  });

  it('deve ignorar modulo "todos" e não repassar ao repository', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 0, rows: [] });

    await service.getAll({ ...validParams, modulo: 'todos' });

    expect(mockFindForDatatable).toHaveBeenCalledWith(
      expect.objectContaining({ modulo: undefined }),
    );
  });

  it('deve repassar modulo específico ao repository', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 0, rows: [] });

    await service.getAll({ ...validParams, modulo: 'usuarios' });

    expect(mockFindForDatatable).toHaveBeenCalledWith(
      expect.objectContaining({ modulo: 'usuarios' }),
    );
  });

  it('deve usar draw, start e length com defaults quando não informados', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 0, rows: [] });

    const result = await service.getAll(validParams);

    expect(result.draw).toBe(0);
    expect(mockFindForDatatable).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, limit: 10 }),
    );
  });

  it('deve repassar start e length como offset e limit ao repository', async () => {
    mockFindForDatatable.mockResolvedValueOnce({ count: 0, rows: [] });

    await service.getAll({ ...validParams, start: '20', length: '5' });

    expect(mockFindForDatatable).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 20, limit: 5 }),
    );
  });

  it('deve lançar AppError quando dataInicio está ausente', async () => {
    await expect(service.getAll({ dataInicio: '', dataFim: '2026-04-28', autor: '124142@gmail.com' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('dataInicio'),
    });
    expect(mockFindForDatatable).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando dataFim está ausente', async () => {
    await expect(service.getAll({ dataInicio: '2026-04-28', dataFim: '', autor: '124142@gmail.com' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('dataFim'),
    });
    expect(mockFindForDatatable).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando autor está ausente', async () => {
    await expect(service.getAll({ dataInicio: '2026-04-28', dataFim: '2026-04-28', autor: '' })).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('autor'),
    });
    expect(mockFindForDatatable).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando formato de dataInicio é inválido', async () => {
    await expect(
      service.getAll({ dataInicio: '28/04/2026', dataFim: '2026-04-28', autor: '124142@gmail.com' }),
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('Formato') });
    expect(mockFindForDatatable).not.toHaveBeenCalled();
  });

  it('deve lançar AppError quando data inicial é maior que data final', async () => {
    await expect(
      service.getAll({ dataInicio: '2026-04-30', dataFim: '2026-04-01', autor: '124142@gmail.com' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockFindForDatatable).not.toHaveBeenCalled();
  });

  it('deve propagar erro do repository', async () => {
    mockFindForDatatable.mockRejectedValueOnce(new Error('DB Error'));

    await expect(service.getAll(validParams)).rejects.toThrow('DB Error');
  });
});
