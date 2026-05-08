'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('auditorias', 'metodo', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: null,
      after: 'navegador',
      comment: 'Verbo HTTP da requisição (GET, POST, PUT, DELETE...). Sempre gravado em maiúsculas.',
    });

    await queryInterface.addColumn('auditorias', 'uri', {
      type: Sequelize.STRING(1000),
      allowNull: true,
      defaultValue: null,
      after: 'metodo',
      comment: 'Caminho da requisição sem domínio (ex.: omnichannel/fila/editar/123). Pode conter IDs em Base64.',
    });

    await queryInterface.addColumn('auditorias', 'http_status', {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      after: 'uri',
      comment: 'Código de resposta HTTP (200, 302, 404, 500...). SMALLINT UNSIGNED cobre todos os status.',
    });

    await queryInterface.addColumn('auditorias', 'params', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
      after: 'http_status',
      comment: 'JSON do payload enviado na requisição (body de POST/PUT/PATCH). Nulo para GETs.',
    });

    await queryInterface.addIndex('auditorias', ['metodo'], {
      name: 'idx_auditorias_metodo',
    });

    await queryInterface.addIndex('auditorias', ['http_status'], {
      name: 'idx_auditorias_http_status',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_metodo');
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_http_status');

    await queryInterface.removeColumn('auditorias', 'metodo');
    await queryInterface.removeColumn('auditorias', 'uri');
    await queryInterface.removeColumn('auditorias', 'http_status');
    await queryInterface.removeColumn('auditorias', 'params');
  },
};

