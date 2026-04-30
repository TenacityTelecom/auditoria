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
  offset: number;
  limit: number;
}

class AuditoriaRepository {
  async create(data: AuditoriaCreationAttributes): Promise<Auditoria> {
    return Auditoria.create(data);
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

    if (filtros.livre && filtros.livre.length > 0) {
      where.descricao = { [Op.like]: `%${filtros.livre}%` };
    }

    return Auditoria.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: filtros.offset,
      limit: filtros.limit,
      logging: (sql) => console.log('[findForDatatable] SQL:', sql),
    });
  }
}

export default AuditoriaRepository;
