'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { PaywallOverlay } from '@/components/PaywallOverlay';
import { ArticleContent } from '@/components/ArticleContent';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Clock, CheckCircle, Share2, BookOpen, PenSquare, Trash2 } from 'lucide-react';

interface ArticleData {
    id: string;
    title: string;
    teaser: string;
    fullContent: string | null;
    price: number;
    createdAt: string;
    category: string;
    readTime: string;
    author: {
        id: string;
        name: string;
        avatar: string;
        bio?: string;
        walletAddress?: string;
    };
    unlocked: boolean;
    isAuthor?: boolean;
}

export default function ArticlePage() {
    const params = useParams();
    const articleId = params.id as string;
    const { address } = useWallet();

    const [article, setArticle] = useState<ArticleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticle = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const headers: HeadersInit = {};
            if (address) {
                headers['X-Wallet-Address'] = address;
            }

            const response = await fetch(`/api/article/${articleId}`, { headers });

            if (response.status === 404) {
                throw new Error('Article not found');
            }

            if (response.status >= 500) {
                throw new Error('Server error');
            }

            const data = await response.json();
            setArticle(data);
        } catch (err) {
            console.error('Error fetching article:', err);
            setError(err instanceof Error ? err.message : 'Failed to load article');
        } finally {
            setLoading(false);
        }
    }, [articleId, address]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    const handleShare = async () => {
        if (navigator.share && article) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.teaser,
                    url: window.location.href,
                });
            } catch {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                    {/* Back */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Link>

                        {/* Author Actions */}
                        {article.isAuthor && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/dashboard/edit/${article.id}`}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 
                             text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <PenSquare className="w-4 h-4" />
                                    Edit Article
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Author Badge */}
                    {article.isAuthor && (
                        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 
                            text-xs font-medium rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Your Article
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            {article.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatDate(article.createdAt)}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 leading-tight mb-6">
                        {article.title}
                    </h1>

                    {/* Author & Price */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Image
                                src={article.author.avatar}
                                alt={article.author.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
                                {article.author.bio && (
                                    <p className="text-xs text-gray-400">{article.author.bio}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Price */}
                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg">
                                <span className="text-sm font-semibold text-gray-900">
                                    ${article.price.toFixed(2)}
                                </span>
                                {article.unlocked && (
                                    <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                                )}
                            </div>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                {/* Teaser */}
                <p className="text-lg text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-100">
                    {article.teaser}
                </p>

                {/* Full Content or Paywall */}
                {article.unlocked && article.fullContent ? (
                    <ArticleContent content={article.fullContent} />
                ) : (
                    <PaywallOverlay
                        price={article.price}
                        authorWallet={article.author.walletAddress!}
                        authorName={article.author.name}
                        articleId={article.id}
                        onPaymentSuccess={fetchArticle}
                    />
                )}
            </div>
        </div>
    );
}
