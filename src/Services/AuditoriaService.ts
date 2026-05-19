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
  metodo?: string;
  http_status?: string;
  acao?: string | string[];
  sucesso?: string;
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

    let metodo: string | undefined;
    let uri: string | undefined;
    let http_status: number | undefined;
    let params: string | undefined;
    let acao: string | undefined;
    let tela: string | undefined;
    let sucesso: boolean | undefined;
    let recurso_id: string | undefined;

    try {
      const parsed = JSON.parse(descricao);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        metodo = parsed.metodo ? String(parsed.metodo).toUpperCase() : undefined;
        uri = parsed.uri ? String(parsed.uri) : undefined;
        http_status = parsed.status != null ? Number(parsed.status) : undefined;
        acao = parsed.acao ? String(parsed.acao) : undefined;
        tela = parsed.tela ? String(parsed.tela) : undefined;
        sucesso = parsed.sucesso != null ? Boolean(parsed.sucesso) : undefined;
        recurso_id = parsed.recurso_id != null ? String(parsed.recurso_id) : undefined;
        if (parsed.payload != null) {
          params = typeof parsed.payload === 'string' ? parsed.payload : JSON.stringify(parsed.payload);
        }
      }
    } catch {
      // descricao é texto simples, sem JSON estruturado
    }

    const moduloNormalizado = modulo.toLowerCase();

    // Deduplicação: ignora GETs idênticos (mesmo ip+autor+modulo+metodo+uri) nos últimos 10 segundos.
    // Mutações (POST, PUT, PATCH, DELETE) são sempre registradas.
    const JANELA_DEDUP_SEGUNDOS = 10;
    const metodoNormalizado = metodo ?? '';
    if (metodoNormalizado === 'GET' && uri) {
      const duplicado = await this.repository.findRecentDuplicate(
        ip, autor, moduloNormalizado, metodoNormalizado, uri, JANELA_DEDUP_SEGUNDOS,
      );
      if (duplicado) {
        return duplicado;
      }
    }

    return this.repository.create({ ip, modulo: moduloNormalizado, autor, descricao, dispositivo, navegador, metodo, uri, http_status, params, acao, tela, sucesso, recurso_id });
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
    const { dataInicio: dataInicioStr, dataFim: dataFimStr, autor, modulo, livre, metodo, http_status, acao, sucesso, draw = '0', start = '0', length = '50' } = params;

    if (!dataInicioStr || !dataFimStr || !autor) {
      throw new AppError('Os campos dataInicio, dataFim e autor são obrigatórios.');
    }

    const dataInicio = new Date(dataInicioStr);
    const dataFim = new Date(dataFimStr);
    dataFim.setHours(23, 59, 59, 999);

    console.log('[DEBUG] dataInicioStr:', dataInicioStr);
    console.log('[DEBUG] dataFimStr:', dataFimStr);
    console.log('[DEBUG] dataInicio (Date):', dataInicio, 'ISO:', dataInicio.toISOString(), 'time:', dataInicio.getTime());
    console.log('[DEBUG] dataFim (Date):', dataFim, 'ISO:', dataFim.toISOString(), 'time:', dataFim.getTime());
    console.log('[DEBUG] autor:', autor);

    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
      throw new AppError('Formato de data inválido. Use o formato YYYY-MM-DD.');
    }

    if (dataInicio > dataFim) {
      throw new AppError('A data inicial não pode ser maior que a data final.');
    }

    const modulosArray = modulo && modulo.toLowerCase() !== 'todos'
      ? modulo.split(',').map(m => m.trim().toLowerCase()).filter(Boolean)
      : undefined;

    const acoesArray = (() => {
      if (!acao) return undefined;
      const arr = Array.isArray(acao) ? acao : [acao];
      const filtrado = arr.filter(a => a.toLowerCase() !== 'todos');
      return filtrado.length > 0 ? filtrado : undefined;
    })();

    const { count, rows } = await this.repository.findForDatatable({
      dataInicio,
      dataFim,
      autor,
      livre,
      modulo: modulosArray,
      metodo: metodo && metodo.toUpperCase() !== 'TODOS' ? metodo.toUpperCase() : undefined,
      http_status: http_status ? Number(http_status) : undefined,
      acao: acoesArray,
      sucesso: sucesso != null && sucesso !== '' ? sucesso === 'true' : undefined,
      offset: Number(start),
      limit: Number(length),
    });

    const data = rows.map((auditoria) => ({
      id: auditoria.id,
      autor: auditoria.autor,
      data: dayjs(auditoria.created_at).format('DD-MM-YYYY HH:mm:ss'),
      ip: auditoria.ip,
      modulo: auditoria.modulo,
      acao: auditoria.acao,
      tela: auditoria.tela,
      metodo: auditoria.metodo,
      uri: auditoria.uri,
      http_status: auditoria.http_status,
      sucesso: auditoria.sucesso,
      recurso_id: auditoria.recurso_id,
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
