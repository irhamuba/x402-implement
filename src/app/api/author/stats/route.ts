import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/author/stats
 * Get author statistics including earnings
 * Stats persist even after articles are deleted
 */
export async function GET(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const author = await db.getAuthorByWallet(walletAddress);

        if (!author) {
            return NextResponse.json({
                totalEarnings: 0,
                totalSales: 0,
                articles: 0,
                recentSales: []
            });
        }

        // Get author's current articles (for article count)
        const articles = await db.getArticlesByAuthor(author.id);

        // Get ALL orders for this author (including deleted articles)
        // This uses authorId stored in order, so it persists after article deletion
        const allOrders = await db.getOrders();
        const authorOrders = allOrders.filter(order => {
            // Check if order belongs to this author
            // First check authorId in order (new orders)
            if (order.authorId === author.id) {
                return order.status === 'VERIFIED';
            }
            // Fallback for old orders without authorId: check if article exists
            const article = articles.find(a => a.id === order.articleId);
            return article && order.status === 'VERIFIED';
        });

        // Calculate total earnings (from ALL sales, including deleted articles)
        const totalEarnings = authorOrders.reduce((sum, order) => sum + order.amount, 0);

        // Get recent sales with article info (max 5 for display)
        const recentSales = authorOrders
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5) // Only show 5 most recent
            .map(order => {
                // Use stored articleTitle if available, otherwise try to find article
                const article = articles.find(a => a.id === order.articleId);
                return {
                    txHash: order.txHash,
                    amount: order.amount,
                    timestamp: order.timestamp,
                    articleTitle: order.articleTitle || article?.title || 'Deleted Article',
                    buyerAddress: order.buyerAddress,
                };
            });

        return NextResponse.json({
            totalEarnings,
            totalSales: authorOrders.length, // Total count of ALL sales
            articles: articles.length, // Only current (non-deleted) articles
            recentSales, // Only 5 most recent for display
        });
    } catch (error) {
        console.error('Error getting author stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
