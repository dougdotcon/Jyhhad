// Cliente de teste para o servidor de jogo UDP
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// Configurações do servidor
const SERVER_PORT = 41234;
const SERVER_HOST = '127.0.0.1';
let playerId = null;

// Dados do jogador simulado
const playerData = {
  name: 'Player' + Math.floor(Math.random() * 1000),
  selectedClan: 'VENTRUE',
  deck: [],
  crypt: []
};

// Estado do jogo local
let gameState = {
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

// Tratamento de mensagens recebidas
client.on('message', (message, rinfo) => {
  try {
    const data = JSON.parse(message.toString());
    console.log('Recebido do servidor:', data);
    
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
    }
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
  }
});

// Handlers de eventos
function handleConnected(data) {
  playerId = data.id;
  console.log(`Conectado ao servidor como ${playerId}`);
  
  // Iniciar sequência de testes após conexão
  setTimeout(runNextTest, 1000);
}

function handleGameCreated(data) {
  console.log('Jogo criado:', data.game);
  gameState.gameId = data.game.id;
  runNextTest();
}

function handleGameJoined(data) {
  console.log('Entrou no jogo:', data.game);
  updateGameState(data.game);
  runNextTest();
}

function handleTurnStarted(data) {
  console.log('=== Turno iniciado ===');
  console.log('Jogador:', data.playerId);
  console.log('Número do turno:', data.turnNumber);
  console.log('Fase:', data.phase);
  
  if (data.playerState) {
    console.log('Estado do jogador:');
    console.log('- Mão:', data.playerState.hand.length, 'cartas');
    console.log('- Vampiros prontos:', data.playerState.ready_region.length);
    console.log('- Região não controlada:', data.playerState.uncontrolled_region.length);
    console.log('- Pool:', data.playerState.pool);
    console.log('- Influência:', data.playerState.influence);
  }
  
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
    console.log('É seu turno!');
    runNextTest();
  }
}

function handlePhaseChanged(data) {
  console.log('=== Fase alterada ===');
  console.log('Nova fase:', data.phase);
  if (data.events) {
    console.log('Eventos:', data.events);
  }
  
  gameState.currentPhase = data.phase;
  
  if (gameState.isMyTurn) {
    console.log('Executando ação da fase', data.phase);
    runNextTest();
  }
}

function handleCardsDrawn(data) {
  console.log('Cartas compradas:', data.cards);
  gameState.hand = gameState.hand.concat(data.cards);
  runNextTest();
}

function handleVampireReadied(data) {
  console.log('Vampiro preparado:', data.vampireName);
  const vampire = gameState.ready_region.find(v => v.id === data.vampireId);
  if (vampire) {
    vampire.ready = true;
    vampire.actions = 1;
  }
  runNextTest();
}

function handleCombatInitiated(data) {
  console.log('Combate iniciado:', data);
  // Simular ações de combate
  simulateCombat(data.combat);
}

function handleCombatResolved(data) {
  console.log('Combate resolvido:', data);
}

function handlePoliticalAction(data) {
  console.log('Ação política:', data);
  // Simular votação
  simulateVoting(data.referendum);
}

function handleGameEnded(data) {
  console.log('Jogo terminado:', data);
  if (data.winner === playerId) {
    console.log('Você venceu!');
  } else {
    console.log('Você perdeu.');
  }
  
  // Desconectar após alguns segundos
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
function createGame() {
  sendToServer({
    type: 'createGame',
    title: `${playerData.name}'s Game`,
    clanFocus: playerData.selectedClan
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
  console.error('Erro no cliente:', err);
});

// Tratamento de sinais para encerramento limpo
process.on('SIGINT', () => {
  disconnect();
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Iniciar conexão
connect();

console.log('Cliente iniciado. Pressione Ctrl+C para desconectar.');