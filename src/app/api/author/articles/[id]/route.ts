import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * PUT /api/author/articles/[id]
 * Update an existing article (author only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: articleId } = await params;
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // Get article
        const article = await db.getArticleById(articleId);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        // Get author and verify ownership
        const author = await db.getAuthorByWallet(walletAddress);
        if (!author || author.id !== article.authorId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Get update data
        const body = await request.json();
        const { title, teaser, fullContent, price, category } = body;

        // Update article
        await db.updateArticle(articleId, {
            title: title || article.title,
            teaser: teaser || article.teaser,
            fullContent: fullContent || article.fullContent,
            price: price !== undefined ? price : article.price,
            category: category || article.category,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/author/articles/[id]
 * Delete an article (author only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: articleId } = await params;
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        // Get article
        const article = await db.getArticleById(articleId);
        if (!article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        // Get author and verify ownership
        const author = await db.getAuthorByWallet(walletAddress);
        if (!author || author.id !== article.authorId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Delete article
        await db.deleteArticle(articleId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting article:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
