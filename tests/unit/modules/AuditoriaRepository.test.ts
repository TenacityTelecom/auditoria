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
