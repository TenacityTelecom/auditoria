'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'auditorias',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER.UNSIGNED,
        },
        ip: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Endereço IP de origem da requisição. Útil para detectar acessos suspeitos ou automatizados.',
        },
        modulo: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Sistema ou módulo que gerou o evento (ex.: omnichannel, principal). Sempre em minúsculas.',
        },
        autor: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'E-mail do usuário autenticado ou "Sistema/Automação" para processos automáticos.',
        },
        descricao: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: 'JSON bruto completo do evento enviado pelo sistema de origem. Preservado para histórico imutável.',
        },
        dispositivo: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Tipo de dispositivo do usuário: desktop ou mobile.',
        },
        navegador: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: 'Navegador resumido do usuário (ex.: Chrome, Firefox). Auxiliar no diagnóstico de problemas.',
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Timestamp exato do evento. Base de todos os filtros por período.',
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      },
      {
        comment: 'Registra todas as ações dos usuários no sistema para rastreabilidade, conformidade e investigação de incidentes.',
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('auditorias');
  },
};

