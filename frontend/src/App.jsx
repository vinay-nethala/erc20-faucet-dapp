import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import {
  connectWallet as walletConnect,
  getSigner,
  getBalance,
  canClaim as checkCanClaim,
  getRemainingAllowance,
  requestTokens as claimTokens,
  getProvider,
  getLastClaimAt,
  getCooldownTime
} from './utils/contracts.js';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: "", type: "" });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [network, setNetwork] = useState(null);
  const [totalCooldown, setTotalCooldown] = useState(86400); // Default 24h

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      const interval = setInterval(() => {
        updateData(account);
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [account]);

  async function checkConnection() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateData(accounts[0]);
        }
        // Check network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetwork(parseInt(chainId, 16));
      } catch (err) {
        console.error("Failed to check connection:", err);
      }
    }
  }

  async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      setAccount(null);
      setBalance("0");
      setAllowance("0");
      setCanClaim(false);
    } else {
      setAccount(accounts[0]);
      updateData(accounts[0]);
    }
    // Check network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    setNetwork(parseInt(chainId, 16));
  }

  async function connectWallet() {
    if (!window.ethereum) return alert("Please install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);
      updateData(accounts[0]);
      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(parseInt(chainId, 16));
    } catch (err) {
      console.error(err);
      setStatus({ msg: "Failed to connect wallet", type: "error" });
    }
  }

  async function updateData(address) {
    try {
      const bal = await getBalance(address);
      const allow = await getRemainingAllowance(address);
      const claimable = await checkCanClaim(address);

      setBalance(ethers.formatEther(bal));
      setAllowance(ethers.formatEther(allow));
      setCanClaim(claimable);

      // Calculate cooldown remaining
      const lastClaim = await getLastClaimAt(address);
      const cooldown = await getCooldownTime();
      setTotalCooldown(cooldown);
      if (lastClaim > 0) {
        const nextClaimTime = lastClaim + cooldown;
        const now = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, nextClaimTime - now);
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    } catch (err) {
      console.error("Failed to update data:", err);
    }
  }

  async function handleClaim() {
    if (!account) return;
    setLoading(true);
    setStatus({ msg: "Processing Transaction...", type: "info" });
    try {
      const txHash = await claimTokens();
      setStatus({ msg: `Success! Tokens claimed. TX: ${txHash.slice(0, 10)}...`, type: "success" });
      
      // Wait a bit before updating data
      setTimeout(() => updateData(account), 2000);
    } catch (err) {
      console.error(err);
      let errorMsg = "Transaction Failed. Please try again.";
      if (err.message.includes("Cooldown")) {
        errorMsg = "Cooldown period active. Please wait before claiming again.";
      } else if (err.message.includes("limit")) {
        errorMsg = "You have reached your lifetime claim limit.";
      } else if (err.message.includes("paused")) {
        errorMsg = "The faucet is currently paused.";
      }
      setStatus({ msg: errorMsg, type: "error" });
    }
    setLoading(false);
  }

  function formatCooldown(seconds) {
    if (seconds === 0) return "Ready to claim!";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m remaining`;
  }

  return (
    <div className="app">
      {/* Background Decoration */}
      <div className="bg-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#gradient)" strokeWidth="3" />
              <path d="M20 10 L20 30 M10 20 L30 20" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <h1>Sepolia Faucet</h1>
          </div>
          <p className="subtitle">Get free testnet tokens for development</p>
        </div>

        {/* Main Card */}
        <div className="card">
          {!account ? (
            <div className="connect-section">
              <div className="icon-wrapper">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="35" fill="url(#bgGradient)" opacity="0.1" />
                  <path d="M25 40 L35 30 L35 50 Z M45 30 L55 40 L45 50 Z" fill="url(#iconGradient)" />
                  <defs>
                    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2>Connect Your Wallet</h2>
              <p>Connect your MetaMask wallet to claim free Sepolia testnet tokens</p>
              <button onClick={connectWallet} className="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2 L18 7 L18 13 L10 18 L2 13 L2 7 Z" opacity="0.5" />
                  <circle cx="10" cy="10" r="3" />
                </svg>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="dashboard">
              {/* Network Warning */}
              {network !== 11155111 && (
                <div className="network-warning">
                  <div className="warning-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2 L18 18 L2 18 Z" opacity="0.5" />
                      <circle cx="10" cy="16" r="1" />
                      <path d="M10 6 L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span>Please switch to Sepolia Testnet to use the faucet</span>
                </div>
              )}

              {/* Wallet Info */}
              <div className="wallet-badge">
                <div className="wallet-icon">
                  <div className="status-dot"></div>
                </div>
                <div className="wallet-details">
                  <span className="wallet-label">Connected Wallet</span>
                  <div className="wallet-address-row">
                    <span className="wallet-address">{account.slice(0, 6)}...{account.slice(-4)}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(account)} 
                      className="copy-btn"
                      title="Copy address"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="4" y="4" width="8" height="8" rx="1" opacity="0.5" />
                        <path d="M2 6 L2 14 L10 14 L10 10 L6 10 L6 6 Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="8" opacity="0.2" />
                      <path d="M12 6 L12 12 L16 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Your Balance</span>
                    <span className="stat-value">{parseFloat(balance).toFixed(2)} <span className="stat-unit">STT</span></span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" opacity="0.2" />
                      <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Remaining Limit</span>
                    <span className="stat-value">{parseFloat(allowance).toFixed(2)} <span className="stat-unit">STT</span></span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" opacity="0.2" />
                      <path d="M12 6 L12 12 L16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Claim Status</span>
                    <span className="stat-value" style={{fontSize: '14px'}}>{formatCooldown(cooldownRemaining)}</span>
                    {cooldownRemaining > 0 && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${((totalCooldown - cooldownRemaining) / totalCooldown) * 100}%`}}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={loading || !canClaim || network !== 11155111}
                className={`btn btn-claim ${loading || !canClaim || network !== 11155111 ? 'disabled' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : network !== 11155111 ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="10" r="7" opacity="0.3" />
                      <path d="M10 6 L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="10" cy="13" r="0.5" />
                    </svg>
                    Switch to Sepolia
                  </>
                ) : canClaim ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2 L10 10 M6 6 L10 10 L14 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="4" y="12" width="12" height="6" rx="1" opacity="0.5" />
                    </svg>
                    Claim 10 STT Tokens
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="10" cy="10" r="7" opacity="0.3" />
                      <path d="M10 6 L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="10" cy="13" r="0.5" />
                    </svg>
                    Cooldown Active
                  </>
                )}
              </button>

              {/* Status Message */}
              {status.msg && (
                <div className={`status-message ${status.type}`}>
                  <div className="status-icon">
                    {status.type === 'success' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <circle cx="10" cy="10" r="8" opacity="0.2" />
                        <path d="M6 10 L9 13 L14 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {status.type === 'error' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <circle cx="10" cy="10" r="8" opacity="0.2" />
                        <path d="M7 7 L13 13 M13 7 L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {status.type === 'info' && (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <circle cx="10" cy="10" r="8" opacity="0.2" />
                        <path d="M10 9 L10 14 M10 6 L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span>{status.msg}</span>
                </div>
              )}

              {/* Info Cards */}
              <div className="info-section">
                <div className="info-card">
                  <h3>📋 Faucet Rules</h3>
                  <ul>
                    <li>10 STT tokens per claim</li>
                    <li>24-hour cooldown period</li>
                    <li>50 STT lifetime maximum</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Powered by Sepolia Testnet • Built with React & Ethers.js</p>
          <div className="footer-links">
            <a href="https://sepolia.etherscan.io/address/0x620c51860D2F639759fEe7C822681F6a54A0c105" target="_blank" rel="noopener noreferrer">
              View Token Contract
            </a>
            <a href="https://sepolia.etherscan.io/address/0xAB71415ECD68551FFfcE0257d923d92B5256BC30" target="_blank" rel="noopener noreferrer">
              View Faucet Contract
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;