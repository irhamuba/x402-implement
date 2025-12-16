'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEPOLIA_CONFIG, USDC_CONFIG, ERC20_ABI } from '@/lib/config';

// Extend Window interface for ethereum
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

interface WalletContextType {
    address: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    chainId: number | null;
    isCorrectNetwork: boolean;
    usdcBalance: number | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    switchToSepolia: () => Promise<void>;
    sendUSDC: (recipient: string, amount: number) => Promise<string>;
    refreshBalance: () => Promise<void>;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [chainId, setChainId] = useState<number | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isConnected = !!address;
    const isCorrectNetwork = chainId === SEPOLIA_CONFIG.chainId;

    // Refresh USDC balance
    const refreshBalance = useCallback(async () => {
        if (!address || !window.ethereum) return;

        try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const usdcContract = new ethers.Contract(USDC_CONFIG.address, ERC20_ABI, provider);
            const balance = await usdcContract.balanceOf(address);
            setUsdcBalance(Number(balance) / Math.pow(10, USDC_CONFIG.decimals));
        } catch (err) {
            console.error('Error fetching USDC balance:', err);
        }
    }, [address]);

    // Connect wallet
    const connect = useCallback(async () => {
        if (!window.ethereum) {
            setError('MetaMask not installed. Please install MetaMask to continue.');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Request accounts
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            }) as string[];

            if (accounts.length > 0) {
                setAddress(accounts[0]);
            }

            // Get chain ID
            const chainIdHex = await window.ethereum.request({
                method: 'eth_chainId',
            }) as string;
            setChainId(parseInt(chainIdHex, 16));
        } catch (err) {
            console.error('Connection error:', err);
            setError('Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    }, []);

    // Disconnect wallet
    const disconnect = useCallback(() => {
        setAddress(null);
        setChainId(null);
        setUsdcBalance(null);
        setError(null);
    }, []);

    // Switch to Sepolia
    const switchToSepolia = useCallback(async () => {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CONFIG.chainIdHex }],
            });
        } catch (switchError: unknown) {
            // Chain not added, add it
            const error = switchError as { code: number };
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: SEPOLIA_CONFIG.chainIdHex,
                            chainName: SEPOLIA_CONFIG.chainName,
                            nativeCurrency: SEPOLIA_CONFIG.nativeCurrency,
                            rpcUrls: SEPOLIA_CONFIG.rpcUrls,
                            blockExplorerUrls: SEPOLIA_CONFIG.blockExplorerUrls,
                        }],
                    });
                } catch (addError) {
                    console.error('Failed to add network:', addError);
                    setError('Failed to add Sepolia network');
                }
            }
        }
    }, []);

    // Send USDC
    const sendUSDC = useCallback(async (recipient: string, amount: number): Promise<string> => {
        if (!window.ethereum || !address) {
            throw new Error('Wallet not connected');
        }

        if (!isCorrectNetwork) {
            throw new Error('Please switch to Sepolia network');
        }

        try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const usdcContract = new ethers.Contract(USDC_CONFIG.address, ERC20_ABI, signer);

            // Convert amount to USDC units (6 decimals)
            const amountInUnits = BigInt(Math.floor(amount * Math.pow(10, USDC_CONFIG.decimals)));

            // Convert recipient to proper checksum address (lowercase first to avoid checksum errors)
            const checksumRecipient = ethers.getAddress(recipient.toLowerCase());

            // Send transaction
            const tx = await usdcContract.transfer(checksumRecipient, amountInUnits);

            // Wait for confirmation
            const receipt = await tx.wait();

            // Refresh balance after transfer
            await refreshBalance();

            return receipt.hash;
        } catch (err) {
            console.error('USDC transfer error:', err);
            throw err;
        }
    }, [address, isCorrectNetwork, refreshBalance]);

    // Listen for account changes
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts: unknown) => {
            const accountsArray = accounts as string[];
            if (accountsArray.length > 0) {
                setAddress(accountsArray[0]);
            } else {
                disconnect();
            }
        };

        const handleChainChanged = (chainIdHex: unknown) => {
            setChainId(parseInt(chainIdHex as string, 16));
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, [disconnect]);

    // Refresh balance when address or network changes
    useEffect(() => {
        if (address && isCorrectNetwork) {
            refreshBalance();
        }
    }, [address, isCorrectNetwork, refreshBalance]);

    // Check for existing connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            if (!window.ethereum) return;

            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                }) as string[];

                if (accounts.length > 0) {
                    setAddress(accounts[0]);
                    const chainIdHex = await window.ethereum.request({
                        method: 'eth_chainId',
                    }) as string;
                    setChainId(parseInt(chainIdHex, 16));
                }
            } catch (err) {
                console.error('Error checking connection:', err);
            }
        };

        checkConnection();
    }, []);

    return (
        <WalletContext.Provider
            value={{
                address,
                isConnecting,
                isConnected,
                chainId,
                isCorrectNetwork,
                usdcBalance,
                connect,
                disconnect,
                switchToSepolia,
                sendUSDC,
                refreshBalance,
                error,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
