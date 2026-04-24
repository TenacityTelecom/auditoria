module.exports = {
  apps: [
    {
      name: 'auditoria',
      script: './dist/app.js',   // compilado pelo tsc
      exec_mode: 'fork',
      instances: 1,
      node_args: '--max-old-space-size=128 --max-semi-space-size=16 --optimize_for_size',
      watch: false,
      env: {
        NODE_ENV: 'production',
        DB_NAME: 'banco-horas',        // força o nome do banco
        DB_USER: 'webadmin',
        DB_PASS: 'advah2011',
        DB_HOST: '127.0.0.1'
      }
    }
  ]
};
