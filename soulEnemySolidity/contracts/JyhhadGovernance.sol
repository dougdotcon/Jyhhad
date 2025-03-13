// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SoulOfEnemy.sol";

contract JyhhadGovernance is
   Governor,
   GovernorSettings,
   GovernorCountingSimple,
   GovernorVotes,
   GovernorVotesQuorumFraction,
   GovernorTimelockControl,
   Ownable
{
   // Eventos
   event ProposalCreated(uint256 proposalId, address proposer, string description);
   event ProposalExecuted(uint256 proposalId);
   event VotingDelayUpdated(uint256 oldVotingDelay, uint256 newVotingDelay);
   event VotingPeriodUpdated(uint256 oldVotingPeriod, uint256 newVotingPeriod);
   event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);

   constructor(
      SoulOfEnemy _token,
      TimelockController _timelock,
      uint256 _votingDelay,
      uint256 _votingPeriod,
      uint256 _quorumPercentage
   )
      Governor("JyhhadGovernance")
      GovernorSettings(_votingDelay, _votingPeriod, 0)
      GovernorVotes(_token)
      GovernorVotesQuorumFraction(_quorumPercentage)
      GovernorTimelockControl(_timelock)
   {}

   // Funções de governança
   function propose(
      address[] memory targets,
      uint256[] memory values,
      bytes[] memory calldatas,
      string memory description
   ) public override(Governor, IGovernor) returns (uint256) {
      uint256 proposalId = super.propose(targets, values, calldatas, description);
      emit ProposalCreated(proposalId, msg.sender, description);
      return proposalId;
   }

   function execute(
      address[] memory targets,
      uint256[] memory values,
      bytes[] memory calldatas,
      bytes32 descriptionHash
   ) public payable override(Governor, IGovernor) returns (uint256) {
      uint256 proposalId = super.execute(targets, values, calldatas, descriptionHash);
      emit ProposalExecuted(proposalId);
      return proposalId;
   }

   // Funções de configuração
   function setVotingDelay(uint256 newVotingDelay) public override onlyOwner {
      uint256 oldVotingDelay = votingDelay();
      super.setVotingDelay(newVotingDelay);
      emit VotingDelayUpdated(oldVotingDelay, newVotingDelay);
   }

   function setVotingPeriod(uint256 newVotingPeriod) public override onlyOwner {
      uint256 oldVotingPeriod = votingPeriod();
      super.setVotingPeriod(newVotingPeriod);
      emit VotingPeriodUpdated(oldVotingPeriod, newVotingPeriod);
   }

   function setQuorum(uint256 newQuorumPercentage) public override onlyOwner {
      uint256 oldQuorum = quorum(block.number - 1);
      super.setQuorum(newQuorumPercentage);
      emit QuorumUpdated(oldQuorum, quorum(block.number - 1));
   }

   // Funções de consulta
   function getProposalDetails(uint256 proposalId) public view returns (
      address proposer,
      uint256 startBlock,
      uint256 endBlock,
      uint256 forVotes,
      uint256 againstVotes,
      uint256 abstainVotes,
      bool executed
   ) {
      ProposalCore storage proposal = _proposals[proposalId];
      return (
        proposal.proposer,
        proposal.startBlock,
        proposal.endBlock,
        proposal.forVotes,
        proposal.againstVotes,
        proposal.abstainVotes,
        proposal.executed
      );
   }

   // Overrides necessários
   function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
      return super.votingDelay();
   }

   function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
      return super.votingPeriod();
   }

   function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
      return super.quorum(blockNumber);
   }

   function state(uint256 proposalId) public view override(Governor, IGovernor) returns (ProposalState) {
      return super.state(proposalId);
   }

   function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
      return super.proposalThreshold();
   }
} 