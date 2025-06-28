const { GAME_CONSTANTS, checkVampireDestruction } = require('./function');

// Fases do turno
const TURN_PHASES = {
  UNTAP: 'untap',
  MASTER: 'master',
  MINION: 'minion',
  INFLUENCE: 'influence',
  DISCARD: 'discard'
};

// Função para embaralhar um array (Fisher-Yates shuffle)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    
    return array;
  }
  
  // Criação de um baralho para teste
  function createDeck(clanFocus = null) {
    const deck = [];
    
    // Vampiros
    const vampireClans = ['Ventrue', 'Toreador', 'Tremere', 'Malkavian', 'Nosferatu', 'Brujah', 'Gangrel'];
    const disciplines = ['Auspex', 'Dominate', 'Fortitude', 'Obfuscate', 'Potence', 'Presence', 
                         'Animalism', 'Celerity', 'Protean', 'Blood Sorcery'];
    
    // Criar vampiros
    for (let i = 0; i < 15; i++) {
      const clan = clanFocus || vampireClans[Math.floor(Math.random() * vampireClans.length)];
      const capacity = Math.floor(Math.random() * 8) + 2; // Capacidade entre 2-9
      
      // Escolher 1-3 disciplinas aleatórias
      const vampDisciplines = [];
      const numDisciplines = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numDisciplines; j++) {
        const disc = disciplines[Math.floor(Math.random() * disciplines.length)];
        if (!vampDisciplines.includes(disc)) vampDisciplines.push(disc);
      }
      
      deck.push({
        type: 'Vampire',
        name: `${clan} Elder ${i + 1}`,
        clan: clan,
        capacity: capacity,
        disciplines: vampDisciplines,
        id: `vamp-${clan}-${i}`
      });
    }
    
    // Cartas de ação
    for (let i = 0; i < 25; i++) {
      deck.push({
        type: 'Action',
        name: `Action ${i + 1}`,
        cost: Math.floor(Math.random() * 2) + 1,
        effect: `Effect for action ${i + 1}`,
        id: `action-${i}`
      });
    }
    
    // Cartas de reação
    for (let i = 0; i < 20; i++) {
      deck.push({
        type: 'Reaction',
        name: `Reaction ${i + 1}`,
        cost: Math.floor(Math.random() * 2),
        effect: `Effect for reaction ${i + 1}`,
        id: `reaction-${i}`
      });
    }
    
    // Cartas de evento
    for (let i = 0; i < 10; i++) {
      deck.push({
        type: 'Event',
        name: `Event ${i + 1}`,
        duration: Math.random() < 0.5 ? 'Permanent' : 'Temporary',
        effect: `Effect for event ${i + 1}`,
        id: `event-${i}`
      });
    }
    
    // Cartas de equipamento
    for (let i = 0; i < 15; i++) {
      deck.push({
        type: 'Equipment',
        name: `Equipment ${i + 1}`,
        bonus: `+${Math.floor(Math.random() * 3) + 1}`,
        effect: `Effect for equipment ${i + 1}`,
        id: `equip-${i}`
      });
    }
    
    // Embaralhar o deck
    return shuffle(deck);
  }
  
  // Função para comprar cartas
  function drawCards(game, playerId, count) {
    const playerState = game.playerStates[playerId];
    const drawnCards = [];
    
    for (let i = 0; i < count; i++) {
      if (playerState.deck.length === 0) {
        return {
          success: false,
          message: `Player ${playerId} cannot draw any more cards!`,
          cards: drawnCards
        };
      }
      
      const card = playerState.deck.shift();
      playerState.hand.push(card);
      drawnCards.push(card);
    }
    
    return {
      success: true,
      message: `Player ${playerId} drew ${count} cards.`,
      cards: drawnCards
    };
  }
  
  // Função para descartar cartas para pool
  function discardForPool(game, playerId, cardIds) {
    const playerState = game.playerStates[playerId];
    const discarded = [];
    
    for (const cardId of cardIds) {
      const cardIndex = playerState.hand.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        const card = playerState.hand.splice(cardIndex, 1)[0];
        playerState.discardPile.push(card);
        discarded.push(card);
      }
    }
    
    if (discarded.length > 0) {
      playerState.pool += discarded.length;
      return {
        success: true,
        message: `Discarded ${discarded.length} cards for ${discarded.length} pool.`,
        discarded: discarded,
        newPool: playerState.pool
      };
    }
    
    return {
      success: false,
      message: "No valid cards to discard."
    };
  }
  
  // Função para iniciar um novo turno
  function startNewTurn(game, playerId) {
    const playerState = game.playerStates[playerId];
    
    return {
      playerId: playerId,
      phase: TURN_PHASES.UNTAP,
      actionsRemaining: calculateAvailableActions(playerState),
      transfersRemaining: 1,
      combatInProgress: null,
      politicalActionInProgress: null,
      events: []
    };
  }
  
  // Função para calcular ações disponíveis
  function calculateAvailableActions(playerState) {
    let actions = 0;
    playerState.ready_region.forEach(vampire => {
      if (!vampire.torpor && vampire.ready) {
        actions += vampire.actions || 1;
      }
    });
    return actions;
  }
  
  // Função para processar fase de untap
  function processUntapPhase(game, playerId) {
    const playerState = game.playerStates[playerId];
    const events = [];
    
    // Desvirar todos os vampiros prontos
    playerState.ready_region.forEach(vampire => {
      if (!vampire.torpor) {
        vampire.ready = true;
        vampire.actions = 1;
        events.push({
          type: 'vampireReadied',
          vampireId: vampire.id,
          vampireName: vampire.name
        });
      }
    });
    
    // Comprar cartas
    const drawResult = drawCards(game, playerId, GAME_CONSTANTS.CARDS_PER_TURN);
    events.push({
      type: 'cardsDrawn',
      count: drawResult.cards.length,
      success: drawResult.success
    });
    
    return {
      success: true,
      events: events,
      nextPhase: TURN_PHASES.MASTER
    };
  }
  
  // Função para processar fase master
  function processMasterPhase(game, playerId, action) {
    const playerState = game.playerStates[playerId];
    const events = [];
    
    switch(action.type) {
      case 'playMasterCard':
        // Implementar lógica de jogar carta master
        break;
        
      case 'gainPool':
        // Implementar lógica de ganhar pool através de descarte
        break;
        
      case 'endPhase':
        return {
          success: true,
          events: events,
          nextPhase: TURN_PHASES.MINION
        };
    }
    
    return {
      success: true,
      events: events,
      nextPhase: TURN_PHASES.MASTER
    };
  }
  
  // Função para processar fase minion
  function processMinionPhase(game, playerId, action) {
    const playerState = game.playerStates[playerId];
    const events = [];
    
    switch(action.type) {
      case 'vampireAction':
        // Implementar ações de vampiro (bleed, political action, etc)
        break;
        
      case 'transfer':
        // Implementar transferência de sangue
        break;
        
      case 'recruit':
        // Implementar recrutamento de vampiro
        break;
        
      case 'endPhase':
        return {
          success: true,
          events: events,
          nextPhase: TURN_PHASES.INFLUENCE
        };
    }
    
    return {
      success: true,
      events: events,
      nextPhase: TURN_PHASES.MINION
    };
  }
  
  // Função para processar fase de influência
  function processInfluencePhase(game, playerId, action) {
    const playerState = game.playerStates[playerId];
    const events = [];
    
    switch(action.type) {
      case 'useInfluence':
        // Implementar uso de influência
        break;
        
      case 'endPhase':
        return {
          success: true,
          events: events,
          nextPhase: TURN_PHASES.DISCARD
        };
    }
    
    return {
      success: true,
      events: events,
      nextPhase: TURN_PHASES.INFLUENCE
    };
  }
  
  // Função para processar fase de descarte
  function processDiscardPhase(game, playerId, action) {
    const playerState = game.playerStates[playerId];
    const events = [];
    
    switch(action.type) {
      case 'discard':
        // Implementar descarte de cartas
        break;
        
      case 'endPhase':
        // Verificar tamanho da mão
        if (playerState.hand.length > GAME_CONSTANTS.MAX_HAND_SIZE) {
          return {
            success: false,
            message: 'Você deve descartar até o limite de cartas na mão',
            events: events,
            nextPhase: TURN_PHASES.DISCARD
          };
        }
        
        // Passar turno para próximo jogador
        return {
          success: true,
          events: events,
          nextPhase: null,
          endTurn: true
        };
    }
    
    return {
      success: true,
      events: events,
      nextPhase: TURN_PHASES.DISCARD
    };
  }
  
  // Função para processar ação política
  function processPoliticalAction(game, playerId, action) {
    // Implementar sistema de referendo e votação
    return {
      success: true,
      events: []
    };
  }
  
  // Função para verificar condições de vitória
  function checkVictoryConditions(game) {
    const activePlayers = Object.keys(game.playerStates).filter(playerId => {
      const state = game.playerStates[playerId];
      return state.pool > 0;
    });
    
    if (activePlayers.length === 1) {
      return {
        gameEnded: true,
        winner: activePlayers[0],
        reason: 'Último jogador com pool'
      };
    }
    
    return {
      gameEnded: false
    };
  }
  
  module.exports = {
    TURN_PHASES,
    startNewTurn,
    processUntapPhase,
    processMasterPhase,
    processMinionPhase,
    processInfluencePhase,
    processDiscardPhase,
    processPoliticalAction,
    checkVictoryConditions,
    createDeck,
    drawCards,
    discardForPool,
    shuffle
  };