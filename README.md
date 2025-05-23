<p align="center">
  <img src="client\src\assets\logo.svg" alt="Shayoga Logo" width="150"/>
</p>

<h1 align="center">Shayoga</h1>

<p align="center">
  <strong>Decentralized Crowdfunding Platform for Social Good</strong><br/>
  <em>Empowering Communities through Transparent, Secure, and Impactful Fundraising</em>
</p>

<p align="center">
  <a href="#"><img alt="Live" src="https://img.shields.io/badge/LIVE-DEMO-green?style=for-the-badge&logo=ethereum"/></a>

</p>

---

## 🌍 About Shayoga

**Shayoga** is a Web3-powered crowdfunding platform that allows anyone to create or support fundraising campaigns on the Ethereum blockchain. Designed with transparency and decentralization at its core, Shayoga ensures that donations reach the right hands — without intermediaries.

> 🛡️ *Unlike traditional platforms, Shayoga ensures full transparency, no intermediaries, and trustless fund management — all powered by blockchain.*

---

## 🚀 Features

- ✍️ **Create Campaigns** – Launch a fundraising campaign with essential details.
- 💰 **Donate with MetaMask** – Secure ETH donations using Web3 wallet.
- 📊 **Campaign Progress** – View target goals, amount raised, time remaining.
- 🔁 Automatic Fund Transfer – Funds are instantly sent to the campaign creator, enabling trustless, seamless transactions.
- 🌐 **All Campaigns** – Explore and support active causes transparently.

---

## 🛠️ Tech Stack

| Layer        | Tools                             |
|--------------|-----------------------------------|
| **Frontend** | React (Vite), Tailwind CSS         |
| **Backend**  | Solidity Smart Contracts (Hardhat) |
| **Web3**     | Ethers.js, MetaMask Integration    |


## 📁 Project Structure

```
shayoga/
├── src/
│   ├── assets/              # Logo and images
│   ├── components/          # Reusable React components
│   ├── pages/               # Page views
│   ├── context/             # Web3 context logic
│   └── App.jsx
├── contracts/
│   └── Shayoga.sol
├── scripts/
│   └── deploy.js
└── hardhat.config.js
```

---

## 🧑‍💻 Getting Started

### 🖥 Frontend Setup

```bash
cd client
npm install
npm run dev
```
#### ⚙️ Environment Variables

Create a `.env` file inside the `server` folder and add the following variables:

```env
ALCHEMY_API_URL=your_alchemy_api_url_here
PRIVATE_KEY=your_metamask_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

# Compile the contracts
``` bash 
npx hardhat compile 
```

# Deploy the contracts to Sapolia testnet
``` bash
npx hardhat run scripts/deploy.js --network sapolia
```

## 🧑 Author

**Ayush Jain**
[![GitHub](https://img.shields.io/badge/GitHub-urayushjain-black?style=flat\&logo=github)](https://github.com/urayushjain)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ayush%20Jain-blue?style=flat\&logo=linkedin)](https://www.linkedin.com/in/urayushjain)

---

## ⭐️ Show Support

* 🌟 Star this repo
* 🍴 Fork and contribute
* 📢 Share Shayoga with your network

---

