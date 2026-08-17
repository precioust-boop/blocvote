/* Bloc-Vote by Precious Temowo */
// tells the compiler the version of solidity we want to use
pragma solidity ^0.4.26;

// election class
contract Election{
    //contains candidate data 
    struct Candidate{
        string name;
        uint voteCount;
    }
    
    struct Voter{
        bool authorised;
        bool voted;
        uint vote;  // keep track of candidates
    }
    
    //Election Admin of this contract (whoever that deploys this contract)
    
    address public electionAdmin;
    string public electionName;
    
    // a key value stre to keep track of the voter
    mapping(address => Voter) public voters;
   
    // Candidate Array type
    Candidate[] public candidates;
    
    //total votes received
    uint public totalVotes;
    
    //modifier to assert 
    modifier electionAdminOnly(){
        require(msg.sender == electionAdmin);
        _; // represents the remaining code of the addCandidatefunction
    }
    
    //constructor for Election contract
    function Election(string _name) public {
        //address of the user account that deployed contract
        electionAdmin = msg.sender;
        electionName = _name;
    }
    
     //only the owner of the contract can add a new Candidate
    function addCandidate(string _name) electionAdminOnly public{
       candidates.push(Candidate(_name, 0));
    }
    
    function getNumofCandidates() public view returns(uint){
        return candidates.length;
   }
    
    function authoriseVoter(address _person, string _voterID, string _email)electionAdminOnly public{
        //retreiving voter object
        voters[_person].authorised = true;
        
    }
    
    function vote(uint _voteIndex) public{
        //make sure person has not voted yet
        require(!voters[msg.sender].voted);
        
        //make sure person is authorised to vote first
        require(voters[msg.sender].authorised);
        
        voters[msg.sender].vote = _voteIndex;
        voters[msg.sender].voted = true;
        
        //tally results 
        //increment Candidate vote by 1
        candidates[_voteIndex].voteCount +=1;
        
        //increment total votes by one 
        totalVotes += 1;
    }
    
    //to end Election
    function end() electionAdminOnly public{
        selfdestruct(electionAdmin);
    }
}
