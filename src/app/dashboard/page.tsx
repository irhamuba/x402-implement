'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { formatDate, formatAddress } from '@/lib/utils';
import {
    PenSquare,
    Settings,
    FileText,
    Wallet,
    Plus,
    ArrowRight,
    DollarSign,
    Eye,
    TrendingUp,
    Bell,
    ExternalLink
} from 'lucide-react';

interface AuthorProfile {
    id: string;
    name: string;
    walletAddress: string;
    bio: string;
    avatar: string;
}

interface Article {
    id: string;
    title: string;
    teaser: string;
    price: number;
    createdAt: string;
    category: string;
    readTime: string;
}

interface RecentSale {
    txHash: string;
    amount: number;
    timestamp: string;
    articleTitle: string;
    buyerAddress: string;
}

interface Stats {
    totalEarnings: number;
    totalSales: number;
    articles: number;
    recentSales: RecentSale[];
}

interface NewSaleEvent {
    type: 'new_sale';
    sale: RecentSale;
    totalEarnings: number;
    totalSales: number;
}

export default function DashboardPage() {
    const { address, isConnected, connect } = useWallet();
    const [profile, setProfile] = useState<AuthorProfile | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newSaleNotification, setNewSaleNotification] = useState<RecentSale | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            if (!address) return;

            setLoading(true);
            try {
                // Fetch profile
                const profileRes = await fetch('/api/author/profile', {
                    headers: { 'X-Wallet-Address': address },
                });
                const profileData = await profileRes.json();

                setIsRegistered(profileData.isRegistered);
                setProfile(profileData.author);

                if (profileData.isRegistered) {
                    // Fetch articles
                    const articlesRes = await fetch('/api/author/articles', {
                        headers: { 'X-Wallet-Address': address },
                    });
                    const articlesData = await articlesRes.json();
                    setArticles(articlesData.articles || []);

                    // Fetch stats
                    const statsRes = await fetch('/api/author/stats', {
                        headers: { 'X-Wallet-Address': address },
                    });
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [address]);

    // Setup real-time updates via SSE
    useEffect(() => {
        if (!address || !isRegistered) return;

        const setupSSE = () => {
            const eventSource = new EventSource(`/api/author/events`, {
                withCredentials: false,
            });

            // We need to send headers differently with SSE
            // For now, we'll poll instead since SSE doesn't support custom headers easily

            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'new_sale') {
                        const saleData = data as NewSaleEvent;

                        // Update stats
                        setStats(prev => prev ? {
                            ...prev,
                            totalEarnings: saleData.totalEarnings,
                            totalSales: saleData.totalSales,
                            recentSales: [saleData.sale, ...prev.recentSales.slice(0, 9)],
                        } : null);

                        // Show notification
                        setNewSaleNotification(saleData.sale);
                        setTimeout(() => setNewSaleNotification(null), 5000);
                    }
                } catch (e) {
                    // Ignore parse errors for heartbeat
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                // Reconnect after 5 seconds
                setTimeout(setupSSE, 5000);
            };
        };

        // Use polling instead of SSE for simplicity with headers
        const pollStats = async () => {
            try {
                const statsRes = await fetch('/api/author/stats', {
                    headers: { 'X-Wallet-Address': address },
                });
                const newStats = await statsRes.json();

                // Check for new sales
                if (stats && newStats.totalSales > stats.totalSales) {
                    const newSale = newStats.recentSales[0];
                    if (newSale) {
                        setNewSaleNotification(newSale);
                        setTimeout(() => setNewSaleNotification(null), 5000);
                    }
                }

                setStats(newStats);
            } catch (error) {
                console.error('Error polling stats:', error);
            }
        };

        const interval = setInterval(pollStats, 5000); // Poll every 5 seconds

        return () => {
            clearInterval(interval);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [address, isRegistered, stats]);

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <PenSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Author Dashboard</h1>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Connect your wallet to publish articles and manage your content.
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                        <Settings className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Set Up Your Profile</h1>
                    <p className="text-gray-500 mb-6">
                        Before publishing, you need to set up your author profile and payment address.
                    </p>
                    <Link
                        href="/dashboard/settings"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white 
                       font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Set Up Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            {/* New Sale Notification */}
            {newSaleNotification && (
                <div className="fixed top-20 right-4 z-50 animate-pulse">
                    <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg max-w-sm">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5" />
                            <div>
                                <p className="font-medium">New Sale! 🎉</p>
                                <p className="text-sm opacity-90">
                                    +${newSaleNotification.amount.toFixed(2)} for &quot;{newSaleNotification.articleTitle}&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome, {profile?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/settings"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/dashboard/write"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white 
                         font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Article
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-500">Total Earnings</span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">
                            ${stats?.totalEarnings?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">USDC on Sepolia</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-gray-500">Total Sales</span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">
                            {stats?.totalSales || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Articles sold</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-gray-500">Articles</span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{articles.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Published</p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Wallet className="w-5 h-5 text-orange-500" />
                            <span className="text-sm text-gray-500">Payment Address</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {formatAddress(profile?.walletAddress || '')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Receiving USDC</p>
                    </div>
                </div>

                {/* Recent Sales */}
                {stats && stats.recentSales.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 mb-8">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="font-medium text-gray-900">Recent Sales</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {stats.recentSales.map((sale) => (
                                <div key={sale.txHash} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{sale.articleTitle}</p>
                                        <p className="text-xs text-gray-400">
                                            {formatAddress(sale.buyerAddress)} · {formatDate(sale.timestamp)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-green-600">
                                            +${sale.amount.toFixed(2)}
                                        </span>
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${sale.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Articles List */}
                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-medium text-gray-900">Your Articles</h2>
                    </div>

                    {articles.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {articles.map((article) => (
                                <div key={article.id} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-blue-600 font-medium">{article.category}</span>
                                                <span className="text-xs text-gray-300">·</span>
                                                <span className="text-xs text-gray-400">{article.readTime}</span>
                                            </div>
                                            <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">{article.teaser}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                <span>{formatDate(article.createdAt)}</span>
                                                <span className="font-medium text-gray-900">${article.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/article/${article.id}`}
                                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center">
                            <FileText className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-500 mb-4">No articles yet</p>
                            <Link
                                href="/dashboard/write"
                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                Write your first article
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
