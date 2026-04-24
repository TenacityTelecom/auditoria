'use strict';

module.exports = (sequelize, DataTypes) => {
  const Auditoria = sequelize.define(
    'auditoria',
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
      tableName: 'auditorias',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return Auditoria;
};
