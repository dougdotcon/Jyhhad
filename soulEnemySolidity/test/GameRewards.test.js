const SoulOfEnemy = artifacts.require("SoulOfEnemy");
const GameRewards = artifacts.require("GameRewards");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("GameRewards", accounts => {
  const [owner, user1, user2] = accounts;
  const tokenName = "Soul of Enemy";
  const tokenSymbol = "SOE";
  const maxSupply = web3.utils.toWei("1000000", "ether");

  let soulToken;
  let gameRewards;

  beforeEach(async () => {
   soulToken = await SoulOfEnemy.new(tokenName, tokenSymbol, maxSupply);
   gameRewards = await GameRewards.new(soulToken.address);
  });

  describe("Deploy", () => {
   it("deve criar o contrato com os parâmetros corretos", async () => {
    const token = await gameRewards.token();
    assert.equal(token, soulToken.address);
   });

   it("deve definir o owner corretamente", async () => {
    const contractOwner = await gameRewards.owner();
    assert.equal(contractOwner, owner);
   });
  });

  describe("Recompensas", () => {
   beforeEach(async () => {
    // Dar tokens para o contrato de recompensas
    await soulToken.mint(gameRewards.address, web3.utils.toWei("100000", "ether"));
   });

   it("deve permitir que usuários reivindiquem recompensas", async () => {
    const gameType = 0; // Chess
    const result = await gameRewards.claimReward(gameType, { from: user1 });
    
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), web3.utils.toWei("10", "ether")); // 10 SOE por vitória no xadrez
   });

   it("deve permitir que usuários reivindiquem recompensas diárias", async () => {
    const result = await gameRewards.claimDailyReward({ from: user1 });
    
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), web3.utils.toWei("5", "ether")); // 5 SOE por recompensa diária
   });

   it("não deve permitir reivindicação de recompensa diária antes do cooldown", async () => {
    await gameRewards.claimDailyReward({ from: user1 });
    
    await expectRevert(
      gameRewards.claimDailyReward({ from: user1 }),
      "GameRewards: cooldown not finished"
    );
   });

   it("não deve permitir reivindicação de recompensa para jogo inválido", async () => {
    const invalidGameType = 999;
    
    await expectRevert(
      gameRewards.claimReward(invalidGameType, { from: user1 }),
      "GameRewards: invalid game type"
    );
   });
  });

  describe("Nível e Multiplicador", () => {
   it("deve permitir que usuários subam de nível", async () => {
    await gameRewards.levelUp({ from: user1 });
    
    const player = await gameRewards.getPlayer(user1);
    assert.equal(player.level.toString(), "2");
   });

   it("deve permitir que usuários atualizem seu multiplicador", async () => {
    const newMultiplier = 150; // 1.5x
    await gameRewards.updateMultiplier(newMultiplier, { from: user1 });
    
    const player = await gameRewards.getPlayer(user1);
    assert.equal(player.multiplier.toString(), newMultiplier.toString());
   });

   it("não deve permitir multiplicador acima do máximo", async () => {
    const maxMultiplier = 300; // 3x
    const invalidMultiplier = 301;
    
    await expectRevert(
      gameRewards.updateMultiplier(invalidMultiplier, { from: user1 }),
      "GameRewards: multiplier too high"
    );
   });
  });

  describe("Cálculo de Recompensas", () => {
   it("deve calcular recompensas corretamente com multiplicador", async () => {
    const gameType = 0; // Chess
    const multiplier = 150; // 1.5x
    
    await gameRewards.updateMultiplier(multiplier, { from: user1 });
    await gameRewards.claimReward(gameType, { from: user1 });
    
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), web3.utils.toWei("15", "ether")); // 10 SOE * 1.5
   });

   it("deve calcular recompensas diárias corretamente com multiplicador", async () => {
    const multiplier = 200; // 2x
    
    await gameRewards.updateMultiplier(multiplier, { from: user1 });
    await gameRewards.claimDailyReward({ from: user1 });
    
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), web3.utils.toWei("10", "ether")); // 5 SOE * 2
   });
  });

  describe("Consultas", () => {
   it("deve retornar estatísticas do jogador corretamente", async () => {
    const gameType = 0; // Chess
    await gameRewards.claimReward(gameType, { from: user1 });
    await gameRewards.levelUp({ from: user1 });
    
    const player = await gameRewards.getPlayer(user1);
    assert.equal(player.wins.toString(), "1");
    assert.equal(player.level.toString(), "2");
    assert.equal(player.multiplier.toString(), "100"); // Multiplicador padrão
   });

   it("deve retornar próximo horário de recompensa diária", async () => {
    const nextReward = await gameRewards.getNextDailyReward(user1);
    assert.isNumber(nextReward.toNumber());
   });
  });

  describe("Pausável", () => {
   it("deve permitir que o owner pause o contrato", async () => {
    await gameRewards.pause();
    const isPaused = await gameRewards.paused();
    assert.equal(isPaused, true);
   });

   it("não deve permitir que usuários não autorizados pausem o contrato", async () => {
    await expectRevert(
      gameRewards.pause({ from: user1 }),
      "Ownable: caller is not the owner"
    );
   });

   it("não deve permitir reivindicação de recompensas quando pausado", async () => {
    await gameRewards.pause();
    
    await expectRevert(
      gameRewards.claimReward(0, { from: user1 }),
      "Pausable: paused"
    );
    
    await expectRevert(
      gameRewards.claimDailyReward({ from: user1 }),
      "Pausable: paused"
    );
   });
  });
}); 