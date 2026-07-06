"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import SkeletonCard from "@/components/SkeletonCard";
import Link from "next/link";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const experienceLevels = [
  "Entry Level (0-2 Yrs)",
  "Mid Level (2-5 Yrs)",
  "Senior Level (5+ Yrs)",
];

export interface JobListing {
  id: number;
  slug: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  job_type: string;
  company_logo: string;
}

export default function JobsPortal() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/jobs/categories/`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data.results || data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/v1/jobs/featured/`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedJobs(data.results || data);
        }
      } catch (err) {
        console.error("Failed to fetch featured jobs:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const url = new URL(`${baseUrl}/api/v1/jobs/`);

        if (selectedCategory)
          url.searchParams.append("category", selectedCategory);
        url.searchParams.append("page", page.toString());
        // Add other filters if backend supports them later

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const json = await res.json();
        setJobs(json.results || json.data || json || []);
        if (json.count !== undefined) {
          setTotalPages(Math.ceil(json.count / 20));
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedCategory, selectedTypes, selectedExp, page]);

  React.useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedTypes, selectedExp]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <>
      <Header />
      <main className="pt-6 pb-16">
        {/* ─── Content Grid ─── */}
        <section
          id="jobs-content"
          className="max-w-container-max mx-auto px-xxl grid grid-cols-1 md:grid-cols-12 gap-xl items-start"
          aria-label="Job listings"
        >
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full bg-white border border-hairline-soft rounded-xl p-4 flex justify-between items-center text-ink-deep font-bold shadow-sm active:scale-95 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">filter_alt</span>
                Filters
              </div>
              <span 
                className="material-symbols-outlined transition-transform duration-300" 
                style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>
          </div>

          {/* ─── Sidebar Filters ─── */}
          <aside className={`md:col-span-3 md:sticky md:top-24 bg-white rounded-xl border border-hairline-soft p-6 space-y-8 ${isFilterOpen ? 'block mb-6' : 'hidden md:block'}`} aria-label="Job filters">
            <div>
                <h2 className="text-xl font-bold mb-3 text-primary">Filters</h2>
                <div className="h-1 w-12 bg-primary rounded-full mb-6" />
              </div>

              {/* Job Category */}
              {categories.length > 0 && (
                <fieldset>
                  <legend className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">
                    Category
                  </legend>
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.slug}
                          onChange={() => setSelectedCategory(cat.slug)}
                          className="w-5 h-5 border-outline-variant text-primary focus:ring-primary"
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {/* Job Type */}
              <fieldset>
                <legend className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">
                  Job Type
                </legend>
                <div className="space-y-3">
                  {jobTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Experience Level */}
              <fieldset>
                <legend className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">
                  Experience Level
                </legend>
                <div className="space-y-3">
                  {experienceLevels.map((level) => (
                    <label
                      key={level}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="experience"
                        checked={selectedExp === level}
                        onChange={() => setSelectedExp(level)}
                        className="w-5 h-5 border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedExp("");
                  setSelectedCategory("");
                }}
                className="w-full py-3 rounded-full border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
              >
                Clear Filters
              </button>
          </aside>

          {/* ─── Jobs List ─── */}
          <div className="md:col-span-9">
            {/* ─── Featured Jobs ─── */}
            {!loadingFeatured && featuredJobs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-ink-deep mb-6 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-yellow-500 fill-1"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  Featured Jobs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredJobs.map((job) => (
                    <article
                      key={job.id}
                      className="bg-amber-50/50 rounded-xl border border-amber-200 p-5 hover:shadow-md transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-2 border border-amber-100 shrink-0">
                          {job.company_logo ? (
                            <img
                              className="w-full h-full object-contain"
                              src={job.company_logo}
                              alt={job.company}
                              loading="lazy"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-amber-600">
                              business
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/jobs/${job.slug}`} className="font-bold text-ink-deep group-hover:text-primary transition-colors truncate block">
                            {job.title}
                          </Link>
                          <p className="text-sm text-secondary truncate">
                            {job.company}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                location_on
                              </span>
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                payments
                              </span>
                              {job.salary_min && job.salary_max ? `₹${job.salary_min} - ₹${job.salary_max}` : 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-ink-deep">
                Latest Job Openings
              </h1>
              <span className="text-secondary text-sm">
                Showing {jobs.length} Jobs
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">
                <span className="material-symbols-outlined text-4xl mb-4">
                  error
                </span>
                <h3 className="text-lg font-bold">Failed to load jobs</h3>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg text-secondary">
                  No jobs found matching your criteria.
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {jobs.map((job) => (
                  <article
                    key={job.id}
                    className="bg-white rounded-xl border border-hairline-soft p-6 hover:shadow-lg hover:border-primary transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center p-2 border border-hairline-soft shrink-0">
                        {job.company_logo ? (
                          <img
                            className="w-full h-full object-contain"
                            src={job.company_logo}
                            alt={job.company}
                            loading="lazy"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-secondary">
                            business
                          </span>
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <Link href={`/jobs/${job.slug}`} className="text-lg font-bold hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                          <span
                            className="bg-blue-50 text-primary px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                          >
                            {job.job_type?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-secondary mb-3">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-secondary text-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              location_on
                            </span>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              payments
                            </span>
                            {job.salary_min && job.salary_max ? `₹${job.salary_min} - ₹${job.salary_max}` : 'Not specified'}
                          </span>
                          <time className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">
                              schedule
                            </span>
                            {new Date(job.created_at).toLocaleDateString()}
                          </time>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-3 md:mt-0 shrink-0">
                        <Link href={`/jobs/${job.slug}`} className="flex-1 md:flex-initial bg-surface border border-primary text-primary px-6 py-2 rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-all text-center active:scale-95 shadow-sm">
                          View Details
                        </Link>
                        <Link href={`/jobs/${job.slug}?apply=true`} className="flex-1 md:flex-initial bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-primary-deep transition-all text-center active:scale-95 shadow-sm">
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

