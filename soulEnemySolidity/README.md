# SoulEnemySolidity

## Descrição
SoulEnemySolidity é um projeto de smart contract na blockchain Ethereum que implementa um token ERC-20 chamado "Soul of Enemy". Este projeto permite a criação e gerenciamento de tokens personalizados na rede Ethereum.

## Estrutura do Projeto
```
soulEnemySolidity/
├── build/                    # Arquivos compilados
│   └── contracts/           # Contratos compilados
│       ├── soulofEnemy.json # Contrato principal
│       └── Migrations.json  # Contrato de migração
├── .github/                 # Configurações do GitHub
├── .git/                    # Repositório Git
└── LICENSE                  # Licença do projeto
```

## Funcionalidades
- Implementação do padrão ERC-20
- Transferência de tokens entre endereços
- Aprovação de gastos de tokens
- Consulta de saldos
- Eventos para rastreamento de transações

## Como Usar

### Pré-requisitos
- Node.js
- Truffle Framework
- MetaMask ou carteira Web3 compatível

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/SoulEnemySolidity.git
cd SoulEnemySolidity
```

2. Instale as dependências:
```bash
npm install
```

### Compilação
```bash
truffle compile
```

### Testes
```bash
truffle test
```

### Deploy
```bash
truffle migrate --network <rede>
```

## Melhorias Sugeridas
1. Implementar testes unitários abrangentes
2. Adicionar documentação detalhada do código
3. Implementar funcionalidades adicionais:
   - Burn de tokens
   - Mint de novos tokens
   - Pausa de contrato
4. Adicionar scripts de deploy automatizado
5. Implementar verificações de segurança adicionais
6. Criar interface web para interação com o contrato

## Segurança
- O contrato segue os padrões OpenZeppelin
- Implementa verificações de overflow/underflow
- Utiliza eventos para auditoria

## 👥 Autores

- maikonweber  - Desenvolvedor Principal
- Douglas - Desenvolvedor Principal


## Contribuição
Contribuições são bem-vindas! Por favor, siga estas etapas:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 