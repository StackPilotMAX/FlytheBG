import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "../../../lib/blogs";

type BlogArticlePageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return blogPosts.map((post) => ({ slug: post.slug })); }
export async function generateMetadata({ params }: BlogArticlePageProps) { const { slug } = await params; const post = getBlogPost(slug); if (!post) return {}; return { title: post.title, description: post.excerpt, alternates: { canonical: `/blogs/${post.slug}` }, openGraph: { title: post.title, description: post.excerpt, url: `/blogs/${post.slug}`, type: "article", publishedTime: post.date }, twitter: { card: "summary", title: post.title, description: post.excerpt } }; }

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params; const post = getBlogPost(slug); if (!post) notFound();
  const structuredData = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, datePublished: post.date, dateModified: post.date, author: { "@type": "Organization", name: "FlyThe BG" }, publisher: { "@type": "Organization", name: "FlyThe BG" }, mainEntityOfPage: `/blogs/${post.slug}` };
  return <main className="featurePage blogArticlePage"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><article><header className="pageHero blogArticleHero"><div className="shell narrowHero"><Link className="blogBack" href="/blogs">← All blogs</Link><span className="eyebrow"><i /> {post.category} · {post.readTime}</span><h1>{post.title}</h1><p>{post.excerpt}</p><span className="blogArticleDate">{post.date}</span></div></header><div className="shell blogArticleBody"><p className="blogArticleIntro">{post.intro}</p>{post.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}<div className="blogArticleCta"><h2>Ready to try it?</h2><p>Use the FlyThe BG tools directly in your browser and choose the workflow that fits your task.</p><Link className="buttonPrimary" href="/features">Explore FlyThe BG tools ↗</Link></div></div></article></main>;
}
