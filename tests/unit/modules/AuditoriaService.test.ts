import AuditoriaService from '../../../src/Services/AuditoriaService';
import AuditoriaRepository from '../../../src/Repositories/AuditoriaRepository';
import AppError from '../../../src/errors/AppError';

jest.mock('../../../src/Repositories/AuditoriaRepository');

const mockCreate = AuditoriaRepository.prototype.create as jest.Mock;
const mockFindByFiltros = AuditoriaRepository.prototype.findByFiltros as jest.Mock;

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
