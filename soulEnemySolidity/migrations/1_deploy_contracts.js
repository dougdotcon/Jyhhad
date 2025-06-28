const SoulOfEnemy = artifacts.require("SoulOfEnemy");
const VTESCard = artifacts.require("VTESCard");
const GameRewards = artifacts.require("GameRewards");
const JyhhadGovernance = artifacts.require("JyhhadGovernance");
const TimelockController = artifacts.require("TimelockController");

module.exports = async function (deployer, network, accounts) {
  // Deploy do token principal
  await deployer.deploy(
   SoulOfEnemy,
   process.env.TOKEN_NAME,
   process.env.TOKEN_SYMBOL,
   process.env.MAX_SUPPLY
  );
  const soulToken = await SoulOfEnemy.deployed();

  // Deploy do contrato de cartas VTES
  await deployer.deploy(VTESCard);
  const vtesCard = await VTESCard.deployed();

  // Deploy do contrato de recompensas
  await deployer.deploy(GameRewards, soulToken.address);
  const gameRewards = await GameRewards.deployed();

  // Configuração do Timelock para governança
  const minDelay = process.env.MIN_DELAY;
  const proposers = [accounts[0]]; // Inicialmente apenas o deployer
  const executors = [accounts[0]]; // Inicialmente apenas o deployer
  const admin = accounts[0];

  await deployer.deploy(
   TimelockController,
   minDelay,
   proposers,
   executors,
   admin
  );
  const timelock = await TimelockController.deployed();

  // Deploy do contrato de governança
  const votingDelay = process.env.VOTING_DELAY;
  const votingPeriod = process.env.VOTING_PERIOD;
  const quorumPercentage = process.env.QUORUM_PERCENTAGE;

  await deployer.deploy(
   JyhhadGovernance,
   soulToken.address,
   timelock.address,
   votingDelay,
   votingPeriod,
   quorumPercentage
  );
  const governance = await JyhhadGovernance.deployed();

  // Configuração de permissões
  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();

  // Dar permissão para o contrato de governança propor e executar ações
  await timelock.grantRole(proposerRole, governance.address);
  await timelock.grantRole(executorRole, governance.address);

  // Revogar permissões do deployer
  await timelock.revokeRole(proposerRole, accounts[0]);
  await timelock.revokeRole(executorRole, accounts[0]);
  await timelock.revokeRole(adminRole, accounts[0]);

  // Configurar o contrato de governança como admin do timelock
  await timelock.grantRole(adminRole, governance.address);

  // Log dos endereços dos contratos
  console.log("SoulOfEnemy deployed to:", soulToken.address);
  console.log("VTESCard deployed to:", vtesCard.address);
  console.log("GameRewards deployed to:", gameRewards.address);
  console.log("TimelockController deployed to:", timelock.address);
  console.log("JyhhadGovernance deployed to:", governance.address);
}; 