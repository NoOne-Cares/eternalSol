#  EternalSOL –  Will Creation on Solana

EternalSOL is a platform that allows users to create secure wills. These wills are claimable by recipients after a set period of user inactivity, offering protection for your assets in cases of lost private keys, death, or prolonged absence.

Built with **Next.js**, **Turborepo**, **Tailwind CSS**, and **TypeScript**, the app is optimised for performance, developer experience, and scalability.

---

##  Tech Stack

- [Next.js](https://nextjs.org/)
- [Turborepo](https://turbo.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jotai](https://jotai.org/) for state management
- [@tanstack/react-query](https://tanstack.com/query) for data fetching
- Solana Web3 SDK & durable nonce mechanism
- Toastify for notifications

---

## Features

- 🔐 **Create on-chain wills** tied to your wallet
- ⏳ **Claim mechanism** based on user inactivity
- 🧠 **No escrow** – funds remain fully accessible to users until claimed
- 💼 **Supports major Solana wallets**

---

##  Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/NoOne-Cares/eternalSol.git
   cd cryptowill
   ```

2. **Install dependencies using Turborepo**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Build the project**
   ```bash
   pnpm build
   ```

---

##  Known Issue

> ❗ **Phantom Wallet Compatibility**  
CryptoWill currently **does not work with the Phantom wallet** due to a signing issue related to durable nonce transactions. We're actively working on a fix.  
In the meantime, please use other supported Solana wallets like **Solflare**, **Backpack**, or **Glow** for a smooth experience.

---


## ✅ To-Do

- [ ] Fix Phantom wallet bug
- [ ] Add multisig support
- [ ] Enable off-chain backup of will metadata
- [ ] Improve claim validation logic
- [ ] UI/UX polish and accessibility testing


