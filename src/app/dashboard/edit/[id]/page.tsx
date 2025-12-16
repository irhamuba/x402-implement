'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import {
  ArrowLeft,
  Save,
  Eye,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  HelpCircle,
  CheckCircle,
  Wallet,
  Trash2
} from 'lucide-react';

const CATEGORIES = ['Analysis', 'Tutorial', 'Deep Dive', 'News', 'Opinion', 'Research'];

interface Article {
  id: string;
  title: string;
  teaser: string;
  fullContent: string;
  price: number;
  category: string;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const { address, isConnected, connect } = useWallet();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [teaser, setTeaser] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('0.50');
  const [category, setCategory] = useState('Analysis');

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAuthor, setNotAuthor] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load article data
  useEffect(() => {
    const loadArticle = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/article/${articleId}`, {
          headers: { 'X-Wallet-Address': address },
        });

        const data = await response.json();

        if (!data.isAuthor) {
          setNotAuthor(true);
          setLoading(false);
          return;
        }

        setTitle(data.title);
        setTeaser(data.teaser);
        setContent(data.fullContent || '');
        setPrice(data.price.toString());
        setCategory(data.category);
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, address]);

  // Insert formatting
  const insertFormat = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    const newContent =
      content.substring(0, start) +
      before + selected + after +
      content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSave = async () => {
    if (!address) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!teaser.trim()) {
      setError('Teaser is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/author/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': address,
        },
        body: JSON.stringify({
          title,
          teaser,
          fullContent: content,
          price: parseFloat(price),
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      setTimeout(() => {
        router.push(`/article/${articleId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!address) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/author/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'X-Wallet-Address': address,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      // Redirect to dashboard after delete
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h1>
          <p className="text-gray-500 mb-6">Connect your wallet to edit articles.</p>
          <button onClick={connect} className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (notAuthor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Not Authorized</h1>
          <p className="text-gray-500 mb-6">You can only edit your own articles.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Saved!</h1>
          <p className="text-gray-500">Redirecting to article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href={`/article/${articleId}`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Article
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                         ${showPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-sm 
                         font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full text-3xl font-semibold text-gray-900 placeholder-gray-300 
                           outline-none border-none"
              />
            </div>

            {/* Teaser */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                Free Preview (Teaser)
              </label>
              <textarea
                value={teaser}
                onChange={(e) => setTeaser(e.target.value)}
                placeholder="Write a compelling teaser..."
                rows={3}
                className="w-full text-gray-600 placeholder-gray-300 outline-none border 
                           border-gray-200 rounded-lg p-4 resize-none focus:border-blue-500"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg">
              <button onClick={() => insertFormat('**', '**')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('*', '*')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('\n## ', '')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Heading">
                <Heading2 className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('\n- ', '')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="List">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('\n> ', '')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Quote">
                <Quote className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('[', '](url)')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Link">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button onClick={() => insertFormat('\n![alt text](', ')')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded" title="Image">
                <ImageIcon className="w-4 h-4" />
              </button>
              <div className="flex-1" />
              <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600" title="Markdown Help">
                <HelpCircle className="w-4 h-4" />
              </a>
            </div>

            {/* Premium Content */}
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                Premium Content (Paid)
              </label>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your premium content here using Markdown..."
                rows={15}
                className="w-full font-mono text-sm text-gray-700 placeholder-gray-300 outline-none 
                           border border-gray-200 rounded-lg p-4 resize-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-medium text-gray-900 mb-4">Article Settings</h3>

              {/* Price */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Price (USDC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                             bg-red-50 text-red-600 text-sm font-medium rounded-lg 
                             hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Article
                </button>
              </div>
            </div>

            {/* Preview Card */}
            {showPreview && title && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-3">Preview</h3>
                <div className="space-y-2">
                  <span className="text-xs text-blue-600 font-medium">{category}</span>
                  <h4 className="font-semibold text-gray-900">{title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{teaser}</p>
                  <p className="text-sm font-medium text-gray-900">${parseFloat(price || '0').toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Article?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone. The article will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 
                           font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium 
                           rounded-lg hover:bg-red-700 disabled:opacity-50 
                           flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
