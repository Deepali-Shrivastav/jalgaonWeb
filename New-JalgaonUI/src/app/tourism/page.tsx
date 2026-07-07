import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TouristPlacesList from '@/components/TouristPlacesList';

import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Jalgaon Tourism & Heritage Places | Explore Ajanta Caves & More',
  description: 'Explore the top tourist attractions in Jalgaon, including Ajanta Caves, Gandhi Teerth, Patnadevi, and Mehrun Lake. Plan your perfect Khandesh trip.',
  alternates: {
    canonical: 'https://www.jalgaon.com/tourism',
  },
  openGraph: {
    title: 'Jalgaon Tourism & Heritage Places',
    description: 'Explore the top tourist attractions in Jalgaon, including Ajanta Caves, Gandhi Teerth, Patnadevi, and Mehrun Lake.',
    url: 'https://www.jalgaon.com/tourism',
    type: 'website',
  }
};

export default function TourismPage() {
  const touristSchema = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": "Jalgaon",
    "description": "Jalgaon is the cultural soul of North Maharashtra, known as the Banana Capital of India and gateway to the UNESCO World Heritage Ajanta Caves.",
    "touristType": ["Cultural tourism", "Heritage tourism", "Nature tourism"],
    "includesAttraction": [
      {
        "@type": "TouristAttraction",
        "name": "Ajanta Caves",
        "description": "UNESCO World Heritage site featuring 30 rock-cut Buddhist cave monuments."
      },
      {
        "@type": "TouristAttraction",
        "name": "Gandhi Teerth",
        "description": "A magnificent museum and research institute dedicated to Mahatma Gandhi."
      },
      {
        "@type": "TouristAttraction",
        "name": "Patnadevi Temple",
        "description": "Historic temple surrounded by lush green forests and mountains."
      }
    ]
  };
  return (
    <>
      <style>{`
        .curved-aesthetic { border-radius: 32px; }
        .hero-gradient { background: linear-gradient(180deg, rgba(0,26,64,0.7) 0%, rgba(0,63,135,0.4) 100%); }
      `}</style>
      {/* Wrapper for page specific styles to not pollute globals */}
      <div className="bg-background text-on-surface font-body-md">
        <Script
          id="tourism-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(touristSchema) }}
        />
        
<Header />
<main>
{/* Hero Section */}
<section className="relative h-[500px] md:h-[600px] flex items-end overflow-hidden pb-16">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover" alt="Ajanta caves river landscape" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOw47yUjhZ-KihwnDR-Y-nRGpmcMyv1ywQkDqRbeZXKhbXAuryykTVwSwpH8-GaDg3HAuPROh17qan1wdWJPTzWuqW4f0TBAREm5b956pG5XrGLyY6DLOn_c-MQooyBDyQDFylQKu4CoJmysJAVcf-RNzJjyppPLEd1NhbZm6WUTU7bgsRHfaPApqtPePRTdC_CHT_s82qlq9Vv701w-F_bVUsw39e5SPEkVJfzk-_wwX4tSvspLI1"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
</div>
<div className="relative z-10 max-w-container-max mx-auto px-4 md:px-8 w-full">
<div className="max-w-3xl">
<div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase mb-4">
  Heritage of Khandesh
</div>
<h1 className="font-headline-xl text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">Explore the Wonders of<br/>Jalgaon</h1>
<p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl">A journey through ancient caves, sacred temples, and serene natural landscapes in the heart of Maharashtra.</p>
</div>
</div>
</section>
{/* Stats Bar */}
<section className="bg-surface-container-low border-b border-outline-variant">
<div className="max-w-container-max mx-auto py-8 px-4 md:px-8">
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
<div>
<div className="font-headline-lg text-headline-lg text-primary">30+</div>
<div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Historic Sites</div>
</div>
<div>
<div className="font-headline-lg text-headline-lg text-primary">2000+</div>
<div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Years of History</div>
</div>
<div>
<div className="font-headline-lg text-headline-lg text-primary">1M+</div>
<div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Annual Visitors</div>
</div>
<div>
<div className="font-headline-lg text-headline-lg text-primary">4.8/5</div>
<div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Traveler Rating</div>
</div>
</div>
</div>
</section>
{/* Top Attractions */}
<section className="py-20 px-4 md:px-8 max-w-container-max mx-auto">
<div className="text-center mb-12">
<h2 className="font-headline-lg text-headline-lg text-on-background mb-4">Top Attractions</h2>
<p className="text-on-surface-variant mx-auto max-w-2xl">Discover the curated beauty of our district, from rock-cut marvels to spiritual sanctuaries.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Left Column: Featured Ajanta Caves (Spans 2 rows) */}
<div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[32px] h-[500px]">
<img alt="Ajanta Caves" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDx_4IxcLRPiwbMxgDZhbIyrC-6ueQmxrxuRion8LWNFLTsf1XTSuMpg8Qsjbx3CSImSoJRxhRHMhAw9ZIM2ePSBfpPc93NBPclPyI_xx9qVLdlZLyeOdeUaCuKSEHK0s9WhWStE7BG4P-Tza-BpyclIVjY0GpUFqyDSZU_L1nPR3kMFBftqaeZZZ7eaAUSdLRRkCpojc42c2_MUTeQGGq0K-_Qp8rcUGxgZRqvRVzDT9B87y6G5FZb"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
<h3 className="text-white font-headline-md text-headline-md mb-2">Ajanta Caves</h3>
<p className="text-white/90 text-body-sm max-w-[448px]">UNESCO World Heritage site featuring 30 rock-cut Buddhist cave monuments dating from the 2nd century BCE.</p>
</div>
</div>
{/* Right Column Top: Patnadevi Temple */}
<div className="relative group overflow-hidden rounded-[32px] h-[238px]">
<img alt="Patnadevi Temple" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJQ6r8xwiTgFbQn6qy6_KasERt9pwQGmTtr6nZcOBZ9N2vfpAa0rog_9T5YbpO7V2wpUqkUlWBmMHBCweqdnESMfPAfjV4mEEI_jXrX-3qdhk0nt-lQhV-m1zeyhXznNiwXTUxBKDQUP0kwTBW11S2Zf8vipVuhlsuvQV0mrkSJ80iuc-aqKYEU6To3vFpIJaDn14N6dVQwGZ4x5-O57EVwKmf7rG_o3J_pfQ0bpymZqNt9VZxfxVX"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
<h3 className="text-white font-headline-md text-headline-md">Patnadevi Temple</h3>
</div>
</div>
{/* Right Column Middle: Mehrun Lake */}
<div className="relative group overflow-hidden rounded-[32px] h-[238px]">
<img alt="Mehrun Lake" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhp27UL3RrCHn7_8RcPuAfDalN5bxgN0UEogFT11w0kxu8GIawJCe1OiFbeZ88NYYI0I2dSDK6E4OB8p6_y0Po-lMFS-1W73JdglLPQUdu4_poLrTJd8hEjej3_wrZsHdIVGLzEVi34gQer_bp05CQwEjGyAtRJHk6wOQ8L4O143Eq4M2Ad7a7irtcXfe54wt6APCDEuAoaRaN-mA0WwMllHFQkkjjam9PQQYYsh6o827pmDV6S6Tz"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
<h3 className="text-white font-headline-md text-headline-md">Mehrun Lake</h3>
</div>
</div>
{/* Bottom Row Left: Gandhi Teerth */}
<div className="relative group overflow-hidden rounded-[32px] h-[238px]">
<img alt="Gandhi Teerth" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU6t2AMyoXh3YdR09VZor2oq3Jx4PjV-UB-e1et8JcwoCEtpHPPQP96EQRodzXONmIPgzymr3LtwRciTeiiH4h-ZK5409GmOr3r66oyUiwQ0L1EOy_Om9QbFghyiiJKgIwzDJvINSF6ArgzY1nzGsf3al5mKUhT4DR7JQpuuda0qt6CjqrExLWebbkRnYmpjnDve3xLhyUZvxvciuxfTLx6Zlw1ywHVmvfvpGiniHl25-twY_LhUK2"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
<h3 className="text-white font-headline-md text-headline-md">Gandhi Teerth</h3>
</div>
</div>
{/* Bottom Row Right: Padalsare Dam */}
<div className="md:col-span-2 relative group overflow-hidden rounded-[32px] h-[238px]">
<img alt="Padalsare Dam" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOw47yUjhZ-KihwnDR-Y-nRGpmcMyv1ywQkDqRbeZXKhbXAuryykTVwSwpH8-GaDg3HAuPROh17qan1wdWJPTzWuqW4f0TBAREm5b956pG5XrGLyY6DLOn_c-MQooyBDyQDFylQKu4CoJmysJAVcf-RNzJjyppPLEd1NhbZm6WUTU7bgsRHfaPApqtPePRTdC_CHT_s82qlq9Vv701w-F_bVUsw39e5SPEkVJfzk-_wwX4tSvspLI1"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
<h3 className="text-white font-headline-md text-headline-md mb-1">Padalsare Dam</h3>
<p className="text-white/90 text-body-sm">A picturesque getaway known for its scenic water bodies and peaceful atmosphere.</p>
</div>
</div>
</div>
</section>
{/* Editorial Content: Heritage of Khandesh */}
<section className="bg-surface-container-low py-20">
<div className="max-w-container-max mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-16 items-center">
<div className="order-2 md:order-1">
<img className="rounded-[32px] shadow-2xl" data-alt="A collage-style high-quality image showcasing the cultural heritage of the Khandesh region. It includes a vibrant local folk dance performance, a close-up of traditional Khandeshi cuisine like Shev Bhaji, and the texture of a local handloom textile. The composition is artistic and celebratory, using a warm color palette of oranges, reds, and gold." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhp27UL3RrCHn7_8RcPuAfDalN5bxgN0UEogFT11w0kxu8GIawJCe1OiFbeZ88NYYI0I2dSDK6E4OB8p6_y0Po-lMFS-1W73JdglLPQUdu4_poLrTJd8hEjej3_wrZsHdIVGLzEVi34gQer_bp05CQwEjGyAtRJHk6wOQ8L4O143Eq4M2Ad7a7irtcXfe54wt6APCDEuAoaRaN-mA0WwMllHFQkkjjam9PQQYYsh6o827pmDV6S6Tz"/>
</div>
<div className="order-1 md:order-2">
<h2 className="font-headline-lg text-headline-lg text-on-background mb-6">Heritage of Khandesh</h2>
<div className="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
<p>Jalgaon, often called the 'Banana Capital of India', is far more than an agricultural hub. It is the cultural soul of North Maharashtra, bridging the gap between historical grandeur and modern industrial growth.</p>
<p>The region's history spans over two millennia, from being a critical node on ancient trade routes to becoming a center for the Indian Independence movement. The blend of Satpura’s rugged terrain and the fertile Tapi river valley has created a unique ecosystem for both nature lovers and history buffs.</p>
<p>Travelers here don't just visit sites; they immerse themselves in a tradition of legendary hospitality, vibrant Khandeshi festivals, and architectural wonders that have stood the test of time.</p>
</div>
<div className="mt-8 flex gap-4">
<div className="flex flex-col">
<span className="text-primary font-bold text-headline-md">2.5M+</span>
<span className="text-xs text-on-surface-variant uppercase">Bananas Produced Yearly</span>
</div>
<div className="w-[1px] bg-outline-variant"></div>
<div className="flex flex-col">
<span className="text-primary font-bold text-headline-md">Gold Hub</span>
<span className="text-xs text-on-surface-variant uppercase">Famous Jewelry Market</span>
</div>
</div>
</div>
</div>
</section>
<TouristPlacesList />
{/* Travel Essentials Hub */}
<section className="py-20 max-w-container-max mx-auto px-4 md:px-8">
<h2 className="font-headline-lg text-headline-lg text-center mb-12">Travel Essentials</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<div className="bg-surface border border-outline-variant p-8 rounded-[32px] text-center hover:bg-primary-fixed transition-colors">
<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
<span className="material-symbols-outlined">wb_sunny</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">Best Time to Visit</h3>
<p className="text-on-surface-variant text-body-sm">October to March. The weather is pleasant for outdoor exploration and cave tours.</p>
</div>
<div className="bg-surface border border-outline-variant p-8 rounded-[32px] text-center hover:bg-primary-fixed transition-colors">
<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
<span className="material-symbols-outlined">schedule</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">Ideal Duration</h3>
<p className="text-on-surface-variant text-body-sm">3-4 Days. Sufficient to cover major caves, temples, and the Gandhi Teerth museum.</p>
</div>
<div className="bg-surface border border-outline-variant p-8 rounded-[32px] text-center hover:bg-primary-fixed transition-colors">
<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
<span className="material-symbols-outlined">directions_bus</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">How to Reach</h3>
<p className="text-on-surface-variant text-body-sm">Jalgaon Junction is a major rail hub. Aurangabad Airport is the nearest air connectivity (160km).</p>
</div>
</div>
</section>
{/* FAQ Section */}
<section className="bg-surface py-20 px-4 md:px-8">
<div className="max-w-3xl mx-auto">
<h2 className="font-headline-lg text-headline-lg text-center mb-12">Frequently Asked Questions</h2>
<div className="space-y-4">
<details className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden" open>
<summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-surface-container-low transition-colors">
<span className="font-headline-md text-headline-md">How far is Ajanta Caves from Jalgaon city?</span>
<span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div className="p-6 pt-0 text-on-surface-variant border-t border-outline-variant/30">
                            The Ajanta Caves are approximately 60 kilometers from Jalgaon city. It takes about 1.5 to 2 hours by road via well-maintained highways. Regular buses and taxis are available from Jalgaon Junction.
                        </div>
</details>
<details className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-surface-container-low transition-colors">
<span className="font-headline-md text-headline-md">What are the must-eat foods in Jalgaon?</span>
<span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div className="p-6 pt-0 text-on-surface-variant border-t border-outline-variant/30">
                            You must try the Khandeshi Shev Bhaji, Bharit-Puri (made from local Baingan/Brinjal), and the famous Jalgaon Bananas. The region is also known for its spicy and flavorful street food.
                        </div>
</details>
<details className="group bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
<summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-surface-container-low transition-colors">
<span className="font-headline-md text-headline-md">Is Jalgaon safe for solo travelers?</span>
<span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
</summary>
<div className="p-6 pt-0 text-on-surface-variant border-t border-outline-variant/30">
                            Yes, Jalgaon is a safe and hospitable city. The tourist areas are well-monitored. However, standard travel precautions are advised, especially when exploring remote temple sites or the Satpura ranges.
                        </div>
</details>
</div>
</div>
</section>
{/* CTA Banner */}
<section className="max-w-container-max mx-auto px-4 md:px-8 mb-20">
<div className="bg-primary text-on-primary p-10 md:p-12 rounded-[20px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
<div className="relative z-10 flex-1 w-full">
<h2 className="text-3xl md:text-[34px] font-bold mb-3">Ready to Explore Jalgaon?</h2>
<p className="text-white/90 text-[15px] mb-8">Download our official travel guide or book a verified local heritage walk today.</p>
<div className="flex flex-wrap gap-4">
<button className="bg-white text-primary px-6 py-[10px] rounded-[6px] font-bold hover:bg-gray-100 transition-colors text-[14px]">Download PDF Guide</button>
<button className="bg-transparent border border-white px-6 py-[10px] rounded-[6px] font-bold hover:bg-white/10 transition-colors text-[14px]">Contact Tourist Office</button>
</div>
</div>
<div className="relative z-10 w-full md:w-[400px] bg-white/10 backdrop-blur-md p-6 rounded-[8px] border border-white/20">
<div className="flex items-center gap-4 mb-6">
<div className="w-[42px] h-[42px] bg-white rounded-[10px] flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
</div>
<div>
<div className="text-[10px] uppercase text-white/70 tracking-wider font-semibold mb-0.5">Current Location</div>
<div className="font-bold text-[15px]">Jalgaon, Maharashtra</div>
</div>
</div>
<div className="space-y-3">
<div className="flex justify-between items-center text-[13px]">
<span className="text-white/90">Ajanta Caves</span>
<span className="font-bold">59 km</span>
</div>
<div className="flex justify-between items-center text-[13px]">
<span className="text-white/90">Gandhi Teerth</span>
<span className="font-bold">7 km</span>
</div>
<div className="h-[1px] bg-white/10 w-full my-4"></div>
<button className="w-full text-center text-[13px] font-bold mt-1 hover:text-white/80 transition-colors">View Interactive Map</button>
</div>
</div>
{/* Background Pattern */}
<div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
<div className="absolute -top-12 -left-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
</div>
</section>
</main>
<Footer />


      </div>
    </>
  );
}
