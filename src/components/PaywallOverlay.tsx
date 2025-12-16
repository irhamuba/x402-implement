'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';
import { Lock, Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react';

interface PaywallOverlayProps {
    price: number;
    authorWallet: string;
    authorName: string;
    articleId: string;
    onPaymentSuccess: () => void;
}

type PaymentStep = 'idle' | 'connecting' | 'confirming' | 'processing' | 'verifying' | 'success' | 'error';

export function PaywallOverlay({
    price,
    authorWallet,
    authorName,
    articleId,
    onPaymentSuccess,
}: PaywallOverlayProps) {
    const { address, isConnected, isCorrectNetwork, connect, switchToSepolia, sendUSDC } = useWallet();
    const [step, setStep] = useState<PaymentStep>('idle');
    const [error, setError] = useState<string | null>(null);
    const [alreadyPaid, setAlreadyPaid] = useState(false);
    const [checkingPayment, setCheckingPayment] = useState(true);

    // Check if user already paid for this article
    useEffect(() => {
        const checkPayment = async () => {
            if (!address) {
                setCheckingPayment(false);
                return;
            }

            try {
                const response = await fetch(`/api/article/${articleId}`, {
                    headers: { 'X-Wallet-Address': address },
                });
                const data = await response.json();

                if (data.unlocked) {
                    setAlreadyPaid(true);
                    // Auto-refresh the page to show content
                    onPaymentSuccess();
                }
            } catch (error) {
                console.error('Error checking payment:', error);
            } finally {
                setCheckingPayment(false);
            }
        };

        checkPayment();
    }, [address, articleId, onPaymentSuccess]);

    const handleUnlock = async () => {
        setError(null);

        if (!isConnected) {
            setStep('connecting');
            await connect();
            return;
        }

        if (!isCorrectNetwork) {
            await switchToSepolia();
            return;
        }

        // Double check if already paid
        if (address) {
            try {
                const checkRes = await fetch(`/api/article/${articleId}`, {
                    headers: { 'X-Wallet-Address': address },
                });
                const checkData = await checkRes.json();
                if (checkData.unlocked) {
                    setAlreadyPaid(true);
                    onPaymentSuccess();
                    return;
                }
            } catch {
                // Continue with payment
            }
        }

        try {
            setStep('processing');
            const hash = await sendUSDC(authorWallet, price);

            setStep('verifying');

            // Quick verification - just submit and trust
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txHash: hash,
                    articleId,
                    buyerAddress: address,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment verification failed');
            }

            setStep('success');
            setTimeout(() => onPaymentSuccess(), 500); // Faster redirect
        } catch (err) {
            console.error('Payment error:', err);
            setStep('error');
            setError(err instanceof Error ? err.message : 'Payment failed');
        }
    };

    const isProcessing = ['connecting', 'confirming', 'processing', 'verifying'].includes(step);

    // If checking payment status
    if (checkingPayment) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
        );
    }

    // If already paid, redirect will happen
    if (alreadyPaid) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-gray-600">Already unlocked!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Blurred placeholder - Anti-scraping: use CSS blur + no real content */}
            <div className="relative overflow-hidden rounded-xl select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}>
                <div className="blur-md pointer-events-none opacity-40" aria-hidden="true">
                    <div className="prose-elegant">
                        <p>
                            ████████ ██████ ███ ██████████ ███████████ ██████ ███████ ██████ ███
                            █████████ ██████████ ███████ ██████ ███ ██████████ ███████████.
                        </p>
                        <p>
                            ███████ ██████ █████ █████████ ██████ ███ ██████ ██████████ █████
                            ██████████ █████████ ██████ ███████████ ██████ █████ ███.
                        </p>
                        <h2>████████ █████</h2>
                        <p>
                            █████ ██████ ██████████ █████ ██████ ███████ ██████ ████████ ███████
                            █████████████ ███████ ████████ █████████.
                        </p>
                    </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/80 to-white" />

                {/* Unlock card */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl">
                        {step === 'success' ? (
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Unlocked!</h3>
                                <p className="text-sm text-gray-500">Loading content...</p>
                            </div>
                        ) : step === 'error' ? (
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Failed</h3>
                                <p className="text-sm text-gray-500 mb-4">{error}</p>
                                <button
                                    onClick={() => { setStep('idle'); setError(null); }}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : isProcessing ? (
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {step === 'connecting' && 'Connecting...'}
                                    {step === 'processing' && 'Confirm in Wallet'}
                                    {step === 'verifying' && 'Verifying...'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {step === 'processing' && 'Please confirm the transaction in your wallet'}
                                    {step === 'verifying' && 'Almost done...'}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                {/* Lock icon */}
                                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-gray-600" />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Premium Content
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Unlock this article for ${price.toFixed(2)} USDC
                                </p>

                                {/* Payment info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400">Author</span>
                                        <span className="text-sm text-gray-700">{authorName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400">Wallet</span>
                                        <span className="text-xs text-gray-500 font-mono">{formatAddress(authorWallet)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-400">Network</span>
                                        <span className="text-xs text-gray-500">Ethereum Sepolia</span>
                                    </div>
                                </div>

                                {/* Unlock Button */}
                                <button
                                    onClick={handleUnlock}
                                    className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg
                             hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    {!isConnected ? (
                                        <>
                                            <Wallet className="w-4 h-4" />
                                            Connect to Unlock
                                        </>
                                    ) : !isCorrectNetwork ? (
                                        'Switch to Sepolia'
                                    ) : (
                                        `Unlock for $${price.toFixed(2)}`
                                    )}
                                </button>

                                <p className="mt-4 text-xs text-gray-400">
                                    Payment goes directly to the author
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
