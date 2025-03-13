// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VTESCard is ERC721URIStorage, Ownable, Pausable {
   // Eventos
   event CardMinted(address indexed to, uint256 indexed tokenId, uint256 cardType);
   event CardFused(address indexed owner, uint256 indexed tokenId1, uint256 indexed tokenId2);
   event ContractPaused();
   event ContractUnpaused();

   // Estruturas
   struct Card {
      uint256 cardType;
      uint256 level;
      uint256 rarity;
      uint256 power;
      uint256 defense;
      bool isFused;
   }

   // Variáveis de estado
   uint256 private _tokenIds;
   mapping(uint256 => Card) public cards;
   mapping(uint256 => uint256) public cardTypeCount;
   
   // Constantes
   uint256 public constant MAX_SUPPLY = 10000;
   uint256 public constant MAX_RARITY = 5;
   uint256 public constant MAX_LEVEL = 10;

   constructor() ERC721("VTES Card", "VTES") {
      _tokenIds = 0;
   }

   // Funções de controle
   function pause() public onlyOwner {
      _pause();
      emit ContractPaused();
   }

   function unpause() public onlyOwner {
      _unpause();
      emit ContractUnpaused();
   }

   // Funções de minting
   function mintCard(
      address to,
      uint256 cardType,
      uint256 rarity
   ) public onlyOwner whenNotPaused returns (uint256) {
      require(_tokenIds < MAX_SUPPLY, "Max supply reached");
      require(rarity <= MAX_RARITY, "Invalid rarity");
      
      _tokenIds++;
      uint256 newItemId = _tokenIds;
      
      _mint(to, newItemId);
      
      cards[newItemId] = Card({
        cardType: cardType,
        level: 1,
        rarity: rarity,
        power: calculateBasePower(cardType, rarity),
        defense: calculateBaseDefense(cardType, rarity),
        isFused: false
      });
      
      cardTypeCount[cardType]++;
      emit CardMinted(to, newItemId, cardType);
      
      return newItemId;
   }

   // Funções de fusão
   function fuseCards(uint256 tokenId1, uint256 tokenId2) public whenNotPaused {
      require(ownerOf(tokenId1) == msg.sender, "Not owner of token1");
      require(ownerOf(tokenId2) == msg.sender, "Not owner of token2");
      require(!cards[tokenId1].isFused, "Token1 already fused");
      require(!cards[tokenId2].isFused, "Token2 already fused");
      require(cards[tokenId1].cardType == cards[tokenId2].cardType, "Different card types");
      
      Card storage card1 = cards[tokenId1];
      Card storage card2 = cards[tokenId2];
      
      require(card1.level < MAX_LEVEL, "Max level reached");
      
      // Aumenta o nível e atualiza as estatísticas
      card1.level++;
      card1.power = calculatePower(card1);
      card1.defense = calculateDefense(card1);
      card1.isFused = true;
      
      // Queima o segundo token
      _burn(tokenId2);
      
      emit CardFused(msg.sender, tokenId1, tokenId2);
   }

   // Funções auxiliares
   function calculateBasePower(uint256 cardType, uint256 rarity) internal pure returns (uint256) {
      return (cardType * 10) + (rarity * 5);
   }

   function calculateBaseDefense(uint256 cardType, uint256 rarity) internal pure returns (uint256) {
      return (cardType * 8) + (rarity * 3);
   }

   function calculatePower(Card memory card) internal pure returns (uint256) {
      return card.power + (card.level * 2);
   }

   function calculateDefense(Card memory card) internal pure returns (uint256) {
      return card.defense + (card.level * 1);
   }

   // Override das funções de transferência para incluir pausa
   function _beforeTokenTransfer(
      address from,
      address to,
      uint256 tokenId
   ) internal virtual override whenNotPaused {
      super._beforeTokenTransfer(from, to, tokenId);
   }
} 