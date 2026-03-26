# AcadChain: Blockchain-Based Academic Identity System

AcadChain is an enterprise-grade, decentralized platform for issuing and verifying academic credentials. Built on the MERN stack and Ethereum blockchain, it ensures that academic records are immutable, transparent, and instantly verifiable by employers and institutions worldwide.

## 🚀 Key Features

- **Decentralized Storage**: PDF certificates are stored on IPFS, providing a permanent and tamper-proof storage solution.
- **Blockchain Verification**: Each certificate's authenticity is backed by an Ethereum smart contract on the Sepolia testnet.
- **Role-Based Access**: Specialized dashboards for Admin, Institutions, Students, and Verifiers.
- **Wallet Integration**: Seamless connection with MetaMask for signing transactions and proving ownership.
- **Premium UI**: Modern, SaaS-style interface using Tailwind CSS and Framer Motion with glassmorphism effects.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Ethers.js.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose).
- **Blockchain**: Solidity, Hardhat, OpenZeppelin.
- **Storage**: IPFS (Pinata).
- **Authentication**: JWT, BCrypt, Role-based Middleware.

## 📂 Architecture

### System Flow
1. **Institution** uploads student details and certificate PDF.
2. **Server** pins the PDF to **IPFS** and returns a CID.
3. **Institution** signs a transaction on **Ethereum** linking the student's wallet and the CID.
4. **Student** views their dashboard to see their verified credentials.
5. **Verifier** enters the Certificate ID to instantly authenticate the record against the blockchain state.

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MetaMask Browser Extension
- MongoDB Atlas Account
- Pinata API Key

### 2. Backend Setup
```bash
cd server
npm install
# Create .env file with your credentials
npm start
```

### 3. Blockchain Setup
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📄 API Documentation

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | Public | Register a new user |
| `/api/auth/login` | POST | Public | Login and get JWT |
| `/api/certificates/issue` | POST | Institution | Record new issuance |
| `/api/institutions/apply` | POST | Institution | Apply for accreditation |
| `/api/verify/:certId` | GET | Public | Verify certificate integrity |

## 🎓 Project Presentation (Slide Outline)

1. **Title Slide**: AcadChain - Decentralized Academic Credentialing.
2. **Problem Statement**: Forgery in academic certificates and the high cost of manual verification.
3. **Solution**: Using Blockchain as a single source of truth for academic identities.
4. **Architecture**: Overview of the MERN + Ethereum + IPFS stack.
5. **Role: Admin**: Management of accredited institutions and system health.
6. **Role: Institution**: The issuance process and IPFS integration.
7. **Role: Student**: Digital ownership and wallet connectivity.
8. **Role: Verifier**: Instant public verification portal.
9. **Smart Contract Design**: Explanation of the Solidity mappings and security modifiers.
10. **UI/UX Showcase**: Modern design principles used (Glassmorphism, Animations).
11. **Security**: JWT protection, blockchain immutability, and hashed storage.
12. **Challenges Overcome**: Gas optimization and IPFS latency handling.
13. **Future Enhancements**: Soulbound Tokens (SBTs), Zero-Knowledge Proofs for privacy.
14. **Conclusion**: Transforming academic trust in the digital age.
15. **Q&A**: Contact and GitHub info.

## ❓ Viva Questions & Answers

**Q1: Why use Blockchain instead of a traditional database?**
A: Traditional databases are centralized and can be altered by administrators. Blockchain provides an immutable, decentralized ledger where once a certificate is issued, it cannot be tampered with, ensuring trust.

**Q2: What is the role of IPFS in this system?**
A: Since storing large PDF files directly on the blockchain is extremely expensive (Gas costs), we store the file on IPFS and only store the content-specific CID (hash) on the blockchain.

**Q3: How does the verification process work without logging in?**
A: The verification route is public. It queries the smart contract directly using the Certificate ID (bytes32 hash) to check the `isValid` boolean and metadata stored on-chain.

## 🔗 LinkedIn Post Content

"Excited to share my latest project: AcadChain! 🎓⛓️ 

It's a full-stack Blockchain-Based Academic Identity System that eliminates certificate forgery using the MERN stack, Ethereum, and IPFS. 

Key Highlights:
✅ Immutable record storage on Sepolia Testnet
✅ Decentralized PDF hosting via Pinata IPFS
✅ SaaS-level UI with glassmorphism & Framer Motion
✅ Role-based dashboards for Universities & Students

Check out the repo here: [Your GitHub Link]

#Blockchain #MERN #Web3 #Education #DApp #Solidity #Innovation"

---
Developed by Dharaneen.
