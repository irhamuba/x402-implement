'use client';

import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut, AlertTriangle, Loader2 } from 'lucide-react';

export function ConnectWalletButton() {
    const {
        address,
        isConnected,
        isConnecting,
        isCorrectNetwork,
        usdcBalance,
        connect,
        disconnect,
        switchToSepolia,
    } = useWallet();

    // Safe balance with fallback
    const balance = usdcBalance ?? 0;

    if (isConnecting) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-500 
                   text-sm font-medium rounded-xl cursor-wait"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
            </button>
        );
    }

    if (!isConnected) {
        return (
            <button
                onClick={connect}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white 
                   text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all
                   shadow-sm hover:shadow-md"
            >
                <Wallet className="w-4 h-4" />
                Connect
            </button>
        );
    }

    if (!isCorrectNetwork) {
        return (
            <button
                onClick={switchToSepolia}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white 
                   text-sm font-semibold rounded-xl hover:bg-amber-600 transition-all"
            >
                <AlertTriangle className="w-4 h-4" />
                Switch to Sepolia
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Balance */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                        flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">$</span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                    {balance.toFixed(2)}
                </span>
            </div>

            {/* Address & Disconnect */}
            <div className="group relative">
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 
                           text-sm font-medium rounded-xl hover:bg-slate-200 transition-all">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {formatAddress(address || '')}
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 
                        rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 
                        group-hover:visible transition-all z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Connected</p>
                        <p className="text-sm font-mono text-slate-700">{formatAddress(address || '')}</p>
                    </div>
                    <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                        <p className="text-xs text-slate-500 mb-1">Balance</p>
                        <p className="text-sm font-semibold text-slate-700">${balance.toFixed(2)} USDC</p>
                    </div>
                    <button
                        onClick={disconnect}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 
                       hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                    </button>
                </div>
            </div>
        </div>
    );
}
