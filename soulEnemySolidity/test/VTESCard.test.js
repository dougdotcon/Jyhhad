const VTESCard = artifacts.require("VTESCard");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("VTESCard", accounts => {
  const [owner, user1, user2] = accounts;
  const cardType = 1;
  const rarity = 3;

  let vtesCard;

  beforeEach(async () => {
   vtesCard = await VTESCard.new();
  });

  describe("Deploy", () => {
   it("deve criar o contrato com os parâmetros corretos", async () => {
    const name = await vtesCard.name();
    const symbol = await vtesCard.symbol();
    const maxSupply = await vtesCard.MAX_SUPPLY();
    const maxRarity = await vtesCard.MAX_RARITY();
    const maxLevel = await vtesCard.MAX_LEVEL();

    assert.equal(name, "VTES Card");
    assert.equal(symbol, "VTES");
    assert.equal(maxSupply.toString(), "10000");
    assert.equal(maxRarity.toString(), "5");
    assert.equal(maxLevel.toString(), "10");
   });

   it("deve definir o owner corretamente", async () => {
    const contractOwner = await vtesCard.owner();
    assert.equal(contractOwner, owner);
   });
  });

  describe("Minting", () => {
   it("deve permitir que o owner faça mint de cartas", async () => {
    const result = await vtesCard.mintCard(user1, cardType, rarity);
    
    const tokenId = result.logs[0].args.tokenId;
    const card = await vtesCard.cards(tokenId);
    
    assert.equal(card.cardType.toString(), cardType.toString());
    assert.equal(card.rarity.toString(), rarity.toString());
    assert.equal(card.level.toString(), "1");
    assert.equal(card.isFused, false);
    
    const ownerOfCard = await vtesCard.ownerOf(tokenId);
    assert.equal(ownerOfCard, user1);
   });

   it("não deve permitir que usuários não autorizados façam mint", async () => {
    await expectRevert(
      vtesCard.mintCard(user1, cardType, rarity, { from: user1 }),
      "Ownable: caller is not the owner"
    );
   });

   it("não deve permitir mint com raridade inválida", async () => {
    const invalidRarity = 6;
    await expectRevert(
      vtesCard.mintCard(user1, cardType, invalidRarity),
      "Invalid rarity"
    );
   });

   it("não deve permitir mint além do supply máximo", async () => {
    for (let i = 0; i < 10000; i++) {
      await vtesCard.mintCard(user1, cardType, rarity);
    }
    
    await expectRevert(
      vtesCard.mintCard(user1, cardType, rarity),
      "Max supply reached"
    );
   });
  });

  describe("Fusão", () => {
   let tokenId1, tokenId2;

   beforeEach(async () => {
    const result1 = await vtesCard.mintCard(user1, cardType, rarity);
    const result2 = await vtesCard.mintCard(user1, cardType, rarity);
    
    tokenId1 = result1.logs[0].args.tokenId;
    tokenId2 = result2.logs[0].args.tokenId;
   });

   it("deve permitir que usuários fusionem suas cartas", async () => {
    await vtesCard.fuseCards(tokenId1, tokenId2, { from: user1 });
    
    const card1 = await vtesCard.cards(tokenId1);
    const card2 = await vtesCard.cards(tokenId2);
    
    assert.equal(card1.level.toString(), "2");
    assert.equal(card1.isFused, true);
    assert.equal(card2.isFused, false); // A segunda carta é queimada
   });

   it("não deve permitir que usuários fusionem cartas de tipos diferentes", async () => {
    await vtesCard.mintCard(user1, cardType + 1, rarity);
    const tokenId3 = (await vtesCard.mintCard(user1, cardType + 1, rarity)).logs[0].args.tokenId;
    
    await expectRevert(
      vtesCard.fuseCards(tokenId1, tokenId3, { from: user1 }),
      "Different card types"
    );
   });

   it("não deve permitir que usuários fusionem cartas já fusionadas", async () => {
    await vtesCard.fuseCards(tokenId1, tokenId2, { from: user1 });
    
    const tokenId3 = (await vtesCard.mintCard(user1, cardType, rarity)).logs[0].args.tokenId;
    
    await expectRevert(
      vtesCard.fuseCards(tokenId1, tokenId3, { from: user1 }),
      "Token1 already fused"
    );
   });

   it("não deve permitir que usuários fusionem cartas além do nível máximo", async () => {
    for (let i = 0; i < 9; i++) {
      const newTokenId = (await vtesCard.mintCard(user1, cardType, rarity)).logs[0].args.tokenId;
      await vtesCard.fuseCards(tokenId1, newTokenId, { from: user1 });
    }
    
    const finalTokenId = (await vtesCard.mintCard(user1, cardType, rarity)).logs[0].args.tokenId;
    
    await expectRevert(
      vtesCard.fuseCards(tokenId1, finalTokenId, { from: user1 }),
      "Max level reached"
    );
   });
  });

  describe("Pausa", () => {
   it("deve permitir que o owner pause o contrato", async () => {
    await vtesCard.pause();
    const isPaused = await vtesCard.paused();
    assert.equal(isPaused, true);
   });

   it("não deve permitir que usuários não autorizados pausem o contrato", async () => {
    await expectRevert(
      vtesCard.pause({ from: user1 }),
      "Ownable: caller is not the owner"
    );
   });

   it("não deve permitir mint quando pausado", async () => {
    await vtesCard.pause();
    
    await expectRevert(
      vtesCard.mintCard(user1, cardType, rarity),
      "Pausable: paused"
    );
   });

   it("não deve permitir fusão quando pausado", async () => {
    const result1 = await vtesCard.mintCard(user1, cardType, rarity);
    const result2 = await vtesCard.mintCard(user1, cardType, rarity);
    
    const tokenId1 = result1.logs[0].args.tokenId;
    const tokenId2 = result2.logs[0].args.tokenId;
    
    await vtesCard.pause();
    
    await expectRevert(
      vtesCard.fuseCards(tokenId1, tokenId2, { from: user1 }),
      "Pausable: paused"
    );
   });
  });
}); 