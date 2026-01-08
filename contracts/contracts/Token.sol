// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    // Maximum supply: 1 Million tokens
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18;
    
    // Store the faucet address here
    address public faucetAddress;

    constructor() ERC20("SepoliaTestToken", "STT") Ownable(msg.sender) {
        // Constructor is empty because Faucet will mint tokens
    }

    // Set the faucet address (Only owner can call)
    function setFaucetAddress(address _faucet) external onlyOwner {
        faucetAddress = _faucet;
    }

    // Only the faucet can create tokens
    function mint(address to, uint256 amount) external {
        require(msg.sender == faucetAddress, "Only faucet can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}