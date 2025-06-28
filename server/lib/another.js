const { GAME_CONSTANTS, checkVampireDestruction } = require('./function');
const { TURN_PHASES } = require('./turnFuctions');

// Função para lidar com mensagens recebidas
function handleMessage(clientId, data, rinfo) {
    console.log(`Mensagem recebida de ${clientId}: ${JSON.stringify(data)}`);
    
    switch (data.type) {
      case 'connect':
        return handleConnect(clientId, data, rinfo);
        
      case 'createGame':
        return handleCreateGame(clientId, data);
        
      case 'joinGame':
        return handleJoinGame(clientId, data);
        
      case 'startGame':
        return handleStartGame(clientId, data);
        
      case 'drawCards':
        return handleDrawCards(clientId, data);
        
      case 'playCard':
        return handlePlayCard(clientId, data);
        
      case 'discardForPool':
        return handleDiscardForPool(clientId, data);
        
      case 'vampireAction':
        return handleVampireAction(clientId, data);
        
      case 'initiateAttack':
        return handleInitiateAttack(clientId, data);
        
      case 'blockAction':
        return handleBlockAction(clientId, data);
        
      case 'resolveAttack':
        return handleResolveAttack(clientId, data);
        
      case 'transferBlood':
        return handleTransferBlood(clientId, data);
        
      case 'endTurn':
        return handleEndTurn(clientId, data);
        
      case 'disconnect':
        return handleDisconnect(clientId);
        
      default:
        return {
          type: 'error',
          message: 'Tipo de mensagem desconhecido'
        };
    }
  }
  
  // Função para tratar conexão de cliente
  function handleConnect(clientId, data, rinfo) {
    // Validar dados do jogador
    if (!data.playerData || !data.playerData.name) {
      return {
        type: 'error',
        message: 'Dados do jogador inválidos'
      };
    }
    
    // Registrar o cliente
    clients.set(clientId, {
      id: clientId,
      address: rinfo.address,
      port: rinfo.port,
      playerData: data.playerData || { name: `Player-${clients.size + 1}` },
      gameId: null,
      lastActivity: Date.now()
    });
    
    // Enviar confirmação
    sendToClient(clientId, {
      type: 'connected',
      id: clientId,
      message: 'Conectado ao servidor VTES',
      games: Array.from(games.keys())
    }, rinfo);
    
    console.log(`Cliente ${clientId} conectado como ${clients.get(clientId).playerData.name}`);
    
    // Notificar os outros clientes
    broadcastPlayerList();
    
    return {
      type: 'connected',
      id: clientId,
      message: 'Conectado ao servidor VTES'
    };
  }
  
  // Função para criar um novo jogo
  function handleCreateGame(clientId, data) {
    // Validar dados do jogo
    if (!data.title) {
      return {
        type: 'error',
        message: 'Título do jogo é obrigatório'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = `game-${Date.now()}`;
    const gameTitle = data.title || `${client.playerData.name}'s Game`;
    
    // Criar estrutura do jogo
    const game = {
      id: gameId,
      title: gameTitle,
      creator: clientId,
      players: [clientId],
      state: 'waiting', // waiting, playing, finished
      currentPlayer: null,
      currentPhase: null,
      turnNumber: 0,
      playerStates: {},
      activeCombat: null,
      activeReferendum: null,
      events: [],
      createdAt: Date.now()
    };
    
    // Inicializar estado do jogador
    game.playerStates[clientId] = createInitialPlayerState(clientId, data.clanFocus);
    
    // Adicionar jogo à lista
    games.set(gameId, game);
    
    // Atualizar cliente
    client.gameId = gameId;
    
    // Notificar criador
    sendToClient(clientId, {
      type: 'gameCreated',
      game: getPublicGameData(game)
    });
    
    // Notificar todos os clientes sobre o novo jogo
    broadcastGameList();
    
    console.log(`Jogo ${gameId} (${gameTitle}) criado por ${clientId}`);
    
    return {
      type: 'gameCreated',
      game: {
        id: gameId,
        title: gameTitle,
        creator: clientId,
        players: [clientId],
        state: 'waiting'
      }
    };
  }
  
  // Função para entrar em um jogo
  function handleJoinGame(clientId, data) {
    // Validar dados
    if (!data.gameId) {
      return {
        type: 'error',
        message: 'ID do jogo é obrigatório'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = data.gameId;
    const game = games.get(gameId);
    
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
    
    // Já está no jogo?
    if (game.players.includes(clientId)) {
      sendToClient(clientId, {
        type: 'gameJoined',
        game: getPublicGameData(game)
      });
      return;
    }
    
    // Adicionar jogador ao jogo
    game.players.push(clientId);
    game.playerStates[clientId] = createInitialPlayerState(clientId, data.clanFocus);
    
    // Atualizar cliente
    client.gameId = gameId;
    
    // Notificar todos os jogadores no jogo
    notifyGamePlayers(gameId, {
      type: 'playerJoined',
      playerId: clientId,
      playerName: client.playerData.name,
      game: getPublicGameData(game)
    });
    
    console.log(`Jogador ${clientId} entrou no jogo ${gameId}`);
    
    return {
      type: 'gameJoined',
      gameId: gameId,
      player: clientId
    };
  }
  
  // Função para iniciar o jogo
  function handleStartGame(clientId, data) {
    // Validar condições para início do jogo
    if (!data.gameId) {
      return {
        type: 'error',
        message: 'ID do jogo é obrigatório'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado'
      });
      return;
    }
    
    // Apenas o criador pode iniciar o jogo
    if (game.creator !== clientId) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Apenas o criador do jogo pode iniciá-lo'
      });
      return;
    }
    
    if (game.players.length < 2) {
      sendToClient(clientId, {
        type: 'error',
        message: 'São necessários pelo menos 2 jogadores para iniciar'
      });
      return;
    }
    
    // Iniciar o jogo
    game.state = 'playing';
    game.turnNumber = 1;
    
    // Determinar jogador inicial aleatoriamente
    const firstPlayerIndex = Math.floor(Math.random() * game.players.length);
    game.currentPlayer = game.players[firstPlayerIndex];
    game.currentPhase = 'untap';
    
    // Cada jogador compra mão inicial
    for (const playerId of game.players) {
      const drawResult = drawCards(game, playerId, MAX_HAND_SIZE);
      
      // Notificar cada jogador sobre suas cartas
      sendToClient(playerId, {
        type: 'gameStarted',
        game: getPrivateGameData(game, playerId),
        initialHand: drawResult.cards
      });
    }
    
    // Notificar todos sobre o início do jogo (sem as cartas)
    notifyGamePlayers(gameId, {
      type: 'gameStarted',
      game: getPublicGameData(game),
      currentPlayer: game.currentPlayer,
      currentPhase: game.currentPhase
    });
    
    console.log(`Jogo ${gameId} iniciado. Jogador inicial: ${game.currentPlayer}`);
    
    return {
      type: 'gameStarted',
      gameId: gameId,
      firstPlayer: clientId,
      phase: TURN_PHASES.UNTAP
    };
  }
  
  // Função para comprar cartas
  function handleDrawCards(clientId, data) {
    // Validar regras de compra de cartas
    const count = data.count || GAME_CONSTANTS.CARDS_PER_TURN;
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    // Verificar se é a vez do jogador e se está na fase correta
    if (game.currentPlayer !== clientId || game.currentPhase !== 'untap') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Não é sua vez ou fase incorreta'
      });
      return;
    }
    
    const drawResult = drawCards(game, clientId, count);
    
    // Verificar se o jogador perdeu por não conseguir comprar
    if (!drawResult.success && game.playerStates[clientId].deck.length === 0) {
      game.state = 'finished';
      game.winner = getNextPlayer(game, clientId); // Jogador oposto ganha
      
      notifyGamePlayers(gameId, {
        type: 'gameEnded',
        winner: game.winner,
        reason: `${client.playerData.name} não pode comprar cartas`
      });
      
      return;
    }
    
    // Notificar jogador sobre as cartas compradas
    sendToClient(clientId, {
      type: 'cardsDrawn',
      cards: drawResult.cards,
      remaining: game.playerStates[clientId].deck.length
    });
    
    // Notificar outros jogadores (sem mostrar as cartas)
    notifyOtherPlayers(gameId, clientId, {
      type: 'playerDrewCards',
      playerId: clientId,
      count: drawResult.cards.length
    });
    
    // Mover para a próxima fase automaticamente
    game.currentPhase = 'influence';
    
    notifyGamePlayers(gameId, {
      type: 'phaseChanged',
      phase: game.currentPhase,
      player: game.currentPlayer
    });
    
    console.log(`Jogador ${clientId} comprou ${drawResult.cards.length} cartas`);
    
    return {
      type: 'cardsDrawn',
      count: count,
      cards: drawResult.cards
    };
  }
  
  // Função para jogar uma carta
  function handlePlayCard(clientId, data) {
    // Validar jogada de carta
    if (!data.cardId) {
      return {
        type: 'error',
        message: 'ID da carta é obrigatório'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    // Verificar se é a vez do jogador
    if (game.currentPlayer !== clientId) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Não é sua vez'
      });
      return;
    }
    
    const cardId = data.cardId;
    const playerState = game.playerStates[clientId];
    
    // Encontrar a carta na mão do jogador
    const cardIndex = playerState.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Carta não encontrada na sua mão'
      });
      return;
    }
    
    const card = playerState.hand[cardIndex];
    
    // Lógica específica para cada tipo de carta
    switch (card.type) {
      case 'Vampire':
        // Verificar se está na fase de influência
        if (game.currentPhase !== 'influence') {
          sendToClient(clientId, {
            type: 'error',
            message: 'Vampiros só podem ser jogados na fase de influência'
          });
          return;
        }
        
        // Verificar se tem pool suficiente
        if (playerState.pool < card.capacity) {
          sendToClient(clientId, {
            type: 'error',
            message: 'Pool insuficiente para jogar este vampiro'
          });
          return;
        }
        
        // Remover da mão e colocar na zona de controle
        playerState.hand.splice(cardIndex, 1);
        playerState.vampires.push({
          ...card,
          state: 'ready',
          blood: card.capacity,
          tapped: false,
          equipment: [],
          actions: 1
        });
        
        // Reduzir pool
        playerState.pool -= card.capacity;
        
        break;
        
      case 'Action':
      case 'Reaction':
      case 'Equipment':
      case 'Event':
        // Implementar lógica específica para cada tipo
        // Para fins de demonstração, apenas descartamos a carta
        playerState.hand.splice(cardIndex, 1);
        playerState.discardPile.push(card);
        
        break;
        
      default:
        sendToClient(clientId, {
          type: 'error',
          message: 'Tipo de carta não suportado'
        });
        return;
    }
    
    // Notificar jogador
    sendToClient(clientId, {
      type: 'cardPlayed',
      card: card,
      newState: getPrivateGameData(game, clientId)
    });
    
    // Notificar outros jogadores
    notifyOtherPlayers(gameId, clientId, {
      type: 'playerPlayedCard',
      playerId: clientId,
      card: getPublicCardData(card),
      newState: getPublicGameData(game)
    });
    
    console.log(`Jogador ${clientId} jogou carta ${card.name} (${card.type})`);
    
    return {
      type: 'cardPlayed',
      cardId: cardId,
      playerId: clientId
    };
  }

  function handleDiscardForPool(clientId, data) {
    // Validar descarte para pool
    if (!data.cardIds || !Array.isArray(data.cardIds)) {
      return {
        type: 'error',
        message: 'Lista de cartas para descarte é obrigatória'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    // Verificar se é a vez do jogador e se está na fase correta
    if (game.currentPlayer !== clientId || game.currentPhase !== 'untap') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Só é possível descartar para pool na fase de untap do seu turno'
      });
      return;
    }
    
    const cardIds = data.cardIds || [];
    if (cardIds.length === 0) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Nenhuma carta selecionada para descarte'
      });
      return;
    }
    
    // Chamar a função de utilitário para descartar cartas
    const result = discardForPool(game, clientId, cardIds);
    
    if (!result.success) {
      sendToClient(clientId, {
        type: 'error',
        message: result.message
      });
      return;
    }
    
    // Notificar o jogador sobre o descarte
    sendToClient(clientId, {
      type: 'discardedForPool',
      discarded: result.discarded,
      newPool: result.newPool,
      message: result.message
    });
    
    // Notificar outros jogadores (sem mostrar detalhes das cartas)
    notifyOtherPlayers(gameId, clientId, {
      type: 'playerDiscardedForPool',
      playerId: clientId,
      count: result.discarded.length,
      newPool: result.newPool
    });
    
    console.log(`Jogador ${clientId} descartou ${result.discarded.length} cartas para pool`);
    
    return {
      type: 'discardedForPool',
      cardIds: cardIds,
      poolGained: cardIds.length
    };
  }
  
  function handleVampireAction(clientId, data) {
    // Validar ação do vampiro
    if (!data.vampireId || !data.action) {
      return {
        type: 'error',
        message: 'ID do vampiro e tipo de ação são obrigatórios'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    const vampireId = data.vampireId;
    const action = data.action;
    
    const vampireIndex = game.playerStates[clientId].vampires.findIndex(vampire => vampire.id === vampireId);
    if (vampireIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Vampiro não encontrado'
      });
      return;
    }
    
    const vampire = game.playerStates[clientId].vampires[vampireIndex];
    
    // Lógica específica para cada tipo de ação
    switch (action) {
      case 'destroy':
        // Implementar lógica para destruir o vampiro
        game.playerStates[clientId].vampires.splice(vampireIndex, 1);
        break;
      case 'tapped':
        vampire.tapped = true;
        break;
      case 'untapped':
        vampire.tapped = false;
        break;
      default:
        sendToClient(clientId, {
          type: 'error',
          message: 'Ação de vampiro não suportada'
        });
        return;
    }
    
    // Notificar jogador
    sendToClient(clientId, {
      type: 'vampireActionResolved',
      vampireId: vampireId,
      action: action,
      result: 'success'
    });
    
    // Notificar outros jogadores
    notifyOtherPlayers(gameId, clientId, {
      type: 'playerVampireAction',
      playerId: clientId,
      vampireId: vampireId,
      action: action
    });
    
    console.log(`Jogador ${clientId} realizou ação ${action} no vampiro ${vampireId}`);
    
    return {
      type: 'vampireActionResolved',
      vampireId: vampireId,
      action: action,
      result: 'success'
    };
  }
  
  function handleInitiateAttack(clientId, data) {
    // Validar início de ataque
    if (!data.attackerId || !data.targetId) {
      return {
        type: 'error',
        message: 'IDs do atacante e alvo são obrigatórios'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    const attackerId = data.attackerId;
    const targetId = data.targetId;
    
    const attackerIndex = game.players.findIndex(player => player.id === attackerId);
    const targetIndex = game.players.findIndex(player => player.id === targetId);
    
    if (attackerIndex === -1 || targetIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogador não encontrado'
      });
      return;
    }
    
    const attacker = game.playerStates[attackerId];
    const target = game.playerStates[targetId];
    
    // Verificar se o atacante tem cartas suficientes para iniciar o ataque
    if (attacker.deck.length === 0) {
      sendToClient(clientId, {
        type: 'error',
        message: `${attackerId} não tem cartas suficientes para iniciar o ataque`
      });
      return;
    }
    
    // Verificar se o alvo tem vampiros suficientes para ser atacado
    if (target.vampires.length === 0) {
      sendToClient(clientId, {
        type: 'error',
        message: `${targetId} não tem vampiros suficientes para ser atacado`
      });
      return;
    }
    
    // Iniciar o combate
    game.activeCombat = {
      id: `combat-${Date.now()}`,
      attackerId: attackerId,
      targetId: targetId,
      turnNumber: 1,
      events: []
    };
    
    // Notificar jogadores sobre o início do combate
    notifyGamePlayers(gameId, {
      type: 'combatStarted',
      combatId: game.activeCombat.id,
      attackerId: attackerId,
      targetId: targetId
    });
    
    console.log(`Combate iniciado entre ${attackerId} e ${targetId}`);
    
    return {
      type: 'attackInitiated',
      attackerId: attackerId,
      targetId: targetId,
      combatId: game.activeCombat.id
    };
  }
  
  function handleBlockAction(clientId, data) {
    // Validar ação de bloqueio
    if (!data.blockerId || !data.targetActionId) {
      return {
        type: 'error',
        message: 'IDs do bloqueador e da ação alvo são obrigatórios'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    const blockerId = data.blockerId;
    const targetActionId = data.targetActionId;
    
    const blockerIndex = game.playerStates[blockerId].hand.findIndex(card => card.id === targetActionId);
    if (blockerIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Ação alvo não encontrada'
      });
      return;
    }
    
    const blocker = game.playerStates[blockerId].hand[blockerIndex];
    
    // Verificar se o bloqueador pode bloquear a ação
    if (!checkVampireDestruction(blocker)) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Bloqueador não pode bloquear esta ação'
      });
      return;
    }
    
    // Bloquear a ação
    game.playerStates[blockerId].hand.splice(blockerIndex, 1);
    
    // Notificar jogador
    sendToClient(clientId, {
      type: 'blockAttempted',
      blockerId: blockerId,
      targetActionId: targetActionId,
      success: true
    });
    
    // Notificar outros jogadores
    notifyOtherPlayers(gameId, clientId, {
      type: 'playerBlockedAction',
      playerId: clientId,
      blockerId: blockerId,
      targetActionId: targetActionId
    });
    
    console.log(`Jogador ${clientId} bloqueou ação ${targetActionId} do jogador ${blockerId}`);
    
    return {
      type: 'blockAttempted',
      blockerId: blockerId,
      targetActionId: targetActionId,
      success: true
    };
  }
  
  function handleResolveAttack(clientId, data) {
    // Validar resolução de ataque
    if (!data.combatId) {
      return {
        type: 'error',
        message: 'ID do combate é obrigatório'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    const combatId = data.combatId;
    
    const combatIndex = game.events.findIndex(event => event.id === combatId);
    if (combatIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Combate não encontrado'
      });
      return;
    }
    
    const combat = game.events[combatIndex];
    
    // Verificar se o combate já foi resolvido
    if (combat.resolved) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Combate já foi resolvido'
      });
      return;
    }
    
    // Resolver o combate
    const result = resolveAttack(game, combat.attackerId, combat.targetId);
    
    // Notificar jogadores sobre o resultado do combate
    notifyGamePlayers(gameId, {
      type: 'combatResolved',
      combatId: combatId,
      result: result
    });
    
    // Marcar o combate como resolvido
    combat.resolved = true;
    
    console.log(`Combate ${combatId} resolvido. Resultado: ${result}`);
    
    return {
      type: 'attackResolved',
      combatId: combatId,
      result: result
    };
  }
  
  function handleTransferBlood(clientId, data) {
    // Validar transferência de sangue
    if (!data.sourceId || !data.targetId || !data.amount) {
      return {
        type: 'error',
        message: 'IDs da fonte, alvo e quantidade são obrigatórios'
      };
    }
    
    const client = clients.get(clientId);
    if (!client) return;
    
    const gameId = client.gameId;
    const game = games.get(gameId);
    
    if (!game || game.state !== 'playing') {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogo não encontrado ou não iniciado'
      });
      return;
    }
    
    const sourceId = data.sourceId;
    const targetId = data.targetId;
    const amount = data.amount;
    
    const sourceIndex = game.players.findIndex(player => player.id === sourceId);
    const targetIndex = game.players.findIndex(player => player.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) {
      sendToClient(clientId, {
        type: 'error',
        message: 'Jogador não encontrado'
      });
      return;
    }
    
    const source = game.playerStates[sourceId];
    const target = game.playerStates[targetId];
    
    // Verificar se o jogador tem sangue suficiente para transferir
    if (source.pool < amount) {
      sendToClient(clientId, {
        type: 'error',
        message: `${sourceId} não tem sangue suficiente para transferir`
      });
      return;
    }
    
    // Transferir sangue
    source.pool -= amount;
    target.pool += amount;
    
    // Notificar jogadores sobre a transferência de sangue
    notifyGamePlayers(gameId, {
      type: 'bloodTransferred',
      sourceId: sourceId,
      targetId: targetId,
      amount: amount
    });
    
    console.log(`Jogador ${clientId} transferiu ${amount} de sangue de ${sourceId} para ${targetId}`);
    
    return {
      type: 'bloodTransferred',
      sourceId: sourceId,
      targetId: targetId,
      amount: amount
    };
  }
  
  function handleEndTurn(clientId, data) {
    // Validar fim do turno
    return {
      type: 'turnEnded',
      playerId: clientId,
      nextPlayerId: data.nextPlayerId
    };
  }
  
  function handleDisconnect(clientId) {
    return {
      type: 'playerDisconnected',
      playerId: clientId
    };
  }
  
  module.exports = {
    handleMessage,
    handleConnect,
    handleCreateGame,
    handleJoinGame,
    handleStartGame,
    handleDrawCards,
    handlePlayCard,
    handleDiscardForPool,
    handleVampireAction,
    handleInitiateAttack,
    handleBlockAction,
    handleResolveAttack,
    handleTransferBlood,
    handleEndTurn,
    handleDisconnect
  };
  