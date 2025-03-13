# Jyhhad Chess Game

Um jogo de xadrez desenvolvido em Unity com um tabuleiro hexagonal único.

## 📋 Descrição

Este é um jogo de xadrez com uma abordagem inovadora, utilizando um tabuleiro hexagonal ao invés do tradicional tabuleiro quadrado. O jogo mantém as regras básicas do xadrez, mas com mecânicas adaptadas para o formato hexagonal.

## 🎮 Estrutura do Projeto

```
Jyhhad-Chess-Game/
├── Scripts/
│   ├── Core/                    # Scripts principais do jogo
│   │   ├── GameManager.cs       # Gerencia o estado do jogo e turnos
│   │   └── GameManagerProxy1.cs # Proxy para comunicação entre componentes
│   ├── Gameplay/               # Scripts relacionados ao tabuleiro e mecânicas
│   │   ├── HexGrid.cs          # Gerencia o grid hexagonal
│   │   ├── HexCell.cs          # Controla cada célula do tabuleiro
│   │   ├── HexMesh.cs          # Gera a malha hexagonal
│   │   └── HexMetrics.cs       # Define métricas e constantes do hexágono
│   ├── UI/                     # Scripts de interface e câmera
│   │   ├── InputScript.cs      # Gerencia input do jogador
│   │   └── CameraMovement.cs   # Controla movimento da câmera
│   └── Utils/                  # Scripts utilitários
│       └── HexCoordinates.cs   # Sistema de coordenadas hexagonais
├── Prefabs/                    # Prefabs do Unity
│   ├── HexPrefab.prefab       # Prefab da célula hexagonal
│   ├── textPrefab.prefab      # Prefab para textos da UI
│   └── Canvas.prefab          # Prefab da interface principal
├── Scenes/                     # Cenas do Unity
└── Resources/                  # Recursos do jogo
```

## 🛠️ Como Testar

1. **Requisitos**:
   - Unity 2022.3 LTS ou superior
   - Visual Studio 2019 ou superior
   - Git (opcional, para controle de versão)

2. **Configuração**:
   - Clone o repositório
   - Abra o projeto no Unity Hub
   - Aguarde a importação dos assets

3. **Executando o Jogo**:
   - Abra a cena principal em `Scenes/`
   - Pressione o botão Play no Unity Editor
   - Use o mouse para interagir com as peças
   - Rotacione a câmera com o botão direito do mouse

## 🎯 Funcionalidades

- Tabuleiro hexagonal interativo
- Sistema de turnos
- Movimentação de peças
- Interface de usuário intuitiva
- Câmera rotativa
- Sistema de coordenadas hexagonais

## 🔧 Arquivos Principais

### Core
- `GameManager.cs`: Gerencia o estado do jogo, turnos e regras
- `GameManagerProxy1.cs`: Facilita a comunicação entre componentes

### Gameplay
- `HexGrid.cs`: Implementa a lógica do tabuleiro hexagonal
- `HexCell.cs`: Controla o comportamento de cada célula
- `HexMesh.cs`: Gera a visualização do grid
- `HexMetrics.cs`: Define constantes e métricas do hexágono

### UI
- `InputScript.cs`: Processa input do jogador
- `CameraMovement.cs`: Controla a câmera do jogo

### Utils
- `HexCoordinates.cs`: Sistema de coordenadas para o grid hexagonal

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- maikonweber  - Desenvolvedor Principal
- Douglas - Desenvolvedor Principal


## 🙏 Agradecimentos

- Unity Technologies
- Comunidade Unity
- Contribuidores do projeto 