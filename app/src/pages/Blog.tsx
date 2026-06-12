import { Link, useParams } from 'react-router';
import { ArrowLeft, Clock, Calendar, ChevronRight, Tag } from 'lucide-react';
import { blogPosts, getBlogPostBySlug } from '@/data/blogPosts';
import { useState, useMemo } from 'react';

export default function Blog() {
  const { slug } = useParams<{ slug?: string }>();
  const post = slug ? getBlogPostBySlug(slug) : null;

  if (slug && post) return <BlogArticle post={post} />;
  if (slug && !post) {
    return (
      <div className="pt-24 pb-20 text-center">
        <h2 className="text-h-xl text-neutral-950 mb-2">Article Not Found</h2>
        <Link to="/blog" className="text-b-sm text-neutral-500 hover:text-neutral-950">Back to Blog</Link>
      </div>
    );
  }

  return <BlogList />;
}

function BlogList() {
  const [category, setCategory] = useState('all');
  const categories = ['all', ...new Set(blogPosts.map((p) => p.category))];

  const filtered = useMemo(() => {
    if (category === 'all') return blogPosts;
    return blogPosts.filter((p) => p.category === category);
  }, [category]);

  return (
    <div className="pt-24 pb-20">
      <div className="container-main">
        <div className="text-center mb-10">
          <p className="text-b-xs font-medium text-neutral-500 tracking-widest uppercase mb-2">Insights</p>
          <h1 className="text-h-xxl text-neutral-950 mb-4">Blog</h1>
          <p className="text-b-lg text-neutral-500 max-w-2xl mx-auto">
            Tips, guides, and industry insights from our repair experts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-b-xs font-medium transition-colors ${
                category === cat ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 hover:shadow-card-hover transition-all"
            >
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className="text-b-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{post.category}</span>
                <h3 className="text-h-sm text-neutral-950 mt-2 mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-b-sm text-neutral-500 line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-b-xs text-neutral-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogArticle({ post }: { post: NonNullable<ReturnType<typeof getBlogPostBySlug>> }) {
  return (
    <div className="pt-24 pb-20">
      <div className="container-main max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-b-sm text-neutral-500 hover:text-neutral-950 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Articles
        </Link>

        <div className="aspect-video rounded-xl overflow-hidden mb-8">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <span className="text-b-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{post.category}</span>
        <h1 className="text-h-xxl text-neutral-950 mt-3 mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-200">
          <div>
            <p className="text-b-sm font-medium text-neutral-950">{post.author}</p>
            <div className="flex items-center gap-3 text-b-xs text-neutral-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span>
            </div>
          </div>
        </div>

        <div className="prose prose-neutral max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <h3 key={i} className="text-h-md text-neutral-950 mt-8 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>;
            }
            if (paragraph.startsWith('- ')) {
              return (
                <ul key={i} className="list-disc pl-5 space-y-2 mb-4">
                  {paragraph.split('\n').map((item, j) => (
                    <li key={j} className="text-b-sm text-neutral-600">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\./.test(paragraph)) {
              return (
                <ol key={i} className="list-decimal pl-5 space-y-2 mb-4">
                  {paragraph.split('\n').map((item, j) => (
                    <li key={j} className="text-b-sm text-neutral-600">{item.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              );
            }
            return <p key={i} className="text-b-sm text-neutral-600 leading-relaxed mb-4">{paragraph}</p>;
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-b-xs text-neutral-500 mb-2 flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-b-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
