'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex(
            'auditorias',
            ['autor', 'modulo', 'metodo', 'created_at'],
            { name: 'idx_auditorias_dedup_get' },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('auditorias', 'idx_auditorias_dedup_get');
    },
};
