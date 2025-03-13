// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SoulOfEnemy is ERC20, Ownable, Pausable {
   // Eventos
   event TokensMinted(address indexed to, uint256 amount);
   event TokensBurned(address indexed from, uint256 amount);
   event ContractPaused();
   event ContractUnpaused();

   // Variáveis de estado
   uint256 public maxSupply;
   uint256 public totalMinted;

   constructor(
      string memory name,
      string memory symbol,
      uint256 _maxSupply
   ) ERC20(name, symbol) {
      maxSupply = _maxSupply;
      totalMinted = 0;
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
   function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
      require(totalMinted + amount <= maxSupply, "Exceeds max supply");
      _mint(to, amount);
      totalMinted += amount;
      emit TokensMinted(to, amount);
   }

   // Funções de queima
   function burn(uint256 amount) public {
      _burn(_msgSender(), amount);
      emit TokensBurned(_msgSender(), amount);
   }

   function burnFrom(address account, uint256 amount) public {
      uint256 currentAllowance = allowance(account, _msgSender());
      require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");
      unchecked {
        _approve(account, _msgSender(), currentAllowance - amount);
      }
      _burn(account, amount);
      emit TokensBurned(account, amount);
   }

   // Override das funções de transferência para incluir pausa
   function _beforeTokenTransfer(
      address from,
      address to,
      uint256 amount
   ) internal virtual override whenNotPaused {
      super._beforeTokenTransfer(from, to, amount);
   }
} 