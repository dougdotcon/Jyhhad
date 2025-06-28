const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');
const { 
  GAME_CONSTANTS, 
  CLANS, 
  createVampire, 
  createActionCard,
  createInitialPlayerState,
  initiateCombat,
  resolveCombatRound,
  transferBlood,
  checkVampireDestruction
} = require('./lib/function');

const {
  TURN_PHASES,
  startNewTurn,
  processUntapPhase,
  processMasterPhase,
  processMinionPhase,
  processInfluencePhase,
  processDiscardPhase,
  processPoliticalAction,
  checkVictoryConditions
} = require('./lib/turnFuctions');

// Configurações do servidor
const SERVER_PORT = 41234;
const SERVER_ADDRESS = '0.0.0.0';

// Armazenamento de dados do jogo
const games = new Map();
const clients = new Map();
const waitingPlayers = [];

// Constantes do jogo
const INITIAL_POOL = 30;
const MAX_HAND_SIZE = 7;
const CARDS_PER_TURN = 2;

// Inicializar o servidor
server.on('listening', () => {
  const address = server.address();
  console.log(`Servidor VTES rodando em ${address.address}:${address.port}`);
});

// Tratamento de erros
server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});

// Iniciar o servidor
server.bind(SERVER_PORT, SERVER_ADDRESS);

// Função principal para processar mensagens
server.on('message', (message, rinfo) => {
  const clientId = `${rinfo.address}:${rinfo.port}`;
  
  try {
    const data = JSON.parse(message.toString());
    handleMessage(clientId, data, rinfo);
  } catch (error) {
    console.error(`Erro ao processar mensagem de ${clientId}:`, error);
    sendToClient(clientId, { 
      type: 'error', 
      message: 'Formato de mensagem inválido' 
    }, rinfo);
  }
});

// Função para enviar mensagem para um cliente
function sendToClient(clientId, data, rinfo = null) {
  const client = clients.get(clientId);
  if (!client && !rinfo) return;
  
  const message = Buffer.from(JSON.stringify(data));
  const address = rinfo ? rinfo.address : client.address;
  const port = rinfo ? rinfo.port : client.port;
  
  server.send(message, 0, message.length, port, address, (err) => {
    if (err) console.error(`Erro ao enviar mensagem para ${clientId}:`, err);
  });
}

// Função para lidar com mensagens recebidas
function handleMessage(clientId, data, rinfo) {
  console.log(`Mensagem recebida de ${clientId}: ${JSON.stringify(data)}`);
  
  switch (data.type) {
    case 'connect':
      handleConnect(clientId, data, rinfo);
      break;
      
    case 'createGame':
      handleCreateGame(clientId, data);
      break;
      
    case 'joinGame':
      handleJoinGame(clientId, data);
      break;
      
    case 'masterAction':
      handleMasterAction(clientId, data);
      break;
      
    case 'vampireAction':
      handleVampireAction(clientId, data);
      break;
      
    case 'minionAction':
      handleMinionAction(clientId, data);
      break;
      
    case 'influenceAction':
      handleInfluenceAction(clientId, data);
      break;
      
    case 'discardAction':
      handleDiscardAction(clientId, data);
      break;
      
    case 'combatAction':
      handleCombatAction(clientId, data);
      break;
      
    case 'vote':
      handleVote(clientId, data);
      break;
      
    case 'disconnect':
      handleDisconnect(clientId);
      break;
  }
}

// Handlers específicos
function handleConnect(clientId, data, rinfo) {
  // Registrar cliente
  clients.set(clientId, {
    id: clientId,
    address: rinfo.address,
    port: rinfo.port,
    playerData: data.playerData,
    gameId: null
  });
  
  // Enviar confirmação
  sendToClient(clientId, {
    type: 'connected',
    id: clientId,
    message: 'Conectado ao servidor VTES'
  });
  
  console.log(`Cliente ${clientId} conectado como ${data.playerData.name}`);
}

function handleCreateGame(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;
  
  const gameId = `game-${Date.now()}`;
  
  // Criar jogo
  const game = {
    id: gameId,
    title: data.title,
    creator: clientId,
    players: [clientId],
    state: 'waiting',
    currentPlayer: clientId, // Definir jogador atual
    currentPhase: TURN_PHASES.UNTAP, // Definir fase inicial
    turnNumber: 1, // Começar do turno 1
    playerStates: {},
    activeCombat: null,
    activeReferendum: null,
    events: [],
    createdAt: Date.now()
  };
  
  // Criar estado inicial do jogador
  game.playerStates[clientId] = createInitialPlayerState(
    clientId,
    createInitialDeck(data.clanFocus),
    createInitialCrypt(data.clanFocus)
  );
  
  // Adicionar jogo à lista
  games.set(gameId, game);
  
  // Atualizar cliente
  client.gameId = gameId;
  
  // Iniciar o jogo imediatamente (já que é single player por enquanto)
  game.state = 'started';
  
  // Notificar criador
  sendToClient(clientId, {
    type: 'gameCreated',
    game: getPublicGameData(game)
  });
  
  // Iniciar o primeiro turno
  startPlayerTurn(game, clientId);
  
  console.log(`Jogo ${gameId} criado por ${clientId}`);
}

function handleJoinGame(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;
  
  const game = games.get(data.gameId);
  if (!game) {
    sendToClient(clientId, {
      type: 'error',
      message: 'Jogo não encontrado'
    });
    return;
  }
  
  if (game.state !== 'waiting') {
    sendToClient(clientId, {
      type: 'error',
      message: 'Não é possível entrar em um jogo que já começou'
    });
    return;
  }
  
  // Adicionar jogador ao jogo
  game.players.push(clientId);
  game.playerStates[clientId] = createInitialPlayerState(
    clientId,
    createInitialDeck(data.clanFocus),
    createInitialCrypt(data.clanFocus)
  );
  
  // Atualizar cliente
  client.gameId = data.gameId;
  
  // Notificar todos os jogadores
  notifyGamePlayers(data.gameId, {
    type: 'playerJoined',
    playerId: clientId,
    playerName: client.playerData.name,
    game: getPublicGameData(game)
  });
}

function handleMasterAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || game.currentPlayer !== clientId) return;
  
  const result = processMasterPhase(game, clientId, data);
  
  if (result.success) {
    // Atualizar fase se necessário
    if (result.nextPhase) {
      game.currentPhase = result.nextPhase;
      notifyGamePlayers(client.gameId, {
        type: 'phaseChanged',
        phase: result.nextPhase,
        events: result.events
      });
    }
  } else {
    sendToClient(clientId, {
      type: 'error',
      message: result.message
    });
  }
}

function handleVampireAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || game.currentPlayer !== clientId) return;
  
  // Processar ação do vampiro
  const vampire = findVampire(game, clientId, data.vampireId);
  if (!vampire || !vampire.ready || vampire.actions < 1) {
    sendToClient(clientId, {
      type: 'error',
      message: 'Ação de vampiro inválida'
    });
    return;
  }
  
  // Executar ação específica
  switch (data.action) {
    case 'bleed':
      handleBleedAction(game, clientId, vampire, data.target);
      break;
      
    case 'hunt':
      handleHuntAction(game, clientId, vampire);
      break;
      
    // Adicionar mais ações conforme necessário
  }
}

function handleMinionAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || game.currentPlayer !== clientId) return;
  
  const result = processMinionPhase(game, clientId, data);
  
  if (result.success) {
    if (result.nextPhase) {
      game.currentPhase = result.nextPhase;
      notifyGamePlayers(client.gameId, {
        type: 'phaseChanged',
        phase: result.nextPhase,
        events: result.events
      });
    }
  } else {
    sendToClient(clientId, {
      type: 'error',
      message: result.message
    });
  }
}

function handleInfluenceAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || game.currentPlayer !== clientId) return;
  
  const result = processInfluencePhase(game, clientId, data);
  
  if (result.success) {
    if (result.nextPhase) {
      game.currentPhase = result.nextPhase;
      notifyGamePlayers(client.gameId, {
        type: 'phaseChanged',
        phase: result.nextPhase,
        events: result.events
      });
    }
  } else {
    sendToClient(clientId, {
      type: 'error',
      message: result.message
    });
  }
}

function handleDiscardAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || game.currentPlayer !== clientId) return;
  
  const result = processDiscardPhase(game, clientId, data);
  
  if (result.success) {
    if (result.endTurn) {
      // Passar para próximo jogador
      const nextPlayer = getNextPlayer(game, clientId);
      startPlayerTurn(game, nextPlayer);
    } else if (result.nextPhase) {
      game.currentPhase = result.nextPhase;
      notifyGamePlayers(client.gameId, {
        type: 'phaseChanged',
        phase: result.nextPhase,
        events: result.events
      });
    }
  } else {
    sendToClient(clientId, {
      type: 'error',
      message: result.message
    });
  }
}

function handleCombatAction(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || !game.activeCombat) return;
  
  const combat = game.activeCombat;
  const isAttacker = combat.participants.attacker.id === clientId;
  
  if (!isAttacker && combat.participants.defender.id !== clientId) return;
  
  // Resolver rodada de combate
  const result = resolveCombatRound(
    combat,
    isAttacker ? data.action : null,
    !isAttacker ? data.action : null
  );
  
  // Notificar jogadores sobre o resultado
  notifyGamePlayers(client.gameId, {
    type: 'combatUpdated',
    combat: getCombatPublicData(result)
  });
  
  // Verificar se o combate terminou
  if (result.status === 'ended') {
    game.activeCombat = null;
    notifyGamePlayers(client.gameId, {
      type: 'combatEnded',
      result: result
    });
  }
}

function handleVote(clientId, data) {
  const client = clients.get(clientId);
  if (!client || !client.gameId) return;
  
  const game = games.get(client.gameId);
  if (!game || !game.activeReferendum) return;
  
  const result = processPoliticalAction(game, clientId, data);
  
  if (result.success) {
    notifyGamePlayers(client.gameId, {
      type: 'referendumUpdated',
      referendum: result.referendum
    });
    
    if (result.completed) {
      game.activeReferendum = null;
      notifyGamePlayers(client.gameId, {
        type: 'referendumCompleted',
        result: result
      });
    }
  }
}

function handleDisconnect(clientId) {
  const client = clients.get(clientId);
  if (!client) return;
  
  if (client.gameId) {
    const game = games.get(client.gameId);
    if (game) {
      // Remover jogador do jogo
      removePlayerFromGame(game, clientId);
    }
  }
  
  // Remover cliente
  clients.delete(clientId);
  console.log(`Cliente ${clientId} desconectado`);
}

// Funções auxiliares
function createInitialDeck(clanFocus) {
  // Criar deck inicial com 40 cartas
  const deck = [];
  
  // Adicionar cartas básicas
  for (let i = 0; i < 10; i++) {
    deck.push(createActionCard({
      id: `card-${Date.now()}-${i}`,
      name: 'Blood Feast',
      type: 'master',
      cost: 1,
      effect: 'Gain 2 blood'
    }));
  }
  
  for (let i = 0; i < 15; i++) {
    deck.push(createActionCard({
      id: `card-${Date.now()}-${i+10}`,
      name: 'Strength of One',
      type: 'combat',
      cost: 0,
      effect: 'Add 1 to strength'
    }));
  }
  
  for (let i = 0; i < 15; i++) {
    deck.push(createActionCard({
      id: `card-${Date.now()}-${i+25}`,
      name: 'Presence',
      type: 'political',
      cost: 1,
      effect: 'Call referendum'
    }));
  }
  
  return deck;
}

function createInitialCrypt(clanFocus) {
  // Criar cripta inicial com 12 vampiros
  const crypt = [];
  const clan = CLANS[clanFocus] || CLANS.VENTRUE;
  
  for (let i = 0; i < 12; i++) {
    crypt.push(createVampire({
      id: `vampire-${Date.now()}-${i}`,
      name: `${clan.name} Elder ${i+1}`,
      clan: clan.name,
      capacity: Math.floor(Math.random() * 5) + 4,
      disciplines: clan.disciplines,
      blood: 0,
      ready: false,
      actions: 0
    }));
  }
  
  return crypt;
}

function getPublicGameData(game) {
  // Retornar versão pública dos dados do jogo
  return {
    id: game.id,
    title: game.title,
    players: game.players,
    state: game.state,
    currentPlayer: game.currentPlayer,
    currentPhase: game.currentPhase,
    turnNumber: game.turnNumber
  };
}

function getCombatPublicData(combat) {
  // Retornar versão pública dos dados de combate
  return {
    round: combat.round,
    phase: combat.currentPhase,
    status: combat.status,
    log: combat.log
  };
}

function notifyGamePlayers(gameId, data) {
  const game = games.get(gameId);
  if (!game) return;
  
  game.players.forEach(playerId => {
    sendToClient(playerId, data);
  });
}

function getNextPlayer(game, currentPlayer) {
  const currentIndex = game.players.indexOf(currentPlayer);
  return game.players[(currentIndex + 1) % game.players.length];
}

function startPlayerTurn(game, playerId) {
  game.currentPlayer = playerId;
  game.currentPhase = TURN_PHASES.UNTAP;
  
  const playerState = game.playerStates[playerId];
  if (!playerState) return;
  
  // Notificar início do turno
  notifyGamePlayers(game.id, {
    type: 'turnStarted',
    playerId: playerId,
    turnNumber: game.turnNumber,
    phase: game.currentPhase,
    playerState: {
      hand: playerState.hand,
      ready_region: playerState.ready_region,
      uncontrolled_region: playerState.uncontrolled_region,
      torpor_region: playerState.torpor_region,
      pool: playerState.pool,
      influence: playerState.influence
    }
  });
  
  // Processar fase de untap automaticamente
  const untapResult = processUntapPhase(game, playerId);
  if (untapResult.success && untapResult.nextPhase) {
    game.currentPhase = untapResult.nextPhase;
    notifyGamePlayers(game.id, {
      type: 'phaseChanged',
      phase: untapResult.nextPhase,
      events: untapResult.events
    });
  }
}

function removePlayerFromGame(game, playerId) {
  const playerIndex = game.players.indexOf(playerId);
  if (playerIndex !== -1) {
    game.players.splice(playerIndex, 1);
    delete game.playerStates[playerId];
    
    if (game.players.length === 0) {
      // Remover jogo se não houver mais jogadores
      games.delete(game.id);
    } else {
      // Notificar jogadores restantes
      notifyGamePlayers(game.id, {
        type: 'playerLeft',
        playerId: playerId
      });
      
      // Se era o turno do jogador que saiu, passar para o próximo
      if (game.currentPlayer === playerId) {
        const nextPlayer = getNextPlayer(game, playerId);
        startPlayerTurn(game, nextPlayer);
      }
    }
  }
}

function findVampire(game, playerId, vampireId) {
  const playerState = game.playerStates[playerId];
  if (!playerState) return null;
  
  return playerState.ready_region.find(v => v.id === vampireId) ||
         playerState.uncontrolled_region.find(v => v.id === vampireId) ||
         playerState.torpor_region.find(v => v.id === vampireId);
}

// Funções de ações específicas
function handleBleedAction(game, playerId, vampire, targetId) {
  // Implementar ação de bleed
  vampire.actions--;
  
  // Notificar jogadores
  notifyGamePlayers(game.id, {
    type: 'bleedAction',
    vampire: vampire.name,
    target: targetId
  });
}

function handleHuntAction(game, playerId, vampire) {
  // Implementar ação de caçada
  vampire.actions--;
  
  // Notificar jogadores
  notifyGamePlayers(game.id, {
    type: 'huntAction',
    vampire: vampire.name
  });
}

// Tratamento de sinais para encerramento limpo
process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  
  // Notificar todos os clientes
  for (const [clientId, client] of clients) {
    sendToClient(clientId, {
      type: 'serverShutdown',
      message: 'Servidor está sendo desligado'
    });
  }
  
  setTimeout(() => {
    server.close(() => {
      console.log('Servidor encerrado');
      process.exit(0);
    });
  }, 1000);
});

module.exports = {
  server,
  games,
  clients,
  waitingPlayers,
  INITIAL_POOL,
  MAX_HAND_SIZE,
  CARDS_PER_TURN
};