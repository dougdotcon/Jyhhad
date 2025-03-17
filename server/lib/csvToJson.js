const fs = require('fs');
const { parse } = require('csv-parse'); // Import the parse function correctly

// Constantes para normalização
const CARD_TYPES = {
  'Master': 'master',
  'Action': 'action',
  'Political Action': 'political',
  'Combat': 'combat',
  'Reaction': 'reaction',
  'Action Modifier': 'modifier',
  'Ally': 'ally',
  'Equipment': 'equipment',
  'Retainer': 'retainer'
};

const DISCIPLINES = {
  'Animalism': 'ANI',
  'Auspex': 'AUS',
  'Celerity': 'CEL',
  'Dominate': 'DOM',
  'Fortitude': 'FOR',
  'Obfuscate': 'OBF',
  'Potence': 'POT',
  'Presence': 'PRE',
  'Protean': 'PRO',
  'Thaumaturgy': 'THA',
  'Vicissitude': 'VIC',
  'Serpentis': 'SER',
  'Quietus': 'QUI',
  'Obtenebration': 'OBT',
  'Necromancy': 'NEC',
  'Dementation': 'DEM',
  'Chimerstry': 'CHI',
  'Valeren': 'VAL',
  'Temporis': 'TEM',
  'Thanatosis': 'THN',
  'Spiritus': 'SPI',
  'Mytherceria': 'MYT',
  'Melpominee': 'MEL',
  'Visceratika': 'VIS',
  'Daimoinon': 'DAI',
  'Obeah': 'OBE',
  'Sanguinus': 'SAN'
};

// Função para normalizar clãs
function normalizeClan(clan) {
  const clanMap = {
    'Ventrue': 'VENTRUE',
    'Tremere': 'TREMERE',
    'Toreador': 'TOREADOR',
    'Malkavian': 'MALKAVIAN',
    'Brujah': 'BRUJAH',
    'Gangrel': 'GANGREL',
    'Nosferatu': 'NOSFERATU',
    'Tzimisce': 'TZIMISCE',
    'Lasombra': 'LASOMBRA',
    'Assamite': 'ASSAMITE',
    'Ravnos': 'RAVNOS',
    'Setite': 'SETITE',
    'Giovanni': 'GIOVANNI',
    'Daughter of Cacophony': 'DAUGHTERS',
    'Baali': 'BAALI',
    'Salubri': 'SALUBRI',
    'True Brujah': 'TRUE_BRUJAH',
    'Harbinger of Skulls': 'HARBINGERS',
    'Blood Brother': 'BLOOD_BROTHERS',
    'Ahrimane': 'AHRIMANES',
    'Samedi': 'SAMEDI',
    'Kiasyd': 'KIASYD'
  };
  return clanMap[clan] || clan.toUpperCase().replace(/\s+/g, '_');
}

// Função para processar a cripta
async function processCrypt(filePath) {
  const vampires = [];
  let headerSkipped = false;
  let totalLinhas = 0;
  let linhasProcessadas = 0;
  let linhasInvalidas = 0;
  let errosProcessamento = 0;
  
  console.log('\n=== Iniciando Processamento da Cripta ===');
  console.log('Arquivo:', filePath);
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({  // Use parse function correctly
        delimiter: ',',
        quote: '"',
        trim: true
      }))
      .on('data', (row) => {
        totalLinhas++;
        
        // Pular o cabeçalho
        if (!headerSkipped) {
          headerSkipped = true;
          console.log('Cabeçalho identificado:', row.join(', '));
          return;
        }

        // Verificar se a linha tem dados válidos
        if (!row[0] || !row[1]) {
          linhasInvalidas++;
          console.log(`[AVISO] Linha ${totalLinhas} inválida:`, row);
          return;
        }

        try {
          const vampire = {
            id: `vampire-${row[0].trim()}`,
            name: row[1].trim(),
            type: 'vampire',
            clan: normalizeClan(row[2].trim()),
            capacity: parseInt(row[3]) || 1,
            disciplines: parseDisciplines(row[4]),
            cardText: row[5] ? row[5].trim() : '',
            group: parseInt(row[6]) || 1,
            advanced: row[7] ? row[7].toLowerCase().includes('advanced') : false,
            title: row[8] ? row[8].trim() : null,
            blood: parseInt(row[3]) || 1,
            ready: false,
            actions: 0,
            artist: row[9] ? row[9].trim() : null,
            set: row[10] ? row[10].trim() : null,
            rarity: row[11] ? row[11].trim() : null,
            banned: row[12] ? row[12].toLowerCase().includes('banned') : false
          };

          if (vampire.name && vampire.clan) {
            vampires.push(vampire);
            linhasProcessadas++;
            
            // Log a cada 100 vampiros processados
            if (linhasProcessadas % 100 === 0) {
              console.log(`[PROGRESSO] ${linhasProcessadas} vampiros processados...`);
            }
          } else {
            linhasInvalidas++;
            console.log(`[AVISO] Vampiro inválido na linha ${totalLinhas}:`, {
              nome: vampire.name,
              clã: vampire.clan
            });
          }
        } catch (error) {
          errosProcessamento++;
          console.error(`[ERRO] Falha ao processar linha ${totalLinhas}:`, error.message);
        }
      })
      .on('end', () => {
        console.log('\n=== Resumo do Processamento ===');
        console.log(`Total de linhas lidas: ${totalLinhas}`);
        console.log(`Vampiros processados com sucesso: ${linhasProcessadas}`);
        console.log(`Linhas inválidas: ${linhasInvalidas}`);
        console.log(`Erros de processamento: ${errosProcessamento}`);
        console.log('================================\n');
        
        resolve(vampires);
      })
      .on('error', (error) => {
        console.error('[ERRO FATAL] Falha na leitura do arquivo:', error);
        reject(error);
      });
  });
}

// Função auxiliar para processar disciplinas com log
function parseDisciplines(disciplinesStr) {
  if (!disciplinesStr) {
    console.log('[INFO] Disciplinas vazias encontradas');
    return [];
  }
  
  const disciplines = disciplinesStr
    .split(' ')
    .map(d => d.trim())
    .filter(d => d)
    .map(d => {
      const [disc, level] = d.toLowerCase().split('x');
      const normalizedDisc = DISCIPLINES[disc.charAt(0).toUpperCase() + disc.slice(1)] || disc.toUpperCase();
      
      if (!DISCIPLINES[disc.charAt(0).toUpperCase() + disc.slice(1)]) {
        console.log(`[AVISO] Disciplina não reconhecida: ${disc}`);
      }
      
      if (level) {
        const count = parseInt(level) || 1;
        return Array(count).fill(normalizedDisc);
      }
      return normalizedDisc;
    })
    .flat();
    
  return disciplines;
}

// Função para processar a biblioteca
async function processLibrary(filePath) {
  const cards = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse())  // Use parse function correctly
      .on('data', (row) => {
        const card = {
          id: `card-${row[0]}`,
          name: row[1],
          type: CARD_TYPES[row[2]] || row[2].toLowerCase(),
          clan: row[3] ? normalizeClan(row[3]) : null,
          discipline: row[4] ? row[4].split(' ').map(d => DISCIPLINES[d] || d) : [],
          cost: parseInt(row[5]) || 0,
          poolCost: parseInt(row[6]) || 0,
          bloodCost: parseInt(row[7]) || 0,
          cardText: row[8],
          burnOption: row[9] === 'Burn',
          banned: row[10] === 'Banned',
          set: row[11],
          preconstructed: row[12] === 'Precon'
        };
        cards.push(card);
      })
      .on('end', () => resolve(cards))
      .on('error', reject);
  });
}

// Função principal com mais logs
async function processAllFiles() {
  console.log('=== Iniciando Processamento de Arquivos ===');
  console.log('Data/Hora:', new Date().toLocaleString());
  
  try {
    // Processamento da cripta
    const cryptPath = './docs/assets/cardcsv/vtescrypt.csv';
    const libraryPath = './docs/assets/cardcsv/vteslib.csv';
    
    console.log('\nVerificando arquivos...');
    if (!fs.existsSync(cryptPath)) {
      throw new Error(`Arquivo da cripta não encontrado: ${cryptPath}`);
    }
    if (!fs.existsSync(libraryPath)) {
      throw new Error(`Arquivo da biblioteca não encontrado: ${libraryPath}`);
    }
    
    console.log('Processando cripta...');
    const vampires = await processCrypt(cryptPath);
    
    console.log('Processando biblioteca...');
    const cards = await processLibrary(libraryPath);
    
    console.log('\nCriando diretório de saída...');
    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
      console.log('Diretório ./data criado');
    }
    
    console.log('Salvando arquivos JSON...');
    fs.writeFileSync(
      './data/vampires.json', 
      JSON.stringify(vampires, null, 2)
    );
    
    fs.writeFileSync(
      './data/cards.json', 
      JSON.stringify(cards, null, 2)
    );
    
    console.log('\n=== Estatísticas Finais ===');
    console.log(`Total de vampiros: ${vampires.length}`);
    console.log(`Total de cartas: ${cards.length}`);
    
    console.log('\nDistribuição de vampiros por clã:');
    const clanStats = vampires.reduce((acc, v) => {
      acc[v.clan] = (acc[v.clan] || 0) + 1;
      return acc;
    }, {});
    Object.entries(clanStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([clan, count]) => {
        console.log(`${clan}: ${count} vampiros`);
      });
    
    console.log('\nDistribuição de cartas por tipo:');
    const cardTypeStats = cards.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    Object.entries(cardTypeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`${type}: ${count} cartas`);
      });
    
    console.log('\nProcessamento concluído com sucesso!');
    
  } catch (error) {
    console.error('\n[ERRO FATAL]');
    console.error('Descrição:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar o processamento
console.log('=== VTES Card Processor ===');
console.log('Versão: 1.0.0');
processAllFiles();