import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/author/profile
 * Get author profile by wallet address
 */
export async function GET(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const author = await db.getAuthorByWallet(walletAddress);

        if (!author) {
            return NextResponse.json({ author: null, isRegistered: false });
        }

        return NextResponse.json({ author, isRegistered: true });
    } catch (error) {
        console.error('Error getting author profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/author/profile
 * Create or update author profile
 */
export async function POST(request: NextRequest) {
    try {
        const walletAddress = request.headers.get('X-Wallet-Address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
        }

        const body = await request.json();
        const { name, bio, paymentAddress } = body;

        if (!name || !paymentAddress) {
            return NextResponse.json({ error: 'Name and payment address required' }, { status: 400 });
        }

        // Check if author exists
        const existingAuthor = await db.getAuthorByWallet(walletAddress);

        if (existingAuthor) {
            // Update existing author
            await db.updateAuthor(existingAuthor.id, {
                name,
                bio: bio || '',
                walletAddress: paymentAddress, // Payment address can be different from login wallet
            });
        } else {
            // Create new author with random local avatar
            const avatarNumber = Math.floor(Math.random() * 8) + 1;
            const newAuthor = {
                id: `auth_${Date.now()}`,
                name,
                walletAddress: paymentAddress,
                role: 'author',
                bio: bio || '',
                avatar: `/avatars/avatar-${avatarNumber}.svg`,
                loginWallet: walletAddress,
            };
            await db.addAuthor(newAuthor);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving author profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
