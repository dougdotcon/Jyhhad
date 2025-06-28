// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./SoulOfEnemy.sol";

contract GameRewards is Ownable, Pausable, ReentrancyGuard {
   // Eventos
   event RewardClaimed(address indexed player, uint256 amount, string gameType);
   event MultiplierUpdated(address indexed player, uint256 newMultiplier);
   event DailyRewardClaimed(address indexed player, uint256 amount);
   event ContractPaused();
   event ContractUnpaused();

   // Estruturas
   struct PlayerStats {
      uint256 level;
      uint256 multiplier;
      uint256 lastDailyReward;
      uint256 totalRewards;
      uint256 gamesPlayed;
   }

   // Variáveis de estado
   SoulOfEnemy public soulToken;
   mapping(address => PlayerStats) public playerStats;
   mapping(string => uint256) public baseRewards;
   
   // Constantes
   uint256 public constant DAILY_REWARD_COOLDOWN = 1 days;
   uint256 public constant MAX_MULTIPLIER = 300; // 3x
   uint256 public constant BASE_MULTIPLIER = 100; // 1x
   uint256 public constant LEVEL_MULTIPLIER = 10; // +10% por nível

   constructor(address _soulToken) {
      soulToken = SoulOfEnemy(_soulToken);
      
      // Configurar recompensas base para cada jogo
      baseRewards["chess"] = 100;
      baseRewards["vtes"] = 150;
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

   // Funções de recompensa
   function claimReward(string memory gameType) public nonReentrant whenNotPaused {
      require(baseRewards[gameType] > 0, "Invalid game type");
      
      PlayerStats storage stats = playerStats[msg.sender];
      uint256 reward = calculateReward(stats, baseRewards[gameType]);
      
      require(soulToken.mint(msg.sender, reward), "Reward minting failed");
      
      stats.totalRewards += reward;
      stats.gamesPlayed++;
      
      emit RewardClaimed(msg.sender, reward, gameType);
   }

   function claimDailyReward() public nonReentrant whenNotPaused {
      PlayerStats storage stats = playerStats[msg.sender];
      require(block.timestamp >= stats.lastDailyReward + DAILY_REWARD_COOLDOWN, "Daily reward not available");
      
      uint256 reward = calculateDailyReward(stats);
      require(soulToken.mint(msg.sender, reward), "Daily reward minting failed");
      
      stats.lastDailyReward = block.timestamp;
      stats.totalRewards += reward;
      
      emit DailyRewardClaimed(msg.sender, reward);
   }

   // Funções de nível e multiplicador
   function updateMultiplier(uint256 newMultiplier) public whenNotPaused {
      require(newMultiplier <= MAX_MULTIPLIER, "Multiplier too high");
      
      PlayerStats storage stats = playerStats[msg.sender];
      stats.multiplier = newMultiplier;
      
      emit MultiplierUpdated(msg.sender, newMultiplier);
   }

   function levelUp() public whenNotPaused {
      PlayerStats storage stats = playerStats[msg.sender];
      stats.level++;
      stats.multiplier = BASE_MULTIPLIER + (stats.level * LEVEL_MULTIPLIER);
      
      require(stats.multiplier <= MAX_MULTIPLIER, "Max multiplier reached");
   }

   // Funções auxiliares
   function calculateReward(PlayerStats memory stats, uint256 baseReward) internal pure returns (uint256) {
      return (baseReward * stats.multiplier) / 100;
   }

   function calculateDailyReward(PlayerStats memory stats) internal pure returns (uint256) {
      return (100 * stats.multiplier) / 100; // 100 tokens base * multiplicador
   }

   // Funções de consulta
   function getPlayerStats(address player) public view returns (
      uint256 level,
      uint256 multiplier,
      uint256 lastDailyReward,
      uint256 totalRewards,
      uint256 gamesPlayed
   ) {
      PlayerStats memory stats = playerStats[player];
      return (
        stats.level,
        stats.multiplier,
        stats.lastDailyReward,
        stats.totalRewards,
        stats.gamesPlayed
      );
   }

   function getNextDailyRewardTime(address player) public view returns (uint256) {
      PlayerStats memory stats = playerStats[player];
      if (stats.lastDailyReward == 0) return 0;
      return stats.lastDailyReward + DAILY_REWARD_COOLDOWN;
   }
} 