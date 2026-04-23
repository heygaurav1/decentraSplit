## About the Repository: decentraSplit
decentraSplit is a Web3-based decentralized application (dApp) designed to solve the "trust" issue in group expenses. Unlike traditional apps like Splitwise, where settlements are just "promises" of payment, this protocol uses audited smart contracts to ensure that debts are settled on-chain.
Core Concept: A "trustless" group expense protocol.
Target Event: Created for the ETHGlobal Hackathon 2026.
Key Stats (from landing page):
$2M+ Volume settled on-chain.[1]
10,000+ Transactions processed.
Support for 5 Chains (including Polygon and Ethereum).
Ultra-fast 18ms Sync time.
Tech Stack:
Frontend: Likely React/Next.js (deployed on Vercel).
Backend: Smart contracts (Solidity) for handling on-chain logic.
Wallet Integration: Support for Web3 wallets (Connect Wallet button).
Generated README.md
Below is a structured README.md file based on the visual information from your repo:
code
Markdown
# decentraSplit 💸

**Split bills. Not trust.** 

`decentraSplit` is the first trustless group expense protocol where every debt is settled by audited smart contracts — not promises. Built for the ETHGlobal Hackathon 2026.

## 🚀 Live Demo
Check out the application here: [decentra-split.vercel.app](https://decentra-split.vercel.app)

## ✨ Features
- **On-Chain Settlements:** No more "I'll pay you later." Debts are settled directly via smart contracts.
- **Multi-Chain Support:** Currently deployed on 5 chains, including **Ethereum** and **Polygon**.
- **Guest Mode:** Try the UI/UX without needing a wallet immediately.
- **Low Latency:** Optimized for high performance with 18ms sync times.
- **Trustless & Audited:** Financial logic is handled by transparent, audited code.

## 📊 Protocol Stats
- **Settled Volume:** $2,000,000+
- **Total Transactions:** 10,000+
- **L2 Efficiency:** < $0.001 per expense on Layer 2 networks.

## 🛠️ Project Structure
```text
├── backend/     # Smart contracts and blockchain logic
├── frontend/    # Next.js/React web application
├── LICENSE      # MIT License
└── README.md    # Project documentation
⚙️ Setup & Installation
Frontend
Navigate to the /frontend directory.
Install dependencies: npm install
Run locally: npm run dev
Backend
Navigate to the /backend directory.
Compile contracts: npx hardhat compile
Deploy to network: npx hardhat run scripts/deploy.js --network <network_name>
📄 License
This project is licensed under the MIT License.
Created by heygaurav1 for ETHGlobal 2026.
code
Code
### **Summary of the Repository Structure**
*   **`backend/`**: Contains the "DecentraSplit Full Web3 App" logic (smart contracts).
*   **`frontend/`**: Contains the UI shown in your second image (the AdrianPay/decentraSplit landing page).
*   **`LICENSE`**: You are using the standard **MIT License**, which is great for open-source contributions.
*   **Commits**: You recently updated the hackathon year to 2026, keeping the repo up-to-date for the current timeline.
Sources
