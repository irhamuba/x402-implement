'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils';
import { ArrowLeft, Save, Wallet, User, FileText, CheckCircle } from 'lucide-react';

interface AuthorProfile {
    id: string;
    name: string;
    walletAddress: string;
    bio: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { address, isConnected, connect } = useWallet();

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [paymentAddress, setPaymentAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) return;

            setLoading(true);
            try {
                const res = await fetch('/api/author/profile', {
                    headers: { 'X-Wallet-Address': address },
                });
                const data = await res.json();

                if (data.author) {
                    setName(data.author.name || '');
                    setBio(data.author.bio || '');
                    setPaymentAddress(data.author.walletAddress || address);
                } else {
                    // Default to connected wallet
                    setPaymentAddress(address);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [address]);

    const handleSave = async () => {
        if (!address || !name || !paymentAddress) {
            setError('Name and payment address are required');
            return;
        }

        // Validate address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(paymentAddress)) {
            setError('Invalid wallet address format');
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const res = await fetch('/api/author/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wallet-Address': address,
                },
                body: JSON.stringify({ name, bio, paymentAddress }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save profile');
            }

            setSaved(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h1>
                    <p className="text-gray-500 mb-6">Connect your wallet to manage your profile.</p>
                    <button onClick={connect} className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg">
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    if (saved) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Profile Saved!</h1>
                    <p className="text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Connected: {formatAddress(address!)}
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />
                            Bio (optional)
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell readers about yourself..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>

                    {/* Payment Address */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Wallet className="w-4 h-4 inline mr-2" />
                            Payment Address
                        </label>
                        <input
                            type="text"
                            value={paymentAddress}
                            onChange={(e) => setPaymentAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                            This is where you&apos;ll receive USDC payments from readers. Make sure it&apos;s correct!
                        </p>
                    </div>

                    {/* Network Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            Payments are received on <strong>Ethereum Sepolia</strong> network in <strong>USDC</strong>.
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !name || !paymentAddress}
                        className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg
                       hover:bg-gray-800 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
