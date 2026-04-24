import { Op, WhereOptions } from 'sequelize';
import Auditoria, { AuditoriaAttributes, AuditoriaCreationAttributes } from '../Models/Auditoria';

export interface AuditoriaFiltros {
  data_inicio: Date;
  data_fim: Date;
  modulo?: string;
  usuario?: string;
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
}

export default AuditoriaRepository;
