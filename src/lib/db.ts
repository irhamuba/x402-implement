import { promises as fs } from 'fs';
import path from 'path';

// Type definitions
export interface Author {
    id: string;
    name: string;
    walletAddress: string;
    role: string;
    bio: string;
    avatar: string;
    loginWallet?: string; // Wallet used for login (may differ from payment wallet)
}

export interface Article {
    id: string;
    authorId: string;
    title: string;
    teaser: string;
    fullContent: string;
    price: number;
    createdAt: string;
    category: string;
    readTime: string;
    coverImage?: string | null;
}

export interface Order {
    txHash: string;
    buyerAddress: string;
    articleId: string;
    authorId: string; // Store authorId so earnings persist after article deletion
    articleTitle: string; // Store title for display after article deletion
    status: string;
    timestamp: string;
    amount: number;
}

interface AuthorsDB {
    authors: Author[];
}

interface ArticlesDB {
    articles: Article[];
}

interface OrdersDB {
    orders: Order[];
}

// Get the data directory path
const dataDir = path.join(process.cwd(), 'data');

// Default empty data structures
const defaultData: Record<string, unknown> = {
    'authors.json': { authors: [] },
    'articles.json': { articles: [] },
    'orders.json': { orders: [] }
};

// Database helper class
class Database {
    private async ensureDataDir(): Promise<void> {
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }
    }

    private async readJSON<T>(filename: string): Promise<T> {
        await this.ensureDataDir();
        const filePath = path.join(dataDir, filename);

        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch {
            // File doesn't exist, create with default data
            const defaultContent = defaultData[filename] || {};
            await this.writeJSON(filename, defaultContent);
            return defaultContent as T;
        }
    }

    private async writeJSON<T>(filename: string, data: T): Promise<void> {
        await this.ensureDataDir();
        const filePath = path.join(dataDir, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    // Authors
    async getAuthors(): Promise<Author[]> {
        const db = await this.readJSON<AuthorsDB>('authors.json');
        return db.authors;
    }

    async getAuthorById(id: string): Promise<Author | undefined> {
        const authors = await this.getAuthors();
        return authors.find(a => a.id === id);
    }

    async getAuthorByWallet(walletAddress: string): Promise<Author | undefined> {
        const authors = await this.getAuthors();
        // Check both walletAddress and loginWallet
        return authors.find(a =>
            a.walletAddress.toLowerCase() === walletAddress.toLowerCase() ||
            (a.loginWallet && a.loginWallet.toLowerCase() === walletAddress.toLowerCase())
        );
    }

    async addAuthor(author: Author): Promise<void> {
        const db = await this.readJSON<AuthorsDB>('authors.json');
        db.authors.push(author);
        await this.writeJSON('authors.json', db);
    }

    async updateAuthor(id: string, updates: Partial<Author>): Promise<void> {
        const db = await this.readJSON<AuthorsDB>('authors.json');
        const index = db.authors.findIndex(a => a.id === id);
        if (index !== -1) {
            db.authors[index] = { ...db.authors[index], ...updates };
            await this.writeJSON('authors.json', db);
        }
    }

    // Articles
    async getArticles(): Promise<Article[]> {
        const db = await this.readJSON<ArticlesDB>('articles.json');
        return db.articles;
    }

    async getArticleById(id: string): Promise<Article | undefined> {
        const articles = await this.getArticles();
        return articles.find(a => a.id === id);
    }

    async getArticlesByAuthor(authorId: string): Promise<Article[]> {
        const articles = await this.getArticles();
        return articles.filter(a => a.authorId === authorId);
    }

    async addArticle(article: Article): Promise<void> {
        const db = await this.readJSON<ArticlesDB>('articles.json');
        db.articles.push(article);
        await this.writeJSON('articles.json', db);
    }

    async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
        const db = await this.readJSON<ArticlesDB>('articles.json');
        const index = db.articles.findIndex(a => a.id === id);
        if (index !== -1) {
            db.articles[index] = { ...db.articles[index], ...updates };
            await this.writeJSON('articles.json', db);
        }
    }

    async deleteArticle(id: string): Promise<void> {
        const db = await this.readJSON<ArticlesDB>('articles.json');
        db.articles = db.articles.filter(a => a.id !== id);
        await this.writeJSON('articles.json', db);
    }

    // Orders
    async getOrders(): Promise<Order[]> {
        const db = await this.readJSON<OrdersDB>('orders.json');
        return db.orders;
    }

    async getOrderByTxHash(txHash: string): Promise<Order | undefined> {
        const orders = await this.getOrders();
        return orders.find(o => o.txHash.toLowerCase() === txHash.toLowerCase());
    }

    async hasUserPurchased(buyerAddress: string, articleId: string): Promise<boolean> {
        const orders = await this.getOrders();
        return orders.some(
            o => o.buyerAddress.toLowerCase() === buyerAddress.toLowerCase()
                && o.articleId === articleId
                && o.status === 'VERIFIED'
        );
    }

    async addOrder(order: Order): Promise<void> {
        const db = await this.readJSON<OrdersDB>('orders.json');
        db.orders.push(order);
        await this.writeJSON('orders.json', db);
    }

    async getUserPurchases(buyerAddress: string): Promise<Order[]> {
        const orders = await this.getOrders();
        return orders.filter(
            o => o.buyerAddress.toLowerCase() === buyerAddress.toLowerCase() && o.status === 'VERIFIED'
        );
    }

    async getArticleOrders(articleId: string): Promise<Order[]> {
        const orders = await this.getOrders();
        return orders.filter(o => o.articleId === articleId && o.status === 'VERIFIED');
    }
}

// Export singleton instance
export const db = new Database();
