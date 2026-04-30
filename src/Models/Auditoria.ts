import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/sequelize';

export interface AuditoriaAttributes {
  id: number;
  ip: string;
  modulo: string;
  autor: string;
  descricao: string;
  dispositivo: string;
  navegador: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuditoriaCreationAttributes
  extends Optional<AuditoriaAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Auditoria
  extends Model<AuditoriaAttributes, AuditoriaCreationAttributes>
  implements AuditoriaAttributes
{
  public id!: number;
  public ip!: string;
  public modulo!: string;
  public autor!: string;
  public descricao!: string;
  public dispositivo!: string;
  public navegador!: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Auditoria.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ip: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    modulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    autor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dispositivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    navegador: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'auditorias',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      // Consultas por intervalo de datas (filtro principal + ORDER BY created_at DESC)
      {
        name: 'idx_auditorias_created_at',
        fields: ['created_at'],
      },
      // Consultas com filtro por módulo + intervalo de datas
      {
        name: 'idx_auditorias_modulo_created_at',
        fields: ['modulo', 'created_at'],
      },
      // Consultas com filtro por autor + intervalo de datas
      {
        name: 'idx_auditorias_autor_created_at',
        fields: ['autor', 'created_at'],
      },
    ],
  },
);

export default Auditoria;
