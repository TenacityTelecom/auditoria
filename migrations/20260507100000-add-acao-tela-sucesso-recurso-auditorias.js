'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('auditorias', 'acao', {
      type: Sequelize.STRING(100),
      allowNull: true,
      defaultValue: null,
      after: 'params',
      comment: 'Verbo de negócio da ação realizada (ex.: Acessou, Editou, Atualizou, Deletou, Criou).',
    });

    await queryInterface.addColumn('auditorias', 'tela', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'acao',
      comment: 'Nome legível da tela ou rota acessada (ex.: omnichannel / fila / editar). Usado em relatórios.',
    });

    await queryInterface.addColumn('auditorias', 'sucesso', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
      after: 'tela',
      comment: 'Resultado da operação: true = sucesso, false = falha, NULL = evento de payload legado.',
    });

    await queryInterface.addColumn('auditorias', 'recurso_id', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
      after: 'sucesso',
      comment: 'Identificador do recurso afetado pela ação (ID numérico, UUID ou slug codificado).',
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

