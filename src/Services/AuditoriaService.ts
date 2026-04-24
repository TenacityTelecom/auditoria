import AuditoriaRepository, { AuditoriaFiltros } from '../Repositories/AuditoriaRepository';
import { AuditoriaCreationAttributes } from '../Models/Auditoria';
import AppError from '../errors/AppError';

export interface GetAuditoriaParams {
  data_inicio: string;
  data_fim: string;
  modulo?: string;
  usuario?: string;
}

class AuditoriaService {
  private repository: AuditoriaRepository;

  constructor() {
    this.repository = new AuditoriaRepository();
  }

  async store(data: AuditoriaCreationAttributes) {
    const { ip, modulo, autor, descricao, dispositivo, navegador } = data;

    const camposObrigatorios: Record<string, unknown> = {
      ip,
      modulo,
      autor,
      descricao,
      dispositivo,
      navegador,
    };

    const faltando = Object.entries(camposObrigatorios)
      .filter(([, valor]) => valor === undefined || valor === null || valor === '')
      .map(([campo]) => campo);

    if (faltando.length > 0) {
      throw new AppError(`Os seguintes campos são obrigatórios: ${faltando.join(', ')}.`);
    }

    const dispositivosValidos = ['desktop', 'mobile'];
    if (!dispositivosValidos.includes(dispositivo.toLowerCase())) {
      throw new AppError('O campo dispositivo deve ser "desktop" ou "mobile".');
    }

    return this.repository.create({ ip, modulo: modulo.toLowerCase(), autor, descricao, dispositivo, navegador });
  }

  async getAuditoria(params: GetAuditoriaParams) {
    if (!params.data_inicio || !params.data_fim) {
      throw new AppError('Os campos data_inicio e data_fim são obrigatórios.');
    }

    const dataInicio = new Date(params.data_inicio);
    const dataFim = new Date(params.data_fim);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      throw new AppError('Formato de data inválido. Use o formato YYYY-MM-DD.');
    }

    if (dataInicio > dataFim) {
      throw new AppError('data_inicio não pode ser maior que data_fim.');
    }

    // Inclui todo o último dia até 23:59:59
    dataFim.setHours(23, 59, 59, 999);

    const filtros: AuditoriaFiltros = {
      data_inicio: dataInicio,
      data_fim: dataFim,
      modulo: params.modulo,
      usuario: params.usuario,
    };

    return this.repository.findByFiltros(filtros);
  }
}

export default AuditoriaService;
