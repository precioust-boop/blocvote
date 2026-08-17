import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Election", function () {
  async function deployElection() {
    const [admin, voter, secondVoter, outsider] = await ethers.getSigners();
    const election = await ethers.deployContract("Election", [
      "Community Election",
    ]);
    await election.waitForDeployment();

    return { admin, voter, secondVoter, outsider, election };
  }

  async function deployElectionWithCandidates() {
    const fixture = await deployElection();
    await fixture.election.addCandidate("Ada");
    await fixture.election.addCandidate("Grace");
    return fixture;
  }

  it("records the deployer and election name", async function () {
    const { admin, election } = await deployElection();

    expect(await election.electionAdmin()).to.equal(admin.address);
    expect(await election.electionName()).to.equal("Community Election");
    expect(await election.ended()).to.equal(false);
  });

  it("rejects an empty election name", async function () {
    await expect(ethers.deployContract("Election", [""])).to.be.revertedWithCustomError(
      await ethers.getContractFactory("Election"),
      "ElectionNameRequired",
    );
  });

  it("allows only the administrator to add valid candidates", async function () {
    const { election, outsider } = await deployElection();

    await expect(election.addCandidate("Ada"))
      .to.emit(election, "CandidateAdded")
      .withArgs(0, "Ada");
    await expect(election.connect(outsider).addCandidate("Grace"))
      .to.be.revertedWithCustomError(election, "AdminOnly");
    await expect(election.addCandidate(""))
      .to.be.revertedWithCustomError(election, "CandidateNameRequired");
  });

  it("allows only the administrator to authorise a voter once", async function () {
    const { election, voter, outsider } = await deployElection();

    await expect(election.authoriseVoter(voter.address))
      .to.emit(election, "VoterAuthorised")
      .withArgs(voter.address);
    await expect(election.authoriseVoter(voter.address))
      .to.be.revertedWithCustomError(election, "VoterAlreadyAuthorised")
      .withArgs(voter.address);
    await expect(election.connect(outsider).authoriseVoter(outsider.address))
      .to.be.revertedWithCustomError(election, "AdminOnly");
    await expect(election.authoriseVoter(ethers.ZeroAddress))
      .to.be.revertedWithCustomError(election, "InvalidVoterAddress");
  });

  it("records one vote from an authorised voter", async function () {
    const { election, voter } = await deployElectionWithCandidates();
    await election.authoriseVoter(voter.address);

    await expect(election.connect(voter).vote(1))
      .to.emit(election, "VoteCast")
      .withArgs(voter.address, 1);

    const voterRecord = await election.voters(voter.address);
    const candidate = await election.candidates(1);
    expect(voterRecord.authorised).to.equal(true);
    expect(voterRecord.voted).to.equal(true);
    expect(voterRecord.candidateIndex).to.equal(1);
    expect(candidate.voteCount).to.equal(1);
    expect(await election.totalVotes()).to.equal(1);
  });

  it("rejects unauthorised, duplicate, and invalid votes", async function () {
    const { election, voter, secondVoter } =
      await deployElectionWithCandidates();

    await expect(election.connect(voter).vote(0))
      .to.be.revertedWithCustomError(election, "VoterNotAuthorised")
      .withArgs(voter.address);

    await election.authoriseVoter(voter.address);
    await election.authoriseVoter(secondVoter.address);
    await expect(election.connect(secondVoter).vote(2))
      .to.be.revertedWithCustomError(election, "CandidateDoesNotExist")
      .withArgs(2);

    await election.connect(voter).vote(0);
    await expect(election.connect(voter).vote(1))
      .to.be.revertedWithCustomError(election, "VoterAlreadyVoted")
      .withArgs(voter.address);
  });

  it("requires at least two candidates before voting", async function () {
    const { election, voter } = await deployElection();
    await election.addCandidate("Only candidate");
    await election.authoriseVoter(voter.address);

    await expect(election.connect(voter).vote(0))
      .to.be.revertedWithCustomError(election, "NotEnoughCandidates");
  });

  it("locks the candidate list after voting starts", async function () {
    const { election, voter } = await deployElectionWithCandidates();
    await election.authoriseVoter(voter.address);
    await election.connect(voter).vote(0);

    await expect(election.addCandidate("Late candidate"))
      .to.be.revertedWithCustomError(election, "CandidatesLocked");
  });

  it("ends without deleting the contract and blocks further changes", async function () {
    const { election, voter } = await deployElectionWithCandidates();
    await election.authoriseVoter(voter.address);
    await election.connect(voter).vote(0);

    await expect(election.end())
      .to.emit(election, "ElectionEnded")
      .withArgs(1);
    expect(await election.ended()).to.equal(true);
    expect(await election.totalVotes()).to.equal(1);
    await expect(election.addCandidate("Another candidate"))
      .to.be.revertedWithCustomError(election, "ElectionAlreadyEnded");
    await expect(election.connect(voter).vote(0))
      .to.be.revertedWithCustomError(election, "ElectionAlreadyEnded");
  });
});
