import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/author/articles
 * Get all articles by author (wallet address)
 */
export async function GET(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const author = await db.getAuthorByWallet(walletAddress);

        if (!author) {
            return NextResponse.json({ articles: [] });
        }

        const articles = await db.getArticlesByAuthor(author.id);

        return NextResponse.json({ articles });
    } catch (error) {
        console.error('Error getting author articles:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/author/articles
 * Create a new article
 */
export async function POST(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const author = await db.getAuthorByWallet(walletAddress);

        if (!author) {
            return NextResponse.json({ error: 'Author not registered. Please set up your profile first.' }, { status: 403 });
        }

        const body = await request.json();
        const { title, teaser, fullContent, price, category, coverImage } = body;

        // Validation
        if (!title || !teaser || !fullContent || price === undefined) {
            return NextResponse.json({ error: 'Title, teaser, content, and price are required' }, { status: 400 });
        }

        if (price < 0) {
            return NextResponse.json({ error: 'Price must be positive' }, { status: 400 });
        }

        // Estimate read time (200 words per minute)
        const wordCount = fullContent.split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        const newArticle = {
            id: `art_${Date.now()}`,
            authorId: author.id,
            title,
            teaser,
            fullContent,
            price: parseFloat(price),
            createdAt: new Date().toISOString(),
            category: category || 'Article',
            readTime: `${readTime} min`,
            coverImage: coverImage || null,
        };

        await db.addArticle(newArticle);

        return NextResponse.json({ success: true, article: newArticle });
    } catch (error) {
        console.error('Error creating article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
