const express = require('express');
const cors = require('cors');
const cardsRouter = require('./cards');
const logger = require('../utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.url}`, {
    query: req.query,
    body: req.body
  });
  next();
});

// Rotas
app.use('/api/cards', cardsRouter);

// Rota de teste
app.get('/api/test', (req, res) => {
  logger.info('Teste de conexão com a API');
  res.json({ message: 'API VTES funcionando!' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  logger.error('Erro interno do servidor', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.success(`API VTES rodando na porta ${PORT}`);
}); 