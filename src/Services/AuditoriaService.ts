import AuditoriaRepository, { AuditoriaFiltros } from '../Repositories/AuditoriaRepository';
import { AuditoriaCreationAttributes } from '../Models/Auditoria';
import AppError from '../errors/AppError';
import dayjs from 'dayjs';

export interface GetAuditoriaParams {
  data_inicio: string;
  data_fim: string;
  modulo?: string;
  usuario?: string;
}

export interface GetAllParams {
  dataInicio: string;
  dataFim: string;
  autor: string;
  modulo?: string;
  livre?: string;
  draw?: string;
  start?: string;
  length?: string;
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

  async getAll(params: GetAllParams) {
    const { dataInicio: dataInicioStr, dataFim: dataFimStr, autor, modulo, livre, draw = '0', start = '0', length = '50' } = params;

    if (!dataInicioStr || !dataFimStr || !autor) {
      throw new AppError('Os campos dataInicio, dataFim e autor são obrigatórios.');
    }

    const dataInicio = new Date(dataInicioStr);
    const dataFim = new Date(dataFimStr);
    dataFim.setHours(23, 59, 59, 999);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      throw new AppError('Formato de data inválido. Use o formato YYYY-MM-DD.');
    }

    if (dataInicio > dataFim) {
      throw new AppError('A data inicial não pode ser maior que a data final.');
    }

    const moduloFiltro = modulo && modulo.toLowerCase() !== 'todos' ? modulo : undefined;

    const { count, rows } = await this.repository.findForDatatable({
      dataInicio,
      dataFim,
      autor,
      livre,      
      modulo: moduloFiltro,
      offset: Number(start),
      limit: Number(length),
    });

    const data = rows.map((auditoria) => ({
      id: auditoria.id,
      autor: auditoria.autor,
      data: dayjs(auditoria.created_at).format('DD-MM-YYYY HH:mm:ss'),
      ip: auditoria.ip,
      modulo: auditoria.modulo,
      descricao: auditoria.descricao,
    }));

    return {
      draw: Number(draw),
      recordsTotal: count,
      recordsFiltered: count,
      data,
    };
  }
}

export default AuditoriaService;
