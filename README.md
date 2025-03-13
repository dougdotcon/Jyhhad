<p align="center">
  <img src="docs/assets/logo.png" alt="Jyhhad Logo" width="300"/>
</p>

<h1 align="center">Jyhhad</h1>
<h3 align="center">Plataforma de Jogos com Tokenomics</h3>

<p align="center">
  <a href="#visão-geral">Visão Geral</a> •
  <a href="#estrutura-do-projeto">Estrutura</a> •
  <a href="#objetivo">Objetivo</a> •
  <a href="#componentes">Componentes</a> •
  <a href="#destaque-vtes-vampire-the-eternal-struggle">VTES</a> •
  <a href="#como-começar">Como Começar</a> •
  <a href="#documentação">Documentação</a> •
  <a href="#contribuindo">Contribuindo</a> •
  <a href="#licença">Licença</a> •
  <a href="#autores">Autores</a>
</p>

---

## 🎮 Visão Geral
Jyhhad é uma plataforma  a que integra jogos clássicos com tokenomics na blockchain Ethereum. O projeto combina três componentes principais:

1. **Jyhhad-Chess-Game**: Um jogo de xadrez com tabuleiro hexagonal desenvolvido em Unity
2. **SoulEnemySolidity**: Smart contracts para tokenomics e recompensas
3. **VTES**: Implementação digital do jogo Vampire: The Eternal Struggle

## 📁 Estrutura do Projeto

```
Jyhhad/
├── Jyhhad-Chess-Game/    # Jogo de xadrez hexagonal em Unity
├── soulEnemySolidity/    # Smart contracts Ethereum
├── VTES/            # Implementação digital do VTES
└── docs/            # Documentação centralizada
   ├── assets/        # Imagens e recursos visuais
   ├── architecture.md   # Arquitetura do sistema
   ├── tokenomics.md    # Economia e tokens
   └── gameplay.md      # Regras e mecânicas
```

## 🎯 Objetivo
Criar uma plataforma de jogos descentralizada onde:
- 🎲 Jogadores podem ganhar tokens jogando
- 🔓 Tokens podem ser usados para desbloquear conteúdo especial
- 🏛️ A comunidade participa da governança do projeto
- ⛓️ Os jogos são integrados com a blockchain

## 🛠️ Componentes

<details>
  <summary><b>1. Jyhhad-Chess-Game</b></summary>
  <ul>
   <li>Tabuleiro hexagonal  </li>
   <li>Sistema de recompensas integrado</li>
   <li>Interface moderna e intuitiva</li>
   <li>Multiplayer online</li>
  </ul>
</details>

<details>
  <summary><b>2. SoulEnemySolidity</b></summary>
  <ul>
   <li>Token ERC-20 "Soul of Enemy"</li>
   <li>Sistema de recompensas</li>
   <li>Smart contracts para governança</li>
   <li>Integração com jogos</li>
  </ul>
</details>

<details>
  <summary><b>3. VTES</b></summary>
  <ul>
   <li>Implementação digital do jogo de cartas</li>
   <li>Sistema de ranking e recompensas</li>
   <li>Integração com tokenomics</li>
   <li>Multiplayer online</li>
  </ul>
  
  <h4>Exemplos de Cartas</h4>
  <p align="center">
   <img src="VTES/assets/cards/page_14_image_4.jpeg" alt="Carta VTES 1" width="150"/>
   <img src="VTES/assets/cards/page_7_image_1.jpeg" alt="Carta VTES 2" width="150"/>
   <img src="VTES/assets/cards/page_13_image_5.jpeg" alt="Carta VTES 3" width="150"/>
   <img src="VTES/assets/cards/page_14_image_6.jpeg" alt="Carta VTES 4" width="150"/>
  </p>
  
  <p align="center">
   <i>Vampire: The Eternal Struggle é um jogo de cartas estratégico baseado no universo de World of Darkness.</i>
  </p>
</details>

## 🧛‍♂️ Destaque: VTES (Vampire: The Eternal Struggle)

<p align="center">
  <img src="VTES/assets/cards/page_7_image_3.jpeg" alt="Carta VTES Principal" width="180"/>
</p>

VTES é um jogo de cartas colecionáveis criado por Richard Garfield, o mesmo criador de Magic: The Gathering. Nossa implementação digital traz:

- **Mecânicas Fiéis**: Mantém todas as regras e mecânicas do jogo original
- **Coleção Completa**: Inclui cartas de todas as expansões lançadas
- **Multiplayer Nativo**: Suporte para jogos de 3-5 jogadores
- **Integração Blockchain**: Cartas raras podem ser tokenizadas como NFTs

<p align="center">
  <img src="VTES/assets/cards/page_12_image_6.jpeg" alt="Carta VTES 5" width="120"/>
  <img src="VTES/assets/cards/page_9_image_8.jpeg" alt="Carta VTES 6" width="120"/>
  <img src="VTES/assets/cards/page_10_image_4.jpeg" alt="Carta VTES 7" width="120"/>
  <img src="VTES/assets/cards/page_8_image_3.jpeg" alt="Carta VTES 8" width="120"/>
</p>

## 🚀 Como Começar

### Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/Jyhhad.git
cd Jyhhad

# Instale as dependências
npm install
```

### Executando os Jogos
1. Abra `Jyhhad-Chess-Game` no Unity
2. Configure o ambiente Solidity para `soulEnemySolidity`
3. Inicie o servidor VTES

### Conectando com a Blockchain
1. Configure MetaMask
2. Conecte sua carteira
3. Aprove tokens para jogar

## 📚 Documentação
A documentação completa está disponível na pasta `docs/`:
- [Arquitetura do Sistema](docs/architecture.md)
- [Tokenomics](docs/tokenomics.md)
- [Regras e Mecânicas](docs/gameplay.md)

## 🤝 Contribuindo
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📜 Licença
Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

<table>
  <tr>
   <td align="center">
    <a href="https://github.com/maikonweber">
      <b>Maikon Weber</b><br />
      <sub>Desenvolvedor Principal</sub>
    </a>
   </td>
   <td align="center">
    <a href="https://github.com/douglas">
      <b>Douglas</b><br />
      <sub>Desenvolvedor Principal</sub>
    </a>
   </td>
  </tr>
</table>

## 🙏 Agradecimentos
- Unity Technologies
- Ethereum Foundation
- Comunidade VTES
- Contribuidores do projeto 