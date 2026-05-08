import AuditoriaRepository from '../../../src/Repositories/AuditoriaRepository';
import Auditoria from '../../../src/Models/Auditoria';

jest.mock('../../../src/Models/Auditoria');

describe('AuditoriaRepository', () => {
  let repository: AuditoriaRepository;

  const data = {
    ip: '192.168.1.1',
    modulo: 'usuarios',
    autor: 'joao.silva',
    descricao: 'Login realizado',
    dispositivo: 'desktop',
    navegador: 'Chrome 123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AuditoriaRepository();
  });

  it('deve chamar Auditoria.create com os dados e retornar o resultado', async () => {
    const created = { id: 1, ...data };
    (Auditoria.create as jest.Mock).mockResolvedValueOnce(created);

    const result = await repository.create(data);

    expect(Auditoria.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(created);
  });

  it('deve propagar erro lançado pelo Sequelize', async () => {
    (Auditoria.create as jest.Mock).mockRejectedValueOnce(new Error('Sequelize error'));

    await expect(repository.create(data)).rejects.toThrow('Sequelize error');
  });
});

describe('AuditoriaRepository.findRecentDuplicate', () => {
  let repository: AuditoriaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AuditoriaRepository();
  });

  it('deve retornar null quando não há duplicata', async () => {
    (Auditoria.findOne as jest.Mock).mockResolvedValueOnce(null);

    const result = await repository.findRecentDuplicate('1.2.3.4', 'joao', 'usuarios', 'GET', 'usuarios/lista', 10);

    expect(result).toBeNull();
    expect(Auditoria.findOne).toHaveBeenCalledTimes(1);
  });

  it('deve retornar o registro existente quando há duplicata', async () => {
    const existente = { id: 10, ip: '1.2.3.4', autor: 'joao', modulo: 'usuarios', metodo: 'GET', uri: 'usuarios/lista' };
    (Auditoria.findOne as jest.Mock).mockResolvedValueOnce(existente);

    const result = await repository.findRecentDuplicate('1.2.3.4', 'joao', 'usuarios', 'GET', 'usuarios/lista', 10);

    expect(result).toEqual(existente);
  });

  it('deve propagar erro lançado pelo Sequelize', async () => {
    (Auditoria.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

    await expect(
      repository.findRecentDuplicate('1.2.3.4', 'joao', 'usuarios', 'GET', 'usuarios/lista', 10),
    ).rejects.toThrow('DB Error');
  });
});

describe('AuditoriaRepository.findForDatatable', () => {
  let repository: AuditoriaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AuditoriaRepository();
  });

  const filtrosBase = {
    dataInicio: new Date('2026-04-01'),
    dataFim: new Date('2026-04-28T23:59:59.999Z'),
    autor: '124142@gmail.com',
    offset: 0,
    limit: 10,
  };

  it('deve chamar Auditoria.findAndCountAll com os filtros corretos', async () => {
    const rows = [{ id: 1 }];
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 1, rows });

    const result = await repository.findForDatatable(filtrosBase);

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [['created_at', 'DESC']],
        offset: 0,
        limit: 10,
      }),
    );
    expect(result).toEqual({ count: 1, rows });
  });

  it('deve incluir filtro de modulo quando informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, modulo: 'usuarios' });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ modulo: expect.objectContaining({}) }),
      }),
    );
  });

  it('não deve incluir filtro de modulo quando não informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable(filtrosBase);

    const call = (Auditoria.findAndCountAll as jest.Mock).mock.calls[0][0];
    expect(call.where).not.toHaveProperty('modulo');
  });

  it('deve respeitar offset e limit para paginação', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 100, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, offset: 20, limit: 5 });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 20, limit: 5 }),
    );
  });

  it('deve propagar erro lançado pelo Sequelize', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockRejectedValueOnce(new Error('Sequelize error'));

    await expect(repository.findForDatatable(filtrosBase)).rejects.toThrow('Sequelize error');
  });

  it('deve incluir filtro de metodo quando informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, metodo: 'POST' });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ metodo: 'POST' }),
      }),
    );
  });

  it('deve incluir filtro de http_status quando informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, http_status: 500 });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ http_status: 500 }),
      }),
    );
  });

  it('deve incluir filtro de acao quando informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, acao: 'Editou' });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ acao: 'Editou' }),
      }),
    );
  });

  it('deve incluir filtro de sucesso=false quando informado', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, sucesso: false });

    expect(Auditoria.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sucesso: false }),
      }),
    );
  });

  it('deve buscar livre também no campo uri', async () => {
    (Auditoria.findAndCountAll as jest.Mock).mockResolvedValueOnce({ count: 0, rows: [] });

    await repository.findForDatatable({ ...filtrosBase, livre: 'omnichannel' });

    const call = (Auditoria.findAndCountAll as jest.Mock).mock.calls[0][0];
    const orCondition = call.where[Symbol.for('or')];
    expect(Array.isArray(orCondition)).toBe(true);
    expect(orCondition).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ descricao: expect.anything() }),
        expect.objectContaining({ uri: expect.anything() }),
      ]),
    );
  });
});
