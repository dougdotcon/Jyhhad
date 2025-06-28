const express = require('express');
const router = express.Router();
const fs = require('node:fs');
const path = require('node:path');
const logger = require('../utils/logger');

// Mapeamento de clãs
const CLAN_MAPPING = {
  'VENTRUE': ['VENTRUE', 'VENTRUE_ANTITRIBU'],
  'TOREADOR': ['TOREADOR', 'TOREADOR_ANTITRIBU'],
  'GANGREL': ['GANGREL', 'GANGREL_ANTITRIBU'],
  'MALKAVIAN': ['MALKAVIAN', 'MALKAVIAN_ANTITRIBU'],
  'NOSFERATU': ['NOSFERATU', 'NOSFERATU_ANTITRIBU'],
  'TREMERE': ['TREMERE', 'TREMERE_ANTITRIBU'],
  'BRUJAH': ['BRUJAH', 'BRUJAH_ANTITRIBU'],
  'ASSAMITE': ['ASSAMITE', 'ASSAMITE_ANTITRIBU'],
  'SETITE': ['SETITE', 'SETITE_ANTITRIBU'],
  'RAVNOS': ['RAVNOS', 'RAVNOS_ANTITRIBU'],
  'LASOMBRA': ['LASOMBRA', 'LASOMBRA_ANTITRIBU'],
  'TZIMISCE': ['TZIMISCE', 'TZIMISCE_ANTITRIBU'],
  'GIOVANNI': ['GIOVANNI', 'GIOVANNI_ANTITRIBU'],
  'BANU_HAQIM': ['BANU_HAQIM'],
  'MINISTRY': ['MINISTRY'],
  'HEKATA': ['HEKATA'],
  'SALUBRI': ['SALUBRI', 'SALUBRI_ANTITRIBU'],
  'TRUE_BRUJAH': ['TRUE_BRUJAH'],
  'AHN_BEKKET': ['AHN_BEKKET'],
  'KINDRED_OF_THE_EBONY_KINGDOM': ['KINDRED_OF_THE_EBONY_KINGDOM'],
  'KINDRED_OF_THE_EAST': ['KINDRED_OF_THE_EAST'],
  'KINDRED_OF_THE_AFRICAN_KINGDOMS': ['KINDRED_OF_THE_AFRICAN_KINGDOMS'],
  'KINDRED_OF_THE_AMERICAS': ['KINDRED_OF_THE_AMERICAS'],
  'KINDRED_OF_THE_AUSTRALIA': ['KINDRED_OF_THE_AUSTRALIA'],
  'KINDRED_OF_THE_CARIBBEAN': ['KINDRED_OF_THE_CARIBBEAN'],
  'KINDRED_OF_THE_EASTERN_EUROPE': ['KINDRED_OF_THE_EASTERN_EUROPE'],
  'KINDRED_OF_THE_FAR_EAST': ['KINDRED_OF_THE_FAR_EAST'],
  'KINDRED_OF_THE_INDIA': ['KINDRED_OF_THE_INDIA'],
  'KINDRED_OF_THE_MIDDLE_EAST': ['KINDRED_OF_THE_MIDDLE_EAST'],
  'KINDRED_OF_THE_NORTH_AMERICA': ['KINDRED_OF_THE_NORTH_AMERICA'],
  'KINDRED_OF_THE_SOUTH_AMERICA': ['KINDRED_OF_THE_SOUTH_AMERICA'],
  'KINDRED_OF_THE_WESTERN_EUROPE': ['KINDRED_OF_THE_WESTERN_EUROPE']
};

// Carregar dados das cartas
const vampires = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/vampires.json'), 'utf8'));
logger.info(`Carregados ${vampires.length} vampiros do banco de dados`);

// Rota para buscar todos os vampiros
router.get('/vampires', (req, res) => {
  logger.debug('Buscando todos os vampiros');
  res.json(vampires);
});

// Rota para buscar vampiro por ID
router.get('/vampires/:id', (req, res) => {
  const vampire = vampires.find(v => v.id === req.params.id);
  if (!vampire) {
    logger.warn(`Vampiro não encontrado: ${req.params.id}`);
    return res.status(404).json({ error: 'Vampiro não encontrado' });
  }
  logger.debug(`Vampiro encontrado: ${vampire.name}`);
  res.json(vampire);
});

// Rota para buscar vampiros por clã
router.get('/vampires/clan/:clan', (req, res) => {
  const clan = req.params.clan.toUpperCase();
  const clanVariants = CLAN_MAPPING[clan];
  
  if (!clanVariants) {
    logger.warn(`Clã não encontrado: ${clan}`);
    return res.status(404).json({ error: 'Clã não encontrado' });
  }
  
  const clanVampires = vampires.filter(v => 
    clanVariants.some(variant => v.disciplines.includes(variant))
  );
  
  logger.info(`Encontrados ${clanVampires.length} vampiros do clã ${clan}`);
  res.json(clanVampires);
});

// Rota para buscar vampiros por capacidade
router.get('/vampires/capacity/:min/:max', (req, res) => {
  const { min, max } = req.params;
  const capacityVampires = vampires.filter(v => 
    v.capacity >= Number.parseInt(min) && v.capacity <= Number.parseInt(max)
  );
  logger.info(`Encontrados ${capacityVampires.length} vampiros com capacidade entre ${min} e ${max}`);
  res.json(capacityVampires);
});

// Rota para buscar vampiros por disciplinas
router.get('/vampires/disciplines', (req, res) => {
  const { disciplines } = req.query;
  if (!disciplines) {
    logger.warn('Tentativa de busca por disciplinas sem especificar disciplinas');
    return res.status(400).json({ error: 'Disciplinas não especificadas' });
  }
  
  const disciplineList = disciplines.split(',');
  const disciplineVampires = vampires.filter(v => 
    disciplineList.every(d => v.disciplines.includes(d.toUpperCase()))
  );
  logger.info(`Encontrados ${disciplineVampires.length} vampiros com disciplinas: ${disciplines}`);
  res.json(disciplineVampires);
});

// Rota para criar um deck aleatório
router.post('/deck/random', (req, res) => {
  const { clan, minCapacity, maxCapacity, count } = req.body;
  logger.info('Criando deck aleatório', { clan, minCapacity, maxCapacity, count });
  
  let availableVampires = [...vampires];
  
  // Filtrar por clã se especificado
  if (clan) {
    const clanUpper = clan.toUpperCase();
    const clanVariants = CLAN_MAPPING[clanUpper];
    
    if (!clanVariants) {
      logger.error('Clã não encontrado', { clan: clanUpper });
      return res.status(404).json({ error: 'Clã não encontrado' });
    }
    
    availableVampires = availableVampires.filter(v => 
      clanVariants.some(variant => v.disciplines.includes(variant))
    );
    logger.debug(`Filtrados ${availableVampires.length} vampiros do clã ${clanUpper}`);
    
    // Verificar se há vampiros suficientes do clã
    if (availableVampires.length < 12) {
      logger.error('Não há vampiros suficientes do clã especificado', { 
        clan: clanUpper, 
        available: availableVampires.length,
        required: 12 
      });
      return res.status(400).json({ 
        error: 'Não há vampiros suficientes do clã especificado',
        available: availableVampires.length,
        required: 12
      });
    }
  }
  
  // Filtrar por capacidade se especificado
  if (minCapacity && maxCapacity) {
    availableVampires = availableVampires.filter(v => 
      v.capacity >= minCapacity && v.capacity <= maxCapacity
    );
    logger.debug(`Filtrados ${availableVampires.length} vampiros por capacidade`);
    
    // Verificar se há vampiros suficientes com a capacidade especificada
    if (availableVampires.length < 12) {
      logger.error('Não há vampiros suficientes com a capacidade especificada', {
        minCapacity,
        maxCapacity,
        available: availableVampires.length,
        required: 12
      });
      return res.status(400).json({
        error: 'Não há vampiros suficientes com a capacidade especificada',
        available: availableVampires.length,
        required: 12
      });
    }
  }
  
  // Embaralhar e selecionar cartas
  const deck = [];
  const deckCount = Math.min(count || 12, 25); // Limitar entre 12 e 25 cartas
  
  // Embaralhar array
  for (let i = availableVampires.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableVampires[i], availableVampires[j]] = [availableVampires[j], availableVampires[i]];
  }
  
  // Selecionar cartas
  for (let i = 0; i < deckCount; i++) {
    deck.push(availableVampires[i]);
  }
  
  logger.success(`Deck criado com ${deck.length} vampiros`);
  res.json(deck);
});

// Rota para validar um deck
router.post('/deck/validate', (req, res) => {
  const { deck } = req.body;
  
  if (!Array.isArray(deck)) {
    logger.error('Tentativa de validação de deck inválido', { deck });
    return res.status(400).json({ error: 'Deck deve ser um array' });
  }
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalCards: deck.length,
      uniqueCards: new Set(deck.map(c => c.id)).size,
      averageCapacity: deck.reduce((acc, v) => acc + v.capacity, 0) / deck.length,
      disciplines: {}
    }
  };
  
  // Validar tamanho mínimo
  if (deck.length < 12) {
    validation.isValid = false;
    validation.errors.push('Deck deve ter no mínimo 12 cartas');
  }
  
  // Validar tamanho máximo
  if (deck.length > 25) {
    validation.isValid = false;
    validation.errors.push('Deck deve ter no máximo 25 cartas');
  }
  
  // Contar disciplinas
  for (const vampire of deck) {
    for (const disc of vampire.disciplines) {
      validation.stats.disciplines[disc] = (validation.stats.disciplines[disc] || 0) + 1;
    }
  }
  
  // Verificar duplicatas
  const cardCounts = {};
  for (const card of deck) {
    cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    if (cardCounts[card.id] > 3) {
      validation.warnings.push(`Muitas cópias de ${card.name} (${cardCounts[card.id]})`);
    }
  }
  
  if (!validation.isValid) {
    logger.warn('Deck inválido', validation);
  } else {
    logger.success('Deck válido', validation.stats);
  }
  
  res.json(validation);
});

module.exports = router; 