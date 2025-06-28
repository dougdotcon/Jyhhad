# API VTES (Vampire: The Eternal Struggle)

API para fornecer dados de cartas para o jogo Vampire: The Eternal Struggle.

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor da API:
```bash
npm run api
```

## Endpoints

### Vampiros

- `GET /api/cards/vampires` - Lista todos os vampiros
- `GET /api/cards/vampires/:id` - Busca um vampiro específico por ID
- `GET /api/cards/vampires/clan/:clan` - Busca vampiros por clã
- `GET /api/cards/vampires/capacity/:min/:max` - Busca vampiros por faixa de capacidade
- `GET /api/cards/vampires/disciplines?disciplines=disc1,disc2` - Busca vampiros por disciplinas

### Decks

- `POST /api/cards/deck/random` - Cria um deck aleatório
  ```json
  {
    "clan": "VENTRUE",
    "minCapacity": 4,
    "maxCapacity": 8,
    "count": 12
  }
  ```

- `POST /api/cards/deck/validate` - Valida um deck
  ```json
  {
    "deck": [
      {
        "id": "vampire-1",
        "name": "Vampiro 1",
        "clan": "VENTRUE",
        "capacity": 5,
        "disciplines": ["DOMINATE", "FORTITUDE"]
      }
    ]
  }
  ```

## Exemplos de Uso

### Buscar vampiros do clã Ventrue
```bash
curl http://localhost:3000/api/cards/vampires/clan/VENTRUE
```

### Criar um deck aleatório
```bash
curl -X POST http://localhost:3000/api/cards/deck/random \
  -H "Content-Type: application/json" \
  -d '{"clan": "VENTRUE", "minCapacity": 4, "maxCapacity": 8, "count": 12}'
```

### Validar um deck
```bash
curl -X POST http://localhost:3000/api/cards/deck/validate \
  -H "Content-Type: application/json" \
  -d '{"deck": [{"id": "vampire-1", "name": "Vampiro 1", "clan": "VENTRUE", "capacity": 5, "disciplines": ["DOMINATE", "FORTITUDE"]}]}'
``` 