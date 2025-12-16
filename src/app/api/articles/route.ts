import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/articles
 * 
 * Returns all articles with author info (for homepage listing)
 * Only shows articles where the author exists
 */
export async function GET() {
    try {
        const articles = await db.getArticles();
        const authors = await db.getAuthors();

        // Enrich articles with author info - only include articles with valid authors
        const enrichedArticles = articles
            .map(article => {
                const author = authors.find(a => a.id === article.authorId);
                // Skip articles with no valid author
                if (!author) return null;

                return {
                    id: article.id,
                    title: article.title,
                    teaser: article.teaser,
                    price: article.price,
                    createdAt: article.createdAt,
                    category: article.category,
                    readTime: article.readTime,
                    author: {
                        id: author.id,
                        name: author.name,
                        avatar: author.avatar,
                    },
                };
            })
            .filter(article => article !== null); // Remove null entries

        // Sort by date (newest first)
        enrichedArticles.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ articles: enrichedArticles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
}
