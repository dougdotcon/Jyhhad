// Cliente de teste para o servidor de jogo UDP
const dgram = require('node:dgram');
const client = dgram.createSocket('udp4');
const fetch = require('node-fetch');
const logger = require('./utils/logger');

// Configurações do servidor
const SERVER_PORT = 41234;
const SERVER_HOST = '127.0.0.1';
const API_URL = 'http://localhost:3000/api';
let playerId = null;

// Dados do jogador simulado
const playerData = {
  name: `Player${Math.floor(Math.random() * 1000)}`,
  selectedClan: 'GANGREL',
  deck: [],
  crypt: []
};

// Estado do jogo local
const gameState = {
  currentPhase: null,
  hand: [],
  ready_region: [],
  uncontrolled_region: [],
  torpor_region: [],
  pool: 30,
  influence: 0,
  title: null,
  gameId: null,
  isMyTurn: false,
  lastAction: null,
  testSequence: 0 // Controle da sequência de testes
};

// Função para buscar cartas da API
async function fetchCardsFromAPI() {
  try {
    logger.info('Buscando vampiros da API', { clan: playerData.selectedClan });
    const response = await fetch(`${API_URL}/cards/vampires/clan/${playerData.selectedClan}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar vampiros: ${response.statusText}`);
    }
    const vampires = await response.json();
    
    if (!vampires || vampires.length === 0) {
      logger.error('Nenhum vampiro encontrado para o clã especificado');
      return null;
    }
    
    // Criar deck aleatório
    logger.info('Criando deck aleatório');
    const deckResponse = await fetch(`${API_URL}/cards/deck/random`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clan: playerData.selectedClan,
        minCapacity: 4,
        maxCapacity: 8,
        count: 12
      })
    });
    
    if (!deckResponse.ok) {
      const errorData = await deckResponse.json();
      logger.error('Erro ao criar deck', errorData);
      return null;
    }
    
    const deck = await deckResponse.json();
    
    if (!deck || deck.length === 0) {
      logger.error('Deck vazio retornado pela API');
      return null;
    }
    
    // Validar deck
    logger.info('Validando deck');
    const validationResponse = await fetch(`${API_URL}/cards/deck/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deck })
    });
    
    if (!validationResponse.ok) {
      const errorData = await validationResponse.json();
      logger.error('Erro ao validar deck', errorData);
      return null;
    }
    
    const validation = await validationResponse.json();
    
    if (!validation.isValid) {
      logger.error('Deck inválido', validation);
      return null;
    }
    
    logger.success('Deck criado com sucesso', validation.stats);
    return deck;
  } catch (error) {
    logger.error('Erro ao buscar cartas da API', { error: error.message });
    return null;
  }
}

// Tratamento de mensagens recebidas
client.on('message', (message, rinfo) => {
  try {
    const data = JSON.parse(message.toString());
    logger.debug('Mensagem recebida do servidor', data);
    
    switch (data.type) {
      case 'connected':
        handleConnected(data);
        break;
        
      case 'gameCreated':
        handleGameCreated(data);
        break;
        
      case 'gameJoined':
        handleGameJoined(data);
        break;
        
      case 'turnStarted':
        handleTurnStarted(data);
        break;
        
      case 'phaseChanged':
        handlePhaseChanged(data);
        break;
        
      case 'cardsDrawn':
        handleCardsDrawn(data);
        break;
        
      case 'vampireReadied':
        handleVampireReadied(data);
        break;
        
      case 'combatInitiated':
        handleCombatInitiated(data);
        break;
        
      case 'combatResolved':
        handleCombatResolved(data);
        break;
        
      case 'politicalAction':
        handlePoliticalAction(data);
        break;
        
      case 'gameEnded':
        handleGameEnded(data);
        break;
        
      case 'error':
        logger.error('Erro do servidor', data);
        break;
        
      default:
        logger.warn('Tipo de mensagem desconhecido', data);
    }
  } catch (error) {
    logger.error('Erro ao processar mensagem', { error: error.message });
  }
});

// Handlers de eventos
function handleConnected(data) {
  playerId = data.id;
  logger.success(`Conectado ao servidor como ${playerId}`);
  
  // Iniciar sequência de testes após conexão
  setTimeout(runNextTest, 1000);
}

function handleGameCreated(data) {
  logger.info('Jogo criado', data.game);
  gameState.gameId = data.game.id;
  runNextTest();
}

function handleGameJoined(data) {
  logger.info('Entrou no jogo', data.game);
  updateGameState(data.game);
  runNextTest();
}

function handleTurnStarted(data) {
  logger.info('=== Turno iniciado ===', {
    playerId: data.playerId,
    turnNumber: data.turnNumber,
    phase: data.phase,
    playerState: data.playerState
  });
  
  gameState.currentPhase = data.phase;
  gameState.isMyTurn = data.playerId === playerId;
  
  if (data.playerState) {
    gameState.hand = data.playerState.hand;
    gameState.ready_region = data.playerState.ready_region;
    gameState.uncontrolled_region = data.playerState.uncontrolled_region;
    gameState.torpor_region = data.playerState.torpor_region;
    gameState.pool = data.playerState.pool;
    gameState.influence = data.playerState.influence;
  }
  
  if (gameState.isMyTurn) {
    logger.info('É seu turno!');
    runNextTest();
  }
}

function handlePhaseChanged(data) {
  logger.info('=== Fase alterada ===', {
    phase: data.phase,
    events: data.events
  });
  
  gameState.currentPhase = data.phase;
  
  if (gameState.isMyTurn) {
    logger.info('Executando ação da fase', { phase: data.phase });
    runNextTest();
  }
}

function handleCardsDrawn(data) {
  logger.info('Cartas compradas', { cards: data.cards });
  gameState.hand = gameState.hand.concat(data.cards);
  runNextTest();
}

function handleVampireReadied(data) {
  logger.info('Vampiro preparado', { vampireName: data.vampireName });
  const vampire = gameState.ready_region.find(v => v.id === data.vampireId);
  if (vampire) {
    vampire.ready = true;
    vampire.actions = 1;
  }
  runNextTest();
}

function handleCombatInitiated(data) {
  logger.info('Combate iniciado', data);
  simulateCombat(data.combat);
}

function handleCombatResolved(data) {
  logger.info('Combate resolvido', data);
}

function handlePoliticalAction(data) {
  logger.info('Ação política', data);
  simulateVoting(data.referendum);
}

function handleGameEnded(data) {
  logger.info('Jogo terminado', data);
  if (data.winner === playerId) {
    logger.success('Você venceu!');
  } else {
    logger.warn('Você perdeu.');
  }
  
  setTimeout(disconnect, 3000);
}

// Sequência de testes
function runNextTest() {
  console.log('=== Executando teste', gameState.testSequence, '===');
  
  switch (gameState.testSequence) {
    case 0:
      console.log('Criando jogo...');
      createGame();
      break;
      
    case 1:
      console.log('Comprando cartas iniciais...');
      sendToServer({
        type: 'drawCards',
        count: 7
      });
      break;
      
    case 2:
      console.log('Descartando carta para pool...');
      if (gameState.hand.length > 0) {
        sendToServer({
          type: 'discardForPool',
          cardIds: [gameState.hand[0].id]
        });
      } else {
        console.log('Sem cartas na mão para descartar');
      }
      break;
      
    case 3:
      console.log('Tentando ação de vampiro...');
      if (gameState.ready_region.length > 0) {
        const vampire = gameState.ready_region[0];
        console.log('Usando vampiro:', vampire.name);
        sendToServer({
          type: 'vampireAction',
          vampireId: vampire.id,
          action: 'bleed',
          target: getRandomOpponent()
        });
      } else {
        console.log('Sem vampiros prontos para agir');
      }
      break;
      
    case 4:
      console.log('Tentando transferência de sangue...');
      if (gameState.ready_region.length > 0) {
        const vampire = gameState.ready_region[0];
        console.log('Transferindo sangue para:', vampire.name);
        sendToServer({
          type: 'transferBlood',
          sourceId: vampire.id,
          targetId: vampire.id,
          amount: 1
        });
      } else {
        console.log('Sem vampiros para transferir sangue');
      }
      break;
      
    case 5:
      console.log('Iniciando ação política...');
      sendToServer({
        type: 'politicalAction',
        title: 'Teste de Referendo',
        text: 'Votar em teste'
      });
      break;
      
    case 6:
      console.log('Finalizando turno...');
      sendToServer({
        type: 'endTurn'
      });
      break;
      
    default:
      console.log('Sequência de testes concluída');
      break;
  }
  
  gameState.testSequence++;
}

// Funções de ação
async function createGame() {
  const deck = await fetchCardsFromAPI();
  if (!deck) {
    console.error('Não foi possível criar o deck');
    return;
  }
  
  sendToServer({
    type: 'createGame',
    title: `${playerData.name}'s Game`,
    clanFocus: playerData.selectedClan,
    deck: deck
  });
}

function simulateTurn() {
  switch (gameState.currentPhase) {
    case 'untap':
      // Aguardar processamento do servidor
      break;
      
    case 'master':
      // Simular jogar uma carta master ou passar
      setTimeout(() => {
        sendToServer({
          type: 'masterAction',
          action: 'endPhase'
        });
      }, 1000);
      break;
      
    case 'minion':
      // Simular ações de vampiros
      setTimeout(() => {
        if (gameState.ready_region.length > 0) {
          const vampire = gameState.ready_region[0];
          sendToServer({
            type: 'vampireAction',
            vampireId: vampire.id,
            action: 'bleed',
            target: getRandomOpponent()
          });
        } else {
          sendToServer({
            type: 'minionAction',
            action: 'endPhase'
          });
        }
      }, 1000);
      break;
      
    case 'influence':
      // Simular uso de influência ou passar
      setTimeout(() => {
        sendToServer({
          type: 'influenceAction',
          action: 'endPhase'
        });
      }, 1000);
      break;
      
    case 'discard':
      // Descartar se necessário e terminar turno
      setTimeout(() => {
        if (gameState.hand.length > 7) {
          const cardsToDiscard = gameState.hand.slice(7);
          sendToServer({
            type: 'discardAction',
            cards: cardsToDiscard.map(c => c.id)
          });
        }
        sendToServer({
          type: 'discardAction',
          action: 'endPhase'
        });
      }, 1000);
      break;
  }
}

function simulateCombat(combat) {
  // Simular ações de combate básicas
  sendToServer({
    type: 'combatAction',
    action: {
      type: 'strike',
      damage: 1,
      range: 'close'
    }
  });
}

function simulateVoting(referendum) {
  // Simular voto em referendo
  sendToServer({
    type: 'vote',
    votes: gameState.influence,
    support: Math.random() > 0.5
  });
}

function getRandomOpponent() {
  // Implementar seleção de oponente aleatório
  return 'opponent-1';
}

// Funções auxiliares
function updateGameState(newState) {
  Object.assign(gameState, newState);
}

function sendToServer(data) {
  const message = Buffer.from(JSON.stringify(data));
  client.send(message, 0, message.length, SERVER_PORT, SERVER_HOST, (err) => {
    if (err) console.error('Erro ao enviar mensagem:', err);
    else console.log('Mensagem enviada:', data);
  });
}

// Conectar ao servidor
function connect() {
  sendToServer({
    type: 'connect',
    playerData: playerData
  });
}

// Desconectar
function disconnect() {
  sendToServer({
    type: 'disconnect'
  });
  
  setTimeout(() => {
    client.close();
    console.log('Desconectado do servidor');
  }, 500);
}

// Tratamento de erros
client.on('error', (err) => {
  logger.error('Erro no cliente', { error: err.message });
});

// Tratamento de sinais para encerramento limpo
process.on('SIGINT', () => {
  logger.info('Encerrando cliente...');
  disconnect();
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Iniciar conexão
connect();

console.log('Cliente iniciado. Pressione Ctrl+C para desconectar.');