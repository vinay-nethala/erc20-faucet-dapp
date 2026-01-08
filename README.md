# 🚰 Token Faucet DApp (ERC-20 | Sepolia Testnet)

A full-stack **ERC-20 Token Faucet DApp** built using **Solidity, Hardhat, Ethers.js, and Node.js**.  
This project allows users to **connect their wallet**, **claim test tokens**, and interact with a **rate-limited faucet smart contract** deployed on the **Ethereum Sepolia Testnet**.

---

## 📌 Project Features

✅ ERC-20 Token Smart Contract  
✅ Faucet Smart Contract with rate limiting  
✅ Wallet integration (MetaMask)  
✅ Sepolia Testnet deployment  
✅ Frontend + Backend integration  
✅ Contract verification on Etherscan  
✅ Secure environment variable usage  

---

## 🧱 Project Architecture

```bash
token-faucet-dapp
│
├── contracts/ # Solidity smart contracts
│ ├── YourToken.sol # ERC-20 Token contract
│ └── TokenFaucet.sol # Faucet contract
│
├── scripts/
│ └── deploy.js # Deployment script
│
├── frontend/
│ ├── public/
│ │ └── index.html # Frontend UI
│ ├── src/
│ │ └── deployment.json # Auto-generated contract addresses
│ ├── server.js # Express frontend server
│ └── package.json
│
├── .env.example # Environment template
├── hardhat.config.js # Hardhat configuration
├── package.json
└── README.md


---
````

---

## 🔐 Smart Contracts Overview

### 🪙 YourToken (ERC-20)
- Standard ERC-20 token
- Minted initially to Faucet contract
- Used only for testing on Sepolia

### 🚰 TokenFaucet
- Dispenses fixed amount of tokens
- Rate-limited (prevents abuse)
- Each wallet can claim tokens only after a cooldown period

---

## 🌍 Deployed Contracts (Sepolia Testnet)

| Contract | Address |
|--------|--------|
| YourToken | `0x1c33E7cfe9Bdb8AAC76bfCF0AF3866CbDDca59d8` |
| TokenFaucet | `0x095e7Cf6110811066a717E4d9A12951950978829` |

🔗 **Etherscan Links**

- Token: https://sepolia.etherscan.io/address/0x1c33E7cfe9Bdb8AAC76bfCF0AF3866CbDDca59d8  
- Faucet: https://sepolia.etherscan.io/address/0x095e7Cf6110811066a717E4d9A12951950978829  

---


## 🚀 How to Run the Project

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/token-faucet-dapp.git
cd erc20-faucet-dapp
```
## 2️⃣ Run the docker
```bash
docker compose up --build
```
## 3️⃣  Open Browser
```bash
http://localhost:3000
```
## 🦊 How to Use the DApp

 Open frontend in browser

 2️⃣ Click Connect Wallet

 3️⃣ Approve MetaMask connection

 4️⃣ Click Claim Tokens

 5️⃣ Approve transaction

Tokens are received in your wallet 🎉

---
## 🛡️ Security & Best Practices

Private keys stored only in .env

Rate-limiting prevents faucet abuse

Testnet only (no real ETH)

Contracts verified on Etherscan
---
🧪 Network Details

## Network: Ethereum Sepolia

Chain ID: 11155111

RPC: Infura

Wallet: MetaMask
---
## 📚 Technologies Used

Solidity ^0.8.20

Hardhat

Ethers.js

Node.js

Express.js

HTML / JavaScript

MetaMask

Infura RPC
---
## 🏁 Conclusion

This project demonstrates a complete end-to-end Web3 DApp including smart contract development, deployment, frontend integration, and wallet interaction.
It is suitable for academic submission, portfolio, and Web3 learning.

