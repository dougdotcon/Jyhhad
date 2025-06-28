const SoulOfEnemy = artifacts.require("SoulOfEnemy");
const JyhhadGovernance = artifacts.require("JyhhadGovernance");
const TimelockController = artifacts.require("TimelockController");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');

contract("JyhhadGovernance", accounts => {
  const [owner, user1, user2, user3] = accounts;
  const tokenName = "Soul of Enemy";
  const tokenSymbol = "SOE";
  const maxSupply = web3.utils.toWei("1000000", "ether");
  const votingDelay = 1;
  const votingPeriod = 3;
  const quorumPercentage = 4;
  const minDelay = 2;

  let soulToken;
  let timelock;
  let governance;

  beforeEach(async () => {
    soulToken = await SoulOfEnemy.new(tokenName, tokenSymbol, maxSupply);
    
    // Deploy do Timelock
    const proposers = [owner];
    const executors = [owner];
    timelock = await TimelockController.new(
      minDelay,
      proposers,
      executors,
      owner
    );
    
    // Deploy da Governança
    governance = await JyhhadGovernance.new(
      soulToken.address,
      timelock.address,
      votingDelay,
      votingPeriod,
      quorumPercentage
    );
  });

  describe("Deploy", () => {
    it("deve criar o contrato com os parâmetros corretos", async () => {
      const token = await governance.token();
      const timelockAddress = await governance.timelock();
      const delay = await governance.votingDelay();
      const period = await governance.votingPeriod();
      const quorum = await governance.quorum(0);

      assert.equal(token, soulToken.address);
      assert.equal(timelockAddress, timelock.address);
      assert.equal(delay.toString(), votingDelay.toString());
      assert.equal(period.toString(), votingPeriod.toString());
      assert.equal(quorum.toString(), web3.utils.toWei("40000", "ether")); // 4% do supply
    });

    it("deve definir o owner corretamente", async () => {
      const contractOwner = await governance.owner();
      assert.equal(contractOwner, owner);
    });
  });

  describe("Propostas", () => {
    const targets = [soulToken.address];
    const values = ["0"];
    const calldatas = [soulToken.contract.methods.pause().encodeABI()];
    const description = "Pausar o token";

    beforeEach(async () => {
      // Dar tokens para os usuários para votar
      await soulToken.mint(user1, web3.utils.toWei("100000", "ether"));
      await soulToken.mint(user2, web3.utils.toWei("100000", "ether"));
      await soulToken.mint(user3, web3.utils.toWei("100000", "ether"));
    });

    it("deve permitir que usuários com tokens criem propostas", async () => {
      await soulToken.delegate(user1, { from: user1 });
      
      const result = await governance.propose(
        targets,
        values,
        calldatas,
        description,
        { from: user1 }
      );
      
      const proposalId = result.logs[0].args.proposalId;
      const proposal = await governance.getProposalDetails(proposalId);
      
      assert.equal(proposal.proposer, user1);
      assert.equal(proposal.startBlock.toString(), (await web3.eth.getBlockNumber() + votingDelay + 1).toString());
      assert.equal(proposal.endBlock.toString(), (await web3.eth.getBlockNumber() + votingDelay + votingPeriod + 1).toString());
    });

    it("não deve permitir que usuários sem tokens criem propostas", async () => {
      await expectRevert(
        governance.propose(
          targets,
          values,
          calldatas,
          description,
          { from: user1 }
        ),
        "Governor: proposer votes below proposal threshold"
      );
    });
  });

  describe("Votação", () => {
    let proposalId;

    beforeEach(async () => {
      // Dar tokens e criar proposta
      await soulToken.mint(user1, web3.utils.toWei("100000", "ether"));
      await soulToken.delegate(user1, { from: user1 });
      
      const targets = [soulToken.address];
      const values = ["0"];
      const calldatas = [soulToken.contract.methods.pause().encodeABI()];
      const description = "Pausar o token";
      
      const result = await governance.propose(
        targets,
        values,
        calldatas,
        description,
        { from: user1 }
      );
      
      proposalId = result.logs[0].args.proposalId;
      
      // Avançar blocos para começar a votação
      for (let i = 0; i < votingDelay + 1; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
    });

    it("deve permitir que usuários votem", async () => {
      await governance.castVote(proposalId, 1, { from: user1 }); // 1 = A favor
      
      const proposal = await governance.getProposalDetails(proposalId);
      assert.equal(proposal.forVotes.toString(), web3.utils.toWei("100000", "ether"));
    });

    it("não deve permitir votação após o período", async () => {
      // Avançar blocos para terminar a votação
      for (let i = 0; i < votingPeriod + 1; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
      
      await expectRevert(
        governance.castVote(proposalId, 1, { from: user1 }),
        "Governor: voting is closed"
      );
    });
  });

  describe("Execução", () => {
    let proposalId;

    beforeEach(async () => {
      // Dar tokens e criar proposta
      await soulToken.mint(user1, web3.utils.toWei("100000", "ether"));
      await soulToken.delegate(user1, { from: user1 });
      
      const targets = [soulToken.address];
      const values = ["0"];
      const calldatas = [soulToken.contract.methods.pause().encodeABI()];
      const description = "Pausar o token";
      
      const result = await governance.propose(
        targets,
        values,
        calldatas,
        description,
        { from: user1 }
      );
      
      proposalId = result.logs[0].args.proposalId;
      
      // Avançar blocos para começar a votação
      for (let i = 0; i < votingDelay + 1; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
      
      // Votar a favor
      await governance.castVote(proposalId, 1, { from: user1 });
      
      // Avançar blocos para terminar a votação
      for (let i = 0; i < votingPeriod + 1; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
      
      // Avançar blocos para passar o timelock
      for (let i = 0; i < minDelay + 1; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
    });

    it("deve permitir execução de propostas aprovadas", async () => {
      const result = await governance.execute(
        [soulToken.address],
        ["0"],
        [soulToken.contract.methods.pause().encodeABI()],
        web3.utils.keccak256(description),
        { from: user1 }
      );
      
      const isPaused = await soulToken.paused();
      assert.equal(isPaused, true);
    });

    it("não deve permitir execução de propostas não aprovadas", async () => {
      // Criar nova proposta sem votos suficientes
      const targets = [soulToken.address];
      const values = ["0"];
      const calldatas = [soulToken.contract.methods.unpause().encodeABI()];
      const description = "Unpause o token";
      
      const result = await governance.propose(
        targets,
        values,
        calldatas,
        description,
        { from: user1 }
      );
      
      const newProposalId = result.logs[0].args.proposalId;
      
      // Avançar blocos
      for (let i = 0; i < votingDelay + votingPeriod + minDelay + 3; i++) {
        await web3.eth.sendTransaction({ from: owner, to: owner });
      }
      
      await expectRevert(
        governance.execute(
          targets,
          values,
          calldatas,
          web3.utils.keccak256(description),
          { from: user1 }
        ),
        "Governor: proposal not successful"
      );
    });
  });

  describe("Configuração", () => {
    it("deve permitir que o owner atualize o delay de votação", async () => {
      const newDelay = 2;
      await governance.setVotingDelay(newDelay);
      
      const delay = await governance.votingDelay();
      assert.equal(delay.toString(), newDelay.toString());
    });

    it("deve permitir que o owner atualize o período de votação", async () => {
      const newPeriod = 4;
      await governance.setVotingPeriod(newPeriod);
      
      const period = await governance.votingPeriod();
      assert.equal(period.toString(), newPeriod.toString());
    });

    it("deve permitir que o owner atualize o quorum", async () => {
      const newQuorum = 5;
      await governance.setQuorum(newQuorum);
      
      const quorum = await governance.quorum(0);
      assert.equal(quorum.toString(), web3.utils.toWei("50000", "ether")); // 5% do supply
    });

    it("não deve permitir que usuários não autorizados atualizem configurações", async () => {
      await expectRevert(
        governance.setVotingDelay(2, { from: user1 }),
        "Ownable: caller is not the owner"
      );
      
      await expectRevert(
        governance.setVotingPeriod(4, { from: user1 }),
        "Ownable: caller is not the owner"
      );
      
      await expectRevert(
        governance.setQuorum(5, { from: user1 }),
        "Ownable: caller is not the owner"
      );
    });
  });
}); 