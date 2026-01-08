import { ethers } from 'ethers';

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const FAUCET_ABI = [
  "function requestTokens()",
  "function canClaim(address) view returns (bool)",
  "function remainingAllowance(address) view returns (uint256)",
  "function COOLDOWN_TIME() view returns (uint256)",
  "function lastClaimAt(address) view returns (uint256)",
  "function totalClaimed(address) view returns (uint256)",
  "function isPaused() view returns (bool)",
  "event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];

const TOKEN_ADDRESS = "0x620c51860D2F639759fEe7C822681F6a54A0c105";
const FAUCET_ADDRESS = "0xAB71415ECD68551FFfcE0257d923d92B5256BC30";
const RPC_URL = import.meta.env.VITE_RPC_URL;

let provider = null;
let signer = null;

// Initialize provider
export function getProvider() {
  if (!provider) {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else if (RPC_URL) {
      provider = new ethers.JsonRpcProvider(RPC_URL);
    } else {
      throw new Error("No Ethereum provider found");
    }
  }
  return provider;
}

// Get signer from connected wallet
export async function getSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }
  const browserProvider = new ethers.BrowserProvider(window.ethereum);
  signer = await browserProvider.getSigner();
  return signer;
}

// Get token contract instance
export function getTokenContract(signerOrProvider) {
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider || getProvider());
}

// Get faucet contract instance
export function getFaucetContract(signerOrProvider) {
  return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signerOrProvider || getProvider());
}

// Connect wallet and return address
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }
  
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    throw new Error("Failed to connect wallet: " + error.message);
  }
}

// Request tokens from faucet
export async function requestTokens() {
  try {
    const signer = await getSigner();
    const faucet = getFaucetContract(signer);
    
    const tx = await faucet.requestTokens();
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error) {
    if (error.message.includes("Faucet is paused")) {
      throw new Error("Faucet is currently paused");
    } else if (error.message.includes("Cooldown active or limit reached")) {
      throw new Error("Cooldown period active or lifetime limit reached");
    } else {
      throw new Error("Transaction failed: " + error.message);
    }
  }
}

// Get token balance for address
export async function getBalance(address) {
  const token = getTokenContract();
  const balance = await token.balanceOf(address);
  return balance.toString();
}

// Check if address can claim
export async function canClaim(address) {
  const faucet = getFaucetContract();
  return await faucet.canClaim(address);
}

// Get remaining allowance for address
export async function getRemainingAllowance(address) {
  const faucet = getFaucetContract();
  const allowance = await faucet.remainingAllowance(address);
  return allowance.toString();
}

// Get contract addresses
export function getContractAddresses() {
  return {
    token: TOKEN_ADDRESS,
    faucet: FAUCET_ADDRESS
  };
}

// Get last claim timestamp
export async function getLastClaimAt(address) {
  const faucet = getFaucetContract();
  const timestamp = await faucet.lastClaimAt(address);
  return Number(timestamp);
}

// Get cooldown time
export async function getCooldownTime() {
  const faucet = getFaucetContract();
  const cooldown = await faucet.COOLDOWN_TIME();
  return Number(cooldown);
}
