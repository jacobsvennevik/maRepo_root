"use client";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/common/section-header";
import { FilterDropdown } from "@/components/ui/common/filter-dropdown";
import { BlogCard, BlogPost } from "@/components/ui/cards/blog-card";
import { FeaturedBlogCard } from "@/components/ui/cards/featured-blog-card";
import { useBlogFilters } from "@/hooks/useBlogFilters";
import {
  blogPosts,
  featuredBlogPost,
  categories,
  contentTypes,
} from "@/data/blog-posts";

export function BlogResourcesSection() {
  const {
    selectedCategory,
    selectedType,
    showCategoryDropdown,
    showTypeDropdown,
    toggleCategoryDropdown,
    toggleTypeDropdown,
    selectCategory,
    selectType,
  } = useBlogFilters({
    categories,
    contentTypes,
  });

  return (
    <section id="resources" className="relative py-20 overflow-hidden">
      {/* Ocean-inspired background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/images/ocean-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-deep/10 via-aqua/5 to-ocean-medium/10" />
      </div>

      {/* Content container */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <SectionHeader
          badge="Resources & Insights"
          title="Dive Deeper Into Learning"
          description="Explore our collection of articles, videos, and case studies about effective learning strategies, AI in education, and success stories from our community."
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <h3 className="text-xl font-medium text-slate-900">
            Latest Resources
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category filter */}
            <FilterDropdown
              label="Category"
              options={categories}
              selectedOption={selectedCategory}
              isOpen={showCategoryDropdown}
              onToggle={toggleCategoryDropdown}
              onSelect={selectCategory}
            />

            {/* Content type filter */}
            <FilterDropdown
              label="Content Type"
              options={contentTypes}
              selectedOption={selectedType}
              isOpen={showTypeDropdown}
              onToggle={toggleTypeDropdown}
              onSelect={selectType}
            />
          </div>
        </div>

        {/* Featured post */}
        <div className="mb-16">
          <FeaturedBlogCard
            title={featuredBlogPost.title}
            description={featuredBlogPost.description}
            date={featuredBlogPost.date}
            duration={featuredBlogPost.duration}
            presenter={featuredBlogPost.presenter}
            imageUrl={featuredBlogPost.imageUrl}
          />
        </div>

        {/* Blog posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Button variant="ocean-outline">View All Resources</Button>
        </div>
      </div>
    </section>
  );
}
