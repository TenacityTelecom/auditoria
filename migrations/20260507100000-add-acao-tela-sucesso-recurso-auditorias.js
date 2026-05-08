'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('auditorias', 'acao', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
      after: 'params',
    });

    await queryInterface.addColumn('auditorias', 'tela', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'acao',
    });

    await queryInterface.addColumn('auditorias', 'sucesso', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      after: 'tela',
    });

    await queryInterface.addColumn('auditorias', 'recurso_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'sucesso',
    });

    await queryInterface.addIndex('auditorias', ['acao'], {
      name: 'idx_auditorias_acao',
    });

    await queryInterface.addIndex('auditorias', ['sucesso'], {
      name: 'idx_auditorias_sucesso',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_acao');
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_sucesso');

    await queryInterface.removeColumn('auditorias', 'acao');
    await queryInterface.removeColumn('auditorias', 'tela');
    await queryInterface.removeColumn('auditorias', 'sucesso');
    await queryInterface.removeColumn('auditorias', 'recurso_id');
  },
};
