const SoulOfEnemy = artifacts.require("SoulOfEnemy");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("SoulOfEnemy", accounts => {
  const [owner, user1, user2] = accounts;
  const tokenName = "Soul of Enemy";
  const tokenSymbol = "SOE";
  const maxSupply = web3.utils.toWei("1000000", "ether"); // 1 milhão de tokens

  let soulToken;

  beforeEach(async () => {
   soulToken = await SoulOfEnemy.new(tokenName, tokenSymbol, maxSupply);
  });

  describe("Deploy", () => {
   it("deve criar o token com os parâmetros corretos", async () => {
    const name = await soulToken.name();
    const symbol = await soulToken.symbol();
    const supply = await soulToken.maxSupply();

    assert.equal(name, tokenName);
    assert.equal(symbol, tokenSymbol);
    assert.equal(supply.toString(), maxSupply);
   });

   it("deve definir o owner corretamente", async () => {
    const contractOwner = await soulToken.owner();
    assert.equal(contractOwner, owner);
   });
  });

  describe("Minting", () => {
   const mintAmount = web3.utils.toWei("1000", "ether");

   it("deve permitir que o owner faça mint de tokens", async () => {
    await soulToken.mint(user1, mintAmount);
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), mintAmount);
   });

   it("não deve permitir que usuários não autorizados façam mint", async () => {
    await expectRevert(
      soulToken.mint(user1, mintAmount, { from: user1 }),
      "Ownable: caller is not the owner"
    );
   });

   it("não deve permitir mint além do supply máximo", async () => {
    const excessAmount = web3.utils.toWei("2000000", "ether");
    await expectRevert(
      soulToken.mint(user1, excessAmount),
      "Exceeds max supply"
    );
   });
  });

  describe("Burning", () => {
   const mintAmount = web3.utils.toWei("1000", "ether");
   const burnAmount = web3.utils.toWei("500", "ether");

   beforeEach(async () => {
    await soulToken.mint(user1, mintAmount);
   });

   it("deve permitir que usuários queimem seus próprios tokens", async () => {
    await soulToken.burn(burnAmount, { from: user1 });
    const balance = await soulToken.balanceOf(user1);
    assert.equal(balance.toString(), web3.utils.toWei("500", "ether"));
   });

   it("não deve permitir que usuários queimem mais tokens do que possuem", async () => {
    const excessAmount = web3.utils.toWei("2000", "ether");
    await expectRevert(
      soulToken.burn(excessAmount, { from: user1 }),
      "ERC20: burn amount exceeds balance"
    );
   });
  });

  describe("Pausa", () => {
   it("deve permitir que o owner pause o contrato", async () => {
    await soulToken.pause();
    const isPaused = await soulToken.paused();
    assert.equal(isPaused, true);
   });

   it("não deve permitir que usuários não autorizados pausem o contrato", async () => {
    await expectRevert(
      soulToken.pause({ from: user1 }),
      "Ownable: caller is not the owner"
    );
   });

   it("não deve permitir transferências quando pausado", async () => {
    await soulToken.mint(user1, web3.utils.toWei("1000", "ether"));
    await soulToken.pause();
    
    await expectRevert(
      soulToken.transfer(user2, web3.utils.toWei("100", "ether"), { from: user1 }),
      "Pausable: paused"
    );
   });

   it("deve permitir que o owner unpause o contrato", async () => {
    await soulToken.pause();
    await soulToken.unpause();
    const isPaused = await soulToken.paused();
    assert.equal(isPaused, false);
   });
  });

  describe("Transferências", () => {
   const transferAmount = web3.utils.toWei("100", "ether");

   beforeEach(async () => {
    await soulToken.mint(user1, web3.utils.toWei("1000", "ether"));
   });

   it("deve permitir transferências entre usuários", async () => {
    await soulToken.transfer(user2, transferAmount, { from: user1 });
    
    const balance1 = await soulToken.balanceOf(user1);
    const balance2 = await soulToken.balanceOf(user2);
    
    assert.equal(balance1.toString(), web3.utils.toWei("900", "ether"));
    assert.equal(balance2.toString(), transferAmount);
   });

   it("não deve permitir transferências quando o contrato está pausado", async () => {
    await soulToken.pause();
    
    await expectRevert(
      soulToken.transfer(user2, transferAmount, { from: user1 }),
      "Pausable: paused"
    );
   });
  });
}); 