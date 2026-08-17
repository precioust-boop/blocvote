// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title BlocVote Election
/// @notice A transparent, administrator-managed election for educational use.
/// @dev Votes and voter wallet activity are public on-chain. This contract does
///      not provide secret ballots or identity verification.
contract Election {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool authorised;
        bool voted;
        uint256 candidateIndex;
    }

    error AdminOnly();
    error ElectionAlreadyEnded();
    error ElectionNameRequired();
    error CandidateNameRequired();
    error CandidateDoesNotExist(uint256 candidateIndex);
    error CandidatesLocked();
    error InvalidVoterAddress();
    error VoterAlreadyAuthorised(address voter);
    error VoterNotAuthorised(address voter);
    error VoterAlreadyVoted(address voter);
    error NotEnoughCandidates();

    event CandidateAdded(uint256 indexed candidateIndex, string name);
    event VoterAuthorised(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateIndex);
    event ElectionEnded(uint256 totalVotes);

    address public immutable electionAdmin;
    string public electionName;
    bool public ended;
    uint256 public totalVotes;

    Candidate[] public candidates;
    mapping(address => Voter) public voters;

    modifier electionAdminOnly() {
        if (msg.sender != electionAdmin) revert AdminOnly();
        _;
    }

    modifier whileActive() {
        if (ended) revert ElectionAlreadyEnded();
        _;
    }

    constructor(string memory name_) {
        if (bytes(name_).length == 0) revert ElectionNameRequired();

        electionAdmin = msg.sender;
        electionName = name_;
    }

    /// @notice Adds a candidate before the first vote is cast.
    function addCandidate(
        string calldata name_
    ) external electionAdminOnly whileActive {
        if (totalVotes != 0) revert CandidatesLocked();
        if (bytes(name_).length == 0) revert CandidateNameRequired();

        uint256 candidateIndex = candidates.length;
        candidates.push(Candidate({name: name_, voteCount: 0}));

        emit CandidateAdded(candidateIndex, name_);
    }

    /// @notice Authorises a wallet to vote once in this election.
    function authoriseVoter(
        address voter
    ) external electionAdminOnly whileActive {
        if (voter == address(0)) revert InvalidVoterAddress();
        if (voters[voter].authorised) revert VoterAlreadyAuthorised(voter);

        voters[voter].authorised = true;

        emit VoterAuthorised(voter);
    }

    /// @notice Casts one vote for an existing candidate.
    function vote(uint256 candidateIndex) external whileActive {
        Voter storage voter = voters[msg.sender];

        if (!voter.authorised) revert VoterNotAuthorised(msg.sender);
        if (voter.voted) revert VoterAlreadyVoted(msg.sender);
        if (candidates.length < 2) revert NotEnoughCandidates();
        if (candidateIndex >= candidates.length) {
            revert CandidateDoesNotExist(candidateIndex);
        }

        voter.voted = true;
        voter.candidateIndex = candidateIndex;
        candidates[candidateIndex].voteCount += 1;
        totalVotes += 1;

        emit VoteCast(msg.sender, candidateIndex);
    }

    /// @notice Permanently closes the election while preserving its results.
    function end() external electionAdminOnly whileActive {
        ended = true;

        emit ElectionEnded(totalVotes);
    }

    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }
}
