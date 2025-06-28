const fs = require('node:fs');
const path = require('node:path');

// Configuração de cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Criar diretório de logs se não existir
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Função para formatar timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Função para formatar mensagem de log
function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    logMessage += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return logMessage;
}

// Função para salvar log em arquivo
function saveToFile(message) {
  const date = new Date().toISOString().split('T')[0];
  const logFile = path.join(logDir, `${date}.log`);
  
  fs.appendFileSync(logFile, message + '\n');
}

// Função para log de informação
function info(message, data = null) {
  const logMessage = formatMessage('INFO', message, data);
  console.log(`${colors.cyan}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de sucesso
function success(message, data = null) {
  const logMessage = formatMessage('SUCCESS', message, data);
  console.log(`${colors.green}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de aviso
function warn(message, data = null) {
  const logMessage = formatMessage('WARN', message, data);
  console.log(`${colors.yellow}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de erro
function error(message, data = null) {
  const logMessage = formatMessage('ERROR', message, data);
  console.error(`${colors.red}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de debug
function debug(message, data = null) {
  const logMessage = formatMessage('DEBUG', message, data);
  console.log(`${colors.dim}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de cliente
function client(clientId, message, data = null) {
  const logMessage = formatMessage(`CLIENT ${clientId}`, message, data);
  console.log(`${colors.magenta}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

// Função para log de jogo
function game(gameId, message, data = null) {
  const logMessage = formatMessage(`GAME ${gameId}`, message, data);
  console.log(`${colors.blue}${logMessage}${colors.reset}`);
  saveToFile(logMessage);
}

module.exports = {
  info,
  success,
  warn,
  error,
  debug,
  client,
  game
}; 