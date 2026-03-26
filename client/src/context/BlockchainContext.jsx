import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const BlockchainContext = createContext();

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const BlockchainProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);

    const connectWallet = async (manual = true) => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const { ethers } = await import('ethers');
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);

                const tempProvider = new ethers.BrowserProvider(window.ethereum);
                const signer = await tempProvider.getSigner();

                let ABI;
                try {
                    const abiModule = await import('../artifacts/contracts/AcademicIdentity.sol/AcademicIdentity.json');
                    ABI = abiModule.default || abiModule;
                } catch (e) {
                    console.warn('ABI not found, contract features disabled');
                    setProvider(tempProvider);
                    return;
                }

                const tempContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    ABI.abi,
                    signer
                );

                setProvider(tempProvider);
                setContract(tempContract);
            } catch (error) {
                console.error("Connection error:", error);
                if (error.code === 4001) {
                    toast.error('User rejected the wallet connection request.');
                } else {
                    toast.error(error.message || 'Failed to connect to MetaMask.');
                }
            }
        } else if (manual) {
            console.warn("MetaMask not installed — running in demo mode");
            toast.error("MetaMask extension not found!", { id: 'mm-missing' });
            toast((t) => (
                <span>
                    Please install <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold">MetaMask</a> to use blockchain features.
                </span>
            ), { icon: '🦊', id: 'mm-install-prompt' });
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setContract(null);
        setProvider(null);
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || null);
            });
        }
    }, []);

    return (
        <BlockchainContext.Provider value={{ account, contract, provider, connectWallet, disconnectWallet }}>
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = () => useContext(BlockchainContext);
