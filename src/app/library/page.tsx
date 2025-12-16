'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { formatDate, formatAddress } from '@/lib/utils';
import { BookOpen, Wallet, ArrowRight, ExternalLink, Library } from 'lucide-react';

interface Purchase {
    txHash: string;
    buyerAddress: string;
    articleId: string;
    status: string;
    timestamp: string;
    amount: number;
    article: {
        id: string;
        title: string;
        category: string;
        readTime: string;
        author: {
            id: string;
            name: string;
            avatar: string;
        } | null;
    };
}

export default function LibraryPage() {
    const { address, isConnected, connect } = useWallet();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPurchases = async () => {
            if (!address) return;

            setLoading(true);
            try {
                const response = await fetch('/api/user/purchases', {
                    headers: { 'X-Wallet-Address': address },
                });
                const data = await response.json();
                setPurchases(data.purchases || []);
            } catch (error) {
                console.error('Error fetching purchases:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, [address]);

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h1>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Connect your wallet to view your purchased articles.
                    </p>
                    <button
                        onClick={connect}
                        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg
                       hover:bg-gray-800 transition-colors"
                    >
                        Connect Wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Library className="w-5 h-5 text-gray-400" />
                        <h1 className="text-2xl font-semibold text-gray-900">My Library</h1>
                    </div>
                    <p className="text-sm text-gray-400">
                        Articles unlocked by {formatAddress(address!)}
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : purchases.length > 0 ? (
                    <div className="space-y-3">
                        {purchases.map((purchase) => (
                            <Link
                                key={purchase.txHash}
                                href={`/article/${purchase.article.id}`}
                                className="block p-5 bg-white border border-gray-100 rounded-xl 
                           hover:border-gray-200 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-blue-600 font-medium">
                                                {purchase.article.category}
                                            </span>
                                            <span className="text-xs text-gray-300">·</span>
                                            <span className="text-xs text-gray-400">{purchase.article.readTime}</span>
                                        </div>
                                        <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {purchase.article.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                            <span>By {purchase.article.author?.name}</span>
                                            <span>·</span>
                                            <span>{formatDate(purchase.timestamp)}</span>
                                            <span>·</span>
                                            <span>${purchase.amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                window.open(`https://sepolia.etherscan.io/tx/${purchase.txHash}`, '_blank');
                                            }}
                                            className="p-2 text-gray-300 hover:text-blue-600 transition-colors"
                                            title="View on Etherscan"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                        <h2 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h2>
                        <p className="text-gray-400 mb-6">Start exploring and unlock your first article.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                            Explore articles
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
