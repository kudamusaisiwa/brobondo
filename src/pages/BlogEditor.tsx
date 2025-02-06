import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocument } from '../hooks/useDocument';
import { useAuthStore } from '../store/authStore';
import { BlogPost } from '../types/blog';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileImage, Save, ArrowLeft } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isNewPost = id === 'new';
  
  const { data: existingPost, loading } = useDocument<BlogPost>(
    isNewPost ? null : `blog_posts/${id}`
  );

  const initialPost: Partial<BlogPost> & { tags: string[]; seoKeywords: string[] } = {
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft' as const,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: []
  };

  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (existingPost && !isNewPost) {
      setPost(existingPost);
    }
  }, [existingPost, isNewPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to save a post');
      return;
    }

    if (!post.title || !post.content || !post.excerpt || !post.category) {
      alert('Please fill in all required fields (title, content, excerpt, and category)');
      return;
    }
    
    try {
      const postId = isNewPost ? doc(db, 'blog_posts').id : id!;
      const slug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const now = new Date();
      
      // Convert dates to timestamps for Firestore
      const postData = {
        id: postId,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        slug,
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags : [],
        status: post.status || 'draft',
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || null
        },
        featuredImage: post.featuredImage || null,
        seoTitle: post.seoTitle || null,
        seoDescription: post.seoDescription || null,
        seoKeywords: Array.isArray(post.seoKeywords) ? post.seoKeywords : [],
        updatedAt: now.toISOString(),
        createdAt: isNewPost ? now.toISOString() : (typeof post.createdAt === 'string' ? post.createdAt : now.toISOString())
      };

      console.log('Saving post data:', postData);
      
      try {
        await setDoc(doc(db, 'blog_posts', postId), postData);
      } catch (error) {
        console.error('Detailed error:', {
          error,
          postData,
          postId,
          isNewPost
        });
        throw error;
      }
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      if (error instanceof Error) {
        alert(`Error saving post: ${error.message}`);
      } else {
        alert('Error saving post. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/blog')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isNewPost ? 'Create New Post' : 'Edit Post'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Save
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Excerpt
            </label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Featured Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Image
            </label>
            <div className="mt-1 flex items-center">
              {post.featuredImage ? (
                <div className="relative">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPost({ ...post, featuredImage: undefined })}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const imageUrl = await uploadToCloudinary(file, 'blog_images');
                          setPost({ ...post, featuredImage: imageUrl });
                        }
                      };
                      input.click();
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      alert('Error uploading image. Please try again.');
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileImage className="h-5 w-5 mr-2" />
                  Upload Image
                </button>
              )}
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={post.category}
                onChange={(e) => setPost({ ...post, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={post.tags.join(', ')}
                onChange={(e) => {
                  const tagArray = e.target.value ? e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) : [];
                  setPost({ ...post, tags: tagArray });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SEO Title
              </label>
              <input
                type="text"
                value={post.seoTitle}
                onChange={(e) => setPost({ ...post, seoTitle: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SEO Description
              </label>
              <textarea
                value={post.seoDescription}
                onChange={(e) => setPost({ ...post, seoDescription: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={post.seoKeywords?.join(', ')}
                onChange={(e) => setPost({ ...post, seoKeywords: e.target.value.split(',').map(keyword => keyword.trim()) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Publishing</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose whether to publish this post or save it as a draft
              </p>
            </div>
            <select
              value={post.status}
              onChange={(e) => setPost({ ...post, status: e.target.value as 'draft' | 'published' })}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
