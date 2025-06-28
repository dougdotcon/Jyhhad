# Soul Enemy - Smart Contracts

Este repositório contém os smart contracts da plataforma de jogos Jyhhad, implementados em Solidity.

## 🏗️ Estrutura do Projeto

```
contracts/
├── SoulOfEnemy.sol    # Token principal ERC-20
├── VTESCard.sol      # NFTs para cartas VTES
├── GameRewards.sol    # Sistema de recompensas
└── JyhhadGovernance.sol # Governança DAO
```

## 🚀 Funcionalidades

### Token Soul of Enemy
- Token ERC-20 com supply limitado
- Sistema de minting controlado
- Mecanismo de queima (burning)
- Controle de pausa

### NFTs VTES
- Implementação ERC-721 para cartas
- Sistema de raridade e níveis
- Mecanismo de fusão de cartas
- Marketplace integrado

### Sistema de Recompensas
- Recompensas por jogo
- Sistema de níveis
- Multiplicadores de recompensa
- Recompensas diárias

### Governança
- Sistema de votação
- Propostas e execução
- Timelock para mudanças críticas
- Quorum configurável

## 🛠️ Configuração do Ambiente

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Compile os contratos:
```bash
npm run compile
```

4. Execute os testes:
```bash
npm run test
```

5. Faça deploy dos contratos:
```bash
npm run migrate
```

## 📝 Scripts Disponíveis

- `npm run test`: Executa os testes
- `npm run compile`: Compila os contratos
- `npm run migrate`: Faz deploy dos contratos
- `npm run migrate:reset`: Reseta e faz deploy novamente
- `npm run verify`: Verifica os contratos no BSCScan
- `npm run lint`: Verifica o código
- `npm run lint:fix`: Corrige problemas de linting

## 🔒 Segurança

- Todos os contratos são auditados
- Implementação de controles de acesso
- Proteção contra reentrancy
- Sistema de pausa de emergência
- Timelock para operações críticas

## 📚 Documentação

A documentação completa está disponível em:
- [Arquitetura](docs/architecture.md)
- [Tokenomics](docs/tokenomics.md)
- [Governança](docs/governance.md)
- [Integração](docs/integration.md)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- Maikon Weber
- Douglas 