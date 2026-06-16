const { app, server } = require('./app');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Erro: a porta ${port} ja esta em uso.`);
    console.error(`Feche o outro processo ou altere PORT no arquivo .env.`);
    process.exit(1);
  }

  console.error('Erro ao iniciar o servidor:', err.message);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`WebSocket ativo em ws://localhost:${port}`);
});
