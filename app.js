/* Bloc-Vote by Precious Temowo */
var ElectionApp = {
  Contract: null,
  accounts: []
};

// Connect using Web3js
(function () {
  if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(ethereum);

    ethereum.on('accountsChanged', function (accounts) {
      ElectionApp.accounts = accounts;
    });
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3.eth.getAccounts().then(accounts => {
      ElectionApp.accounts = accounts;
    });
  }

  // Deployed Contract Address

  //const contractAddress = "0x0BC07DB31F41428367F91FAFBC2B8537e78ffd01";
  const contractAddress = "0x589E24929E2E7965420aB2ADC01Dfe83F2A51052";

  // Deployed Contract ABI
  const contractABI = [{"constant": false, "inputs": [{"name": "_voteIndex", "type": "uint256"} ], "name": "vote", "outputs": [], "payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "electionAdmin","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "totalVotes","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "","type": "uint256"}],"name": "candidates","outputs": [{"name": "name","type": "string"},{"name": "voteCount","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_name","type": "string"}],"name": "addCandidate","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [],"name": "electionName","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [{"name": "_person","type": "address"},{"name": "_voterID","type": "string"},{"name": "_email","type": "string"}],"name": "authoriseVoter","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": true,"inputs": [{"name": "","type": "address"}],"name": "voters","outputs": [{"name": "authorised","type": "bool"},{"name": "voted","type": "bool"},{"name": "vote","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getNumofCandidates","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": false,"inputs": [],"name": "end","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [{"name": "_name","type": "string"}],"payable": false,"stateMutability": "nonpayable","type": "constructor"}]
    
  ElectionApp.Contract = new web3.eth.Contract(contractABI, contractAddress);
})();
