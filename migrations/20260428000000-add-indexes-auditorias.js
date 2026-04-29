'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('auditorias', ['created_at'], {
      name: 'idx_auditorias_created_at',
    });

    await queryInterface.addIndex('auditorias', ['modulo', 'created_at'], {
      name: 'idx_auditorias_modulo_created_at',
    });

    await queryInterface.addIndex('auditorias', ['autor', 'created_at'], {
      name: 'idx_auditorias_autor_created_at',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_created_at');
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_modulo_created_at');
    await queryInterface.removeIndex('auditorias', 'idx_auditorias_autor_created_at');
  },
};
