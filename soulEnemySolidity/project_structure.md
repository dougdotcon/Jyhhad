# Estrutura de Pastas Recomendada

```
soulEnemySolidity/
├── contracts/           # Contratos Solidity
│  ├── SoulEnemy.sol      # Contrato principal
│  ├── interfaces/       # Interfaces do contrato
│  └── libraries/        # Bibliotecas auxiliares
├── migrations/          # Scripts de migração
│  ├── 1_initial_migration.js
│  └── 2_deploy_contracts.js
├── test/              # Testes
│  ├── SoulEnemy.test.js
│  └── helpers/         # Funções auxiliares para testes
├── scripts/            # Scripts utilitários
│  ├── deploy.js
│  └── verify.js
├── docs/              # Documentação
│  ├── technical/       # Documentação técnica
│  └── api/           # Documentação da API
├── build/             # Arquivos compilados
├── .github/            # Configurações do GitHub
├── .git/              # Repositório Git
├── .env              # Variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo Git
├── package.json        # Dependências e scripts
├── truffle-config.js     # Configuração do Truffle
├── README.md          # Documentação principal
└── LICENSE            # Licença do projeto
```

## Descrição das Pastas

### contracts/
- Contém todos os contratos Solidity
- Organizado em subpastas para melhor manutenção
- Interfaces separadas para reutilização

### migrations/
- Scripts para deploy dos contratos
- Ordem controlada de execução
- Configurações específicas por rede

### test/
- Testes unitários e de integração
- Helpers para facilitar os testes
- Cobertura de casos de uso

### scripts/
- Scripts utilitários para desenvolvimento
- Automação de tarefas comuns
- Ferramentas de deploy e verificação

### docs/
- Documentação técnica detalhada
- Guias de uso e integração
- Especificações da API

### build/
- Arquivos compilados
- ABIs e bytecodes
- Gerado automaticamente

## Arquivos de Configuração

### package.json
- Dependências do projeto
- Scripts npm
- Versões fixas para segurança

### truffle-config.js
- Configurações do framework Truffle
- Redes de deploy
- Compilador e otimizações

### .env
- Variáveis de ambiente
- Chaves privadas (não versionadas)
- URLs de redes 