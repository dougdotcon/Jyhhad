// Constantes do jogo
const GAME_CONSTANTS = {
  INITIAL_POOL: 30,
  MAX_HAND_SIZE: 7,
  CARDS_PER_TURN: 2,
  MIN_DECK_SIZE: 60,
  MAX_DECK_SIZE: 90,
  MIN_CRYPT_SIZE: 12,
  MAX_CRYPT_SIZE: 25
};

// Tipos de disciplinas disponíveis
const DISCIPLINES = {
  AUSPEX: 'Auspex',
  DOMINATE: 'Dominate',
  FORTITUDE: 'Fortitude',
  OBFUSCATE: 'Obfuscate',
  POTENCE: 'Potence',
  PRESENCE: 'Presence',
  ANIMALISM: 'Animalism',
  CELERITY: 'Celerity',
  PROTEAN: 'Protean',
  BLOOD_SORCERY: 'Blood Sorcery',
  DEMENTATION: 'Dementation'
};

// Clãs disponíveis e suas disciplinas padrão
const CLANS = {
  VENTRUE: {
    name: 'Ventrue',
    disciplines: [DISCIPLINES.DOMINATE, DISCIPLINES.FORTITUDE, DISCIPLINES.PRESENCE]
  },
  TOREADOR: {
    name: 'Toreador',
    disciplines: [DISCIPLINES.AUSPEX, DISCIPLINES.CELERITY, DISCIPLINES.PRESENCE]
  },
  TREMERE: {
    name: 'Tremere',
    disciplines: [DISCIPLINES.AUSPEX, DISCIPLINES.DOMINATE, DISCIPLINES.BLOOD_SORCERY]
  },
  NOSFERATU: {
    name: 'Nosferatu',
    disciplines: [DISCIPLINES.ANIMALISM, DISCIPLINES.OBFUSCATE, DISCIPLINES.POTENCE]
  },
  BRUJAH: {
    name: 'Brujah',
    disciplines: [DISCIPLINES.CELERITY, DISCIPLINES.POTENCE, DISCIPLINES.PRESENCE]
  },
  MALKAVIAN: {
    name: 'Malkavian',
    disciplines: [DISCIPLINES.AUSPEX, DISCIPLINES.DEMENTATION, DISCIPLINES.OBFUSCATE]
  },
  GANGREL: {
    name: 'Gangrel',
    disciplines: [DISCIPLINES.ANIMALISM, DISCIPLINES.FORTITUDE, DISCIPLINES.PROTEAN]
  }
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
  
  // Função para criar um vampiro
  function createVampire(name, clan, capacity, disciplines = []) {
    const clanInfo = CLANS[clan.toUpperCase()];
    if (!clanInfo) throw new Error(`Clã inválido: ${clan}`);

    return {
      type: 'Vampire',
      name: name,
      clan: clanInfo.name,
      capacity: capacity,
      disciplines: disciplines.length > 0 ? disciplines : clanInfo.disciplines,
      blood: capacity,
      ready: false,
      torpor: false,
      actions: 0,
      combatModifiers: [],
      equipment: [],
      id: `vamp-${clan}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  // Função para criar carta de ação
  function createActionCard(name, cost, effect, type = 'Action', disciplines = []) {
    return {
      type: type,
      name: name,
      cost: cost,
      effect: effect,
      disciplines: disciplines,
      id: `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }
  
  // Função para criar estado inicial do jogador
  function createInitialPlayerState(playerId, deck, crypt) {
    return {
      id: playerId,
      pool: GAME_CONSTANTS.INITIAL_POOL,
      hand: [],
      library: [...deck],
      crypt: [...crypt],
      ash_heap: [], // pilha de vampiros destruídos
      discard_pile: [], // pilha de descarte para biblioteca
      ready_region: [], // região de vampiros prontos
      uncontrolled_region: [], // região de vampiros não controlados
      torpor_region: [], // região de vampiros em torpor
      influence: 0,
      title: null, // título político (Príncipe, Primogênito, etc)
      bloodBank: 30 // banco de sangue para transferências
    };
  }
  
  // Função para realizar combate entre vampiros
  function initiateCombat(attacker, defender) {
    return {
      participants: {
        attacker: { ...attacker, currentRange: 'long' },
        defender: { ...defender, currentRange: 'long' }
      },
      round: 1,
      currentPhase: 'range',
      phases: ['range', 'preAttack', 'attack', 'resolution', 'press'],
      log: [],
      status: 'active'
    };
  }
  
  // Função para resolver uma rodada de combate
  function resolveCombatRound(combat, attackerAction, defenderAction) {
    const log = [];
    
    // Resolver ações baseado na fase atual
    switch(combat.currentPhase) {
      case 'range':
        // Determinar alcance final baseado nas ações dos jogadores
        combat.currentRange = resolveRange(attackerAction, defenderAction);
        log.push(`Range set to ${combat.currentRange}`);
        break;
        
      case 'preAttack':
        // Resolver ações antes do ataque (manobras, equipamentos, etc)
        resolvePreAttackActions(combat, attackerAction, defenderAction, log);
        break;
        
      case 'attack':
        // Resolver o ataque em si
        resolveAttack(combat, attackerAction, defenderAction, log);
        break;
        
      case 'resolution':
        // Resolver efeitos pós-ataque
        resolvePostAttack(combat, log);
        break;
        
      case 'press':
        // Determinar se o combate continua
        combat.status = resolvePressPhase(attackerAction, defenderAction) ? 'active' : 'ended';
        break;
    }
    
    // Avançar para próxima fase ou próxima rodada
    advanceCombatPhase(combat);
    
    combat.log = combat.log.concat(log);
    return combat;
  }
  
  // Funções auxiliares de combate
  function resolveRange(attackerAction, defenderAction) {
    // Implementar lógica de resolução de alcance
    return 'close'; // ou 'long' dependendo das ações
  }
  
  function resolvePreAttackActions(combat, attackerAction, defenderAction, log) {
    // Implementar lógica de ações pré-ataque
  }
  
  function resolveAttack(combat, attackerAction, defenderAction, log) {
    // Implementar lógica de resolução de ataque
  }
  
  function resolvePostAttack(combat, log) {
    // Implementar lógica pós-ataque
  }
  
  function resolvePressPhase(attackerAction, defenderAction) {
    // Retorna true se o combate deve continuar
    return false;
  }
  
  function advanceCombatPhase(combat) {
    const currentPhaseIndex = combat.phases.indexOf(combat.currentPhase);
    if (currentPhaseIndex === combat.phases.length - 1) {
      combat.round++;
      combat.currentPhase = combat.phases[0];
    } else {
      combat.currentPhase = combat.phases[currentPhaseIndex + 1];
    }
  }
  
  // Função para transferir sangue entre vampiros
  function transferBlood(source, target, amount) {
    if (source.blood < amount) return false;
    
    source.blood -= amount;
    target.blood += amount;
    
    // Verificar se o vampiro sai do torpor
    if (target.torpor && target.blood > 0) {
      target.torpor = false;
    }
    
    return true;
  }
  
  // Função para verificar destruição de vampiro
  function checkVampireDestruction(vampire) {
    return vampire.torpor && vampire.blood <= 0;
  }
  
  module.exports = {
    GAME_CONSTANTS,
    DISCIPLINES,
    CLANS,
    createVampire,
    createActionCard,
    createInitialPlayerState,
    initiateCombat,
    resolveCombatRound,
    transferBlood,
    checkVampireDestruction,
    createDeck,
    drawCards,
    discardForPool,
    shuffle
  };