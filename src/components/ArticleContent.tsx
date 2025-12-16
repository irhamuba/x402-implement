'use client';

import ReactMarkdown from 'react-markdown';

interface ArticleContentProps {
    content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
    return (
        <div className="prose-elegant">
            <ReactMarkdown>{content}</ReactMarkdown>
        </div>
    );
}
