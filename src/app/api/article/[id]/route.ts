import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { X402_HEADERS } from '@/lib/config';

// Simple in-memory cache for faster payment verification
const paymentCache = new Map<string, { verified: boolean; expiry: number }>();
const CACHE_TTL = 60000; // 1 minute cache

function getCacheKey(walletAddress: string, articleId: string): string {
    return `${walletAddress.toLowerCase()}_${articleId}`;
}

function checkCache(walletAddress: string, articleId: string): boolean | null {
    const key = getCacheKey(walletAddress, articleId);
    const cached = paymentCache.get(key);

    if (cached && cached.expiry > Date.now()) {
        return cached.verified;
    }

    if (cached) {
        paymentCache.delete(key);
    }

    return null;
}

function setCache(walletAddress: string, articleId: string, verified: boolean): void {
    const key = getCacheKey(walletAddress, articleId);
    paymentCache.set(key, {
        verified,
        expiry: Date.now() + CACHE_TTL,
    });
}

function generateContentToken(): string {
    return Math.random().toString(36).substring(2, 15);
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: articleId } = await params;
        const walletAddress = request.headers.get(X402_HEADERS.WALLET_ADDRESS);
        const userAgent = request.headers.get('User-Agent') || '';

        // Anti-bot check (basic)
        const suspiciousUA = /bot|crawler|spider|scraper|curl|wget|python|axios/i.test(userAgent);

        // Get article
        const article = await db.getArticleById(articleId);

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // Get author info
        const author = await db.getAuthorById(article.authorId);

        if (!author) {
            return NextResponse.json(
                { error: 'Author not found' },
                { status: 404 }
            );
        }

        // Check if current user is the author (free access for authors)
        let isAuthor = false;
        if (walletAddress) {
            const normalizedWallet = walletAddress.toLowerCase();
            isAuthor = author.walletAddress.toLowerCase() === normalizedWallet ||
                (author.loginWallet?.toLowerCase() === normalizedWallet);
        }

        // Check if user has paid (with caching for speed)
        let hasPaid = false;

        if (walletAddress && !isAuthor) {
            // Check cache first (faster)
            const cachedResult = checkCache(walletAddress, articleId);

            if (cachedResult !== null) {
                hasPaid = cachedResult;
            } else {
                // Check database
                hasPaid = await db.hasUserPurchased(walletAddress, articleId);
                // Cache the result
                setCache(walletAddress, articleId, hasPaid);
            }
        }

        // Build response headers
        const headers = new Headers();
        headers.set('Cache-Control', 'private, no-store, max-age=0');
        headers.set('X-Content-Token', generateContentToken());
        headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

        // Author gets free access OR user has paid
        if ((isAuthor || hasPaid) && !suspiciousUA) {
            headers.set(X402_HEADERS.PAYMENT_RESPONSE, JSON.stringify({
                status: isAuthor ? 'author' : 'paid',
                articleId,
            }));

            return NextResponse.json(
                {
                    id: article.id,
                    authorId: article.authorId,
                    title: article.title,
                    teaser: article.teaser,
                    fullContent: article.fullContent, // Premium content
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
                    isAuthor, // Flag to show edit button
                },
                { headers }
            );
        }

        // User has NOT paid - return teaser only
        const paymentRequirements = {
            scheme: 'exact',
            network: 'ethereum-sepolia',
            amount: article.price,
            currency: 'USDC',
            recipient: author.walletAddress,
            description: `Unlock: ${article.title}`,
        };

        headers.set(
            X402_HEADERS.PAYMENT_REQUIRED,
            JSON.stringify(paymentRequirements)
        );

        return NextResponse.json(
            {
                id: article.id,
                authorId: article.authorId,
                title: article.title,
                teaser: article.teaser,
                fullContent: null,
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
                unlocked: false,
                isAuthor: false,
                paymentRequirements,
            },
            {
                status: 402,
                headers
            }
        );
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export function invalidatePaymentCache(walletAddress: string, articleId: string): void {
    const key = getCacheKey(walletAddress, articleId);
    paymentCache.delete(key);
}
