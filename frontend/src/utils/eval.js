import {
  connectWallet as walletConnect,
  requestTokens as requestFaucetTokens,
  getBalance,
  canClaim,
  getRemainingAllowance,
  getContractAddresses
} from './contracts.js';

// Expose evaluation interface on window object
window.__EVAL__ = {
  /**
   * Connect wallet and return connected address
   * @returns {Promise<string>} Connected Ethereum address
   */
  connectWallet: async function() {
    try {
      const address = await walletConnect();
      if (!address) {
        throw new Error("Failed to connect wallet");
      }
      return address;
    } catch (error) {
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  },

  /**
   * Request tokens from faucet
   * @returns {Promise<string>} Transaction hash
   */
  requestTokens: async function() {
    try {
      const txHash = await requestFaucetTokens();
      if (!txHash) {
        throw new Error("Transaction failed to return hash");
      }
      return txHash;
    } catch (error) {
      throw new Error(`Token request failed: ${error.message}`);
    }
  },

  /**
   * Get token balance for an address
   * @param {string} address - Ethereum address to check
   * @returns {Promise<string>} Balance in base units (wei equivalent)
   */
  getBalance: async function(address) {
    try {
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address");
      }
      const balance = await getBalance(address);
      return balance;
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  },

  /**
   * Check if address can claim tokens
   * @param {string} address - Ethereum address to check
   * @returns {Promise<boolean>} True if address can claim
   */
  canClaim: async function(address) {
    try {
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address");
      }
      const eligible = await canClaim(address);
      return Boolean(eligible);
    } catch (error) {
      throw new Error(`Failed to check claim eligibility: ${error.message}`);
    }
  },

  /**
   * Get remaining claimable allowance for address
   * @param {string} address - Ethereum address to check
   * @returns {Promise<string>} Remaining allowance in base units
   */
  getRemainingAllowance: async function(address) {
    try {
      if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address");
      }
      const allowance = await getRemainingAllowance(address);
      return allowance;
    } catch (error) {
      throw new Error(`Failed to get remaining allowance: ${error.message}`);
    }
  },

  /**
   * Get deployed contract addresses
   * @returns {Promise<object>} Object with token and faucet addresses
   */
  getContractAddresses: async function() {
    try {
      const addresses = getContractAddresses();
      if (!addresses || !addresses.token || !addresses.faucet) {
        throw new Error("Contract addresses not configured");
      }
      return addresses;
    } catch (error) {
      throw new Error(`Failed to get contract addresses: ${error.message}`);
    }
  }
};

// Log that evaluation interface is ready
console.log('✅ Evaluation interface (window.__EVAL__) is ready');
console.log('Available methods:', Object.keys(window.__EVAL__));
