import { Op, WhereOptions } from 'sequelize';
import Auditoria, { AuditoriaAttributes, AuditoriaCreationAttributes } from '../Models/Auditoria';

export interface AuditoriaFiltros {
  data_inicio: Date;
  data_fim: Date;
  modulo?: string;
  usuario?: string;
}

export interface DatatableFiltros {
  dataInicio: Date;
  dataFim: Date;
  autor: string;
  livre?: string;
  modulo?: string;
  metodo?: string;
  http_status?: number;
  acao?: string;
  sucesso?: boolean;
  offset: number;
  limit: number;
}

class AuditoriaRepository {
  async create(data: AuditoriaCreationAttributes): Promise<Auditoria> {
    return Auditoria.create(data);
  }

  async findRecentDuplicate(
    ip: string,
    autor: string,
    modulo: string,
    metodo: string,
    uri: string,
    janelaSegundos: number,
  ): Promise<Auditoria | null> {
    const desde = new Date(Date.now() - janelaSegundos * 1000);
    return Auditoria.findOne({
      where: {
        ip,
        autor,
        modulo,
        metodo,
        uri,
        created_at: { [Op.gte]: desde },
      },
    });
  }

  async findByFiltros(filtros: AuditoriaFiltros): Promise<Auditoria[]> {
    const where: WhereOptions<AuditoriaAttributes> = {
      created_at: {
        [Op.between]: [filtros.data_inicio, filtros.data_fim],
      },
    };

    if (filtros.modulo) {
      where.modulo = filtros.modulo.toLowerCase();
    }

    if (filtros.usuario) {
      where.autor = filtros.usuario;
    }

    return Auditoria.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async findForDatatable(filtros: DatatableFiltros): Promise<{ count: number; rows: Auditoria[] }> {
    const where: WhereOptions<AuditoriaAttributes> = {
      created_at: {
        [Op.between]: [filtros.dataInicio, filtros.dataFim],
      },
      autor: filtros.autor,
    };
    
    if (filtros.modulo && filtros.modulo.toLowerCase() !== 'todos') {
      where.modulo = { [Op.like]: `%${filtros.modulo}%` };
    }

    if (filtros.metodo) {
      where.metodo = filtros.metodo;
    }

    if (filtros.http_status) {
      where.http_status = filtros.http_status;
    }

    if (filtros.acao) {
      where.acao = filtros.acao;
    }

    if (filtros.sucesso != null) {
      where.sucesso = filtros.sucesso;
    }

    if (filtros.livre && filtros.livre.length > 0) {
      where[Op.or as any] = [
        { descricao: { [Op.like]: `%${filtros.livre}%` } },
        { uri: { [Op.like]: `%${filtros.livre}%` } },
      ];
    }

    return Auditoria.findAndCountAll({
      where,
      // Projeta apenas as colunas necessárias para o datatable.
      // Exclui `params` (TEXT com payload bruto) e `updated_at`, que não são exibidos
      // na listagem, evitando transferência desnecessária de dados grandes do banco.
      attributes: [
        'id', 'ip', 'autor', 'modulo', 'acao', 'tela',
        'metodo', 'uri', 'http_status', 'sucesso', 'recurso_id',
        'descricao', 'created_at',
      ],
      order: [['created_at', 'DESC']],
      offset: filtros.offset,
      limit: filtros.limit,
      // Log de SQL ativo apenas em desenvolvimento para evitar overhead em produção
      logging: process.env.NODE_ENV !== 'production'
        ? (sql: string) => console.log('[findForDatatable] SQL:', sql)
        : false,
    });
  }
}

export default AuditoriaRepository;
