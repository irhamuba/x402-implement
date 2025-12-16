import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyUSDCTransfer } from '@/lib/blockchain';
import { X402_HEADERS } from '@/lib/config';

interface VerifyPaymentRequest {
    txHash: string;
    articleId: string;
    buyerAddress: string;
}

/**
 * POST /api/verify-payment
 * 
 * Verifies a USDC payment on Ethereum Sepolia blockchain.
 * This is the "facilitator" endpoint in x402 terminology.
 * 
 * Security checks:
 * 1. Prevents replay attacks (same txHash)
 * 2. Prevents double payment (same user + article)
 * 3. Verifies on-chain that payment was made to correct recipient
 * 4. Verifies correct amount was transferred
 */
export async function POST(request: NextRequest) {
    try {
        const body: VerifyPaymentRequest = await request.json();
        const { txHash, articleId, buyerAddress } = body;

        // Validate input
        if (!txHash || !articleId || !buyerAddress) {
            return NextResponse.json(
                { error: 'Missing required fields: txHash, articleId, buyerAddress' },
                { status: 400 }
            );
        }

        // Check if user already purchased this article
        const alreadyPurchased = await db.hasUserPurchased(buyerAddress, articleId);
        if (alreadyPurchased) {
            return NextResponse.json({
                success: true,
                message: 'Already purchased - no payment needed',
                alreadyOwned: true,
            });
        }

        // Check for replay attack - has this txHash been used before?
        const existingOrder = await db.getOrderByTxHash(txHash);
        if (existingOrder) {
            // If it's the same buyer and article, just return success
            if (existingOrder.buyerAddress.toLowerCase() === buyerAddress.toLowerCase() &&
                existingOrder.articleId === articleId) {
                return NextResponse.json({
                    success: true,
                    message: 'Payment already verified',
                });
            }
            return NextResponse.json(
                { error: 'Transaction already used for payment (replay attack prevented)' },
                { status: 409 }
            );
        }

        // Get article and author details
        const article = await db.getArticleById(articleId);
        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        const author = await db.getAuthorById(article.authorId);
        if (!author) {
            return NextResponse.json(
                { error: 'Author not found' },
                { status: 500 }
            );
        }

        // Verify the transaction on blockchain
        console.log(`Verifying payment: ${txHash}`);
        console.log(`Expected recipient: ${author.walletAddress}`);
        console.log(`Expected amount: ${article.price} USDC`);

        const verification = await verifyUSDCTransfer(
            txHash,
            author.walletAddress,
            article.price
        );

        if (!verification.valid) {
            return NextResponse.json(
                {
                    error: 'Payment verification failed',
                    details: verification.error
                },
                { status: 400 }
            );
        }

        // Payment verified! Save to orders database
        // Include authorId and articleTitle so stats persist even if article is deleted
        await db.addOrder({
            txHash,
            buyerAddress: buyerAddress.toLowerCase(), // Normalize
            articleId,
            authorId: article.authorId, // Store author for persistent stats
            articleTitle: article.title, // Store title for display
            status: 'VERIFIED',
            timestamp: new Date().toISOString(),
            amount: article.price,
        });

        // Create settlement response following x402 pattern
        const settlementResponse = {
            success: true,
            txHash,
            articleId,
            amount: article.price,
            currency: 'USDC',
            network: 'ethereum-sepolia',
            blockNumber: verification.details?.blockNumber,
            timestamp: new Date().toISOString(),
        };

        const response = NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            settlement: settlementResponse,
            // Return unlocked article data immediately for realtime update
            // Include full author object to match the expected structure in ArticlePage
            article: {
                id: article.id,
                title: article.title,
                teaser: article.teaser,
                fullContent: article.fullContent,
                price: article.price,
                createdAt: article.createdAt,
                category: article.category,
                readTime: article.readTime,
                author: {
                    id: author.id,
                    name: author.name,
                    avatar: author.avatar,
                    bio: author.bio,
                    walletAddress: author.walletAddress,
                },
                unlocked: true,
                isAuthor: false,
            }
        });

        // Set x402 payment response header
        response.headers.set(
            X402_HEADERS.PAYMENT_RESPONSE,
            Buffer.from(JSON.stringify(settlementResponse)).toString('base64')
        );

        return response;
    } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error during verification' },
            { status: 500 }
        );
    }
}
