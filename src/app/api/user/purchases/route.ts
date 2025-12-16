import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/purchases
 * 
 * Returns all articles purchased by a wallet address
 */
export async function GET(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address required' },
                { status: 400 }
            );
        }

        const purchases = await db.getUserPurchases(walletAddress);
        const articles = await db.getArticles();
        const authors = await db.getAuthors();

        // Get full article details for each purchase
        const purchasedArticles = purchases.map(purchase => {
            const article = articles.find(a => a.id === purchase.articleId);
            if (!article) return null;

            const author = authors.find(a => a.id === article.authorId);

            return {
                ...purchase,
                article: {
                    id: article.id,
                    title: article.title,
                    category: article.category,
                    readTime: article.readTime,
                    author: author ? {
                        id: author.id,
                        name: author.name,
                        avatar: author.avatar,
                    } : null,
                },
            };
        }).filter(Boolean);

        return NextResponse.json({ purchases: purchasedArticles });
    } catch (error) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchases' },
            { status: 500 }
        );
    }
}
