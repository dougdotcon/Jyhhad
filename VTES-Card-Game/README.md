# VTES (Vampire: The Eternal Struggle) - Implementação Digital

Este é um projeto de implementação digital do jogo de cartas Vampire: The Eternal Struggle (VTES), um jogo de cartas colecionáveis baseado no universo de Vampire: The Masquerade.

## 📁 Estrutura do Projeto

```
VTES/
├── assets/        # Recursos e arquivos de mídia
│  └── v5_rulebook_pt-br_02bLogo.pdf  # Manual de regras em português
├── docs/        # Documentação do projeto
│  └── VTES.md    # Regras básicas e mecânicas do jogo
├── gameplay/      # Lógica e mecânicas de jogo
│  ├── Turnos     # Implementação das fases do turno
│  └── GamingStart.md  # Instruções de início de jogo
└── README.md      # Este arquivo
```

## 🎮 Sobre o Jogo

VTES é um jogo de cartas para 4-5 jogadores onde cada jogador assume o papel de um Matusalém (um antigo vampiro) que manipula outros vampiros e recursos para eliminar seus adversários. Características principais:

- **Objetivo**: Eliminar sua "presa" (jogador à sua esquerda) e acumular pontos de vitória
- **Componentes**: 
  - Deck de Cripta (vampiros)
  - Deck de Biblioteca (ações e recursos)
  - Marcadores de sangue (30 por jogador)

## 📋 Como Testar

1. **Preparação**:
  - Cada jogador começa com 30 marcadores de sangue
  - Separe as cartas em dois baralhos: Cripta e Biblioteca
  - Distribua 7 cartas da Biblioteca para sua mão
  - Coloque 4 cartas da Cripta na região não controlada

2. **Sequência de Turno**:
  - Fase de Destravar
  - Fase de Mestre
  - Fase de Servo
  - Fase de Influência
  - Fase de Descarte

## 📚 Documentação

- `docs/VTES.md`: Contém as regras básicas, mecânicas de jogo e explicações sobre tipos de cartas
- `gameplay/GamingStart.md`: Instruções detalhadas sobre como iniciar uma partida
- `gameplay/Turnos`: Documentação sobre as fases do turno e suas mecânicas

## 🛠️ Estrutura de Arquivos

### Assets
- `v5_rulebook_pt-br_02bLogo.pdf`: Manual oficial do jogo em português

### Docs
- `VTES.md`: Documentação principal com regras e mecânicas

### Gameplay
- `GamingStart.md`: Instruções de início de jogo
- `Turnos`: Implementação e regras das fases do turno

## 🎯 Próximos Passos

1. Implementação da interface digital
2. Sistema de gerenciamento de cartas
3. Implementação das mecânicas de combate
4. Sistema de multiplayer online

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## 📜 Licença

Este projeto é uma implementação não oficial de VTES e não tem fins comerciais. Vampire: The Eternal Struggle é uma marca registrada da Paradox Interactive. 