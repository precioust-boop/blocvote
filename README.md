# BlocVote

BlocVote is an educational blockchain voting prototype created by Precious
Temowo. It demonstrates how an election administrator can register candidates,
authorise wallet addresses, accept one vote per authorised wallet, and preserve
an auditable result on an Ethereum-compatible blockchain.

![BlocVote logo](blocvote.png)

## Modernisation status

The smart contract and development workflow were modernised in 2026 after the
project's original release:

- Solidity upgraded from `0.4.26` to `0.8.28`
- Hardhat 3 added for compilation and automated testing
- `selfdestruct` replaced with a permanent `ended` state
- custom errors and events added
- candidate, voter, election-state, and vote validation added
- candidate registration locked after the first vote
- nine automated contract tests added

The HTML interface is the original legacy prototype. Its embedded ABI and
contract address have not yet been migrated to the new contract, so it should
not currently be treated as a working interface for the modern contract.

## What the contract supports

- The deployment wallet becomes the election administrator.
- Only the administrator can add candidates and authorise voters.
- Candidates can only be added before the first vote.
- An election needs at least two candidates before voting can begin.
- Each authorised wallet can vote once for an existing candidate.
- Ending an election permanently blocks further state changes while keeping
  its results available.
- Events provide an audit trail for candidate registration, voter
  authorisation, votes, and election closure.

## Important limitations

BlocVote is a learning and portfolio project, not a production voting system.
Wallet addresses and transactions are public, and the contract does not provide
secret ballots, real-world identity verification, coercion resistance, or a
formal security audit. Do not use it for governmental or high-stakes elections.

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer

## Install and test

```bash
pnpm install
pnpm test
```

To compile without running the tests:

```bash
pnpm compile
```

Hardhat writes generated files to `artifacts/`, `cache/`, and `types/`. These
directories are excluded from Git.

## Project structure

```text
contracts/Election.sol  Modern Solidity election contract
test/Election.ts        Automated contract tests
hardhat.config.ts       Hardhat and compiler configuration
*.html                  Original proof-of-concept interface
app.js                  Original Web3 integration (legacy ABI/address)
lib/                    Original vendored frontend libraries
```

## Next phase

The next planned phase is to replace the legacy Web3 integration and hard-coded
contract address, deploy through a repeatable local/testnet workflow, and update
the browser interface for the new ABI.

## License

This project is available under the [MIT License](LICENSE).
