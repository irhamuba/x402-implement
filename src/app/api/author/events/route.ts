import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/author/events
 * Server-Sent Events endpoint for real-time author updates
 */
export async function GET(request: NextRequest) {
    const walletAddress = request.headers.get('X-Wallet-Address');

    if (!walletAddress) {
        return new Response('Wallet address required', { status: 400 });
    }

    const author = await db.getAuthorByWallet(walletAddress);

    if (!author) {
        return new Response('Author not found', { status: 404 });
    }

    // Get initial state
    const articles = await db.getArticlesByAuthor(author.id);
    const articleIds = articles.map(a => a.id);

    let lastOrderCount = 0;
    const orders = await db.getOrders();
    lastOrderCount = orders.filter(o => articleIds.includes(o.articleId) && o.status === 'VERIFIED').length;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`));

            // Poll for new orders every 3 seconds
            const interval = setInterval(async () => {
                try {
                    const currentOrders = await db.getOrders();
                    const authorOrders = currentOrders.filter(o => articleIds.includes(o.articleId) && o.status === 'VERIFIED');

                    if (authorOrders.length > lastOrderCount) {
                        // New sale detected!
                        const newOrders = authorOrders.slice(lastOrderCount);
                        const totalEarnings = authorOrders.reduce((sum, o) => sum + o.amount, 0);

                        for (const order of newOrders) {
                            const article = articles.find(a => a.id === order.articleId);
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                                type: 'new_sale',
                                sale: {
                                    txHash: order.txHash,
                                    amount: order.amount,
                                    articleTitle: article?.title || 'Unknown',
                                    timestamp: order.timestamp,
                                },
                                totalEarnings,
                                totalSales: authorOrders.length,
                            })}\n\n`));
                        }

                        lastOrderCount = authorOrders.length;
                    }

                    // Send heartbeat
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`));
                } catch (error) {
                    console.error('SSE polling error:', error);
                }
            }, 3000);

            // Clean up on close
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
