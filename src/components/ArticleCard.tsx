'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
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
    index?: number;
}

export function ArticleCard({
    id,
    title,
    teaser,
    price,
    createdAt,
    category,
    readTime,
    author,
}: ArticleCardProps) {
    return (
        <Link href={`/article/${id}`}>
            <article className="group h-full p-6 bg-white border border-slate-200 rounded-2xl 
                          hover:border-slate-300 hover:shadow-lg transition-all duration-200">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            {category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {readTime}
                        </span>
                    </div>
                    <span className="px-3 py-1.5 bg-slate-900 text-white text-sm font-bold rounded-lg">
                        ${price.toFixed(2)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 
                       transition-colors line-clamp-2">
                    {title}
                </h3>

                {/* Teaser */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5">
                    {teaser}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {author ? (
                        <div className="flex items-center gap-3">
                            <Image
                                src={author.avatar}
                                alt={author.name}
                                width={32}
                                height={32}
                                className="rounded-full bg-slate-100"
                            />
                            <div>
                                <span className="text-sm font-medium text-slate-800">{author.name}</span>
                                <p className="text-xs text-slate-500">{formatDate(createdAt)}</p>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-slate-500">{formatDate(createdAt)}</span>
                    )}

                    <div className="flex items-center gap-1 text-sm font-medium text-blue-600 
                          opacity-0 group-hover:opacity-100 transition-opacity">
                        Read
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </article>
        </Link>
    );
}
