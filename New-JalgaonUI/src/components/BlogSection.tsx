type BlogPost = {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  imageAlt: string;
};

const posts: BlogPost[] = [
  { title: "A Practical Guide to Growing a Local Business in Jalgaon", excerpt: "Simple ways to improve visibility, earn trust and connect with more customers in the district.", category: "Business guide", readTime: "6 min read", image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80", imageAlt: "Abstract digital industry artwork" },
  { title: "A Slow Weekend Around Mehrun Lake", excerpt: "Where to walk, what to notice and how to enjoy one of the city's gentler corners.", category: "City life", readTime: "4 min read", image: "https://images.unsplash.com/photo-1470071131384-001b85755536?w=800&q=80", imageAlt: "Still lake with trees reflected in the water" },
  { title: "The Heritage Trail Every Curious Traveller Should Know", excerpt: "A compact introduction to the temples, caves and stories surrounding the Jalgaon region.", category: "Travel", readTime: "7 min read", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&q=80", imageAlt: "Historic rock-cut cave complex" },
];

export default function BlogSection() {
  return (
    <section id="blog" className="bg-surface-container-low py-section" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-container-max px-base sm:px-xxl">
        <div className="mb-xxl flex items-end justify-between gap-xl">
          <div>
            <p className="mb-xs text-xs font-extrabold uppercase tracking-[0.2em] text-primary">Ideas &amp; local stories</p>
            <h2 id="blog-heading" className="text-3xl font-extrabold text-ink-deep md:text-4xl">From the Blog</h2>
          </div>
          <span className="hidden items-center gap-xs text-sm font-bold text-secondary sm:flex">Fresh perspectives <span className="material-symbols-outlined text-lg text-primary" aria-hidden="true">auto_stories</span></span>
        </div>

        <div className="grid grid-cols-1 gap-xl md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.title} className="group overflow-hidden rounded-xl border border-hairline-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={post.image} alt={post.imageAlt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-xl">
                <div className="flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest">
                  <span className="text-primary">{post.category}</span>
                  <span className="h-1 w-1 rounded-full bg-outline-variant" aria-hidden="true" />
                  <span className="text-secondary">{post.readTime}</span>
                </div>
                <h3 className="mt-md text-xl font-extrabold leading-snug text-ink-deep">{post.title}</h3>
                <p className="mt-sm leading-relaxed text-secondary">{post.excerpt}</p>
                <p className="mt-xl flex items-center gap-xs text-sm font-extrabold text-primary">
                  Jalgaon.com editorial <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
