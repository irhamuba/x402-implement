'use client';

import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { Newspaper, Sparkles, Wallet, CreditCard, BookOpen } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  teaser: string;
  price: number;
  createdAt: string;
  category: string;
  readTime: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  } | null;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 
                            rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by x402 Protocol
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
              Independent journalism,
              <br />
              <span className="text-slate-500">paid per article.</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              No subscriptions. No middlemen. Pay only for what you read,
              directly to the author via blockchain.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Latest Articles
              </h2>
              <p className="text-sm text-slate-500">
                Premium content from independent writers
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-52 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  {...article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
              <Newspaper className="w-14 h-14 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No articles yet</h3>
              <p className="text-slate-500">Be the first to publish!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How It Works
            </h2>
            <p className="text-slate-600">
              Simple, transparent, and direct payments to authors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Browse',
                desc: 'Explore articles from independent writers',
                icon: BookOpen,
                color: 'bg-blue-100 text-blue-600'
              },
              {
                step: '02',
                title: 'Connect',
                desc: 'Link your wallet with one click',
                icon: Wallet,
                color: 'bg-purple-100 text-purple-600'
              },
              {
                step: '03',
                title: 'Pay',
                desc: 'Send USDC directly to the author',
                icon: CreditCard,
                color: 'bg-green-100 text-green-600'
              },
              {
                step: '04',
                title: 'Read',
                desc: 'Access unlocks instantly',
                icon: Sparkles,
                color: 'bg-amber-100 text-amber-600'
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${item.color} 
                                flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-blue-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
