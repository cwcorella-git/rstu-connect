# Next.js WordPress Replication: Step-by-Step Implementation Roadmap

*A focused, practical plan for replicating the original WordPress site in Next.js 15*

---

## Overview & Starting Point

After comprehensive analysis and expert consultation, this roadmap focuses on **replicating the core WordPress functionality first**, then enhancing with advanced features later.

**Primary Goal**: Create a pixel-perfect, fully functional Next.js replica of the existing WordPress site within 6 weeks.

**Key Principle**: Visual fidelity and feature parity with WordPress before adding new organizing platform capabilities.

---

## Week 1: Foundation & Design System

### Day 1-2: Project Setup

**Initialize Next.js 15 Project**
```bash
npx create-next-app@latest tenants-union-nextjs \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir

cd tenants-union-nextjs
npm install @next/font next-themes gray-matter
```

**Project Structure Setup**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   ├── ui/
│   └── wordpress-blocks/
├── content/
│   ├── blog/
│   ├── stories/
│   └── events/
├── lib/
│   ├── fonts.ts
│   ├── utils.ts
│   └── content.ts
└── styles/
    └── wordpress.css
```

### Day 3-4: Design System Implementation

**Tailwind Configuration**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WordPress brand colors
        primary: '#cc0000',
        secondary: '#7a0000', 
        base: '#ffffff',
        contrast: '#000000',
        neutral: '#eeeeee',
        // Extended WordPress palette
        'vivid-red': '#cf2e2e',
        'luminous-orange': '#ff6900',
        'vivid-amber': '#fcb900',
        'vivid-cyan': '#00d084',
        'cyan-blue': '#0693e3',
        'vivid-purple': '#9b51e0',
      },
      fontFamily: {
        'primary': ['var(--font-outfit)', 'sans-serif'],
        'heading': ['var(--font-league-spartan)', 'sans-serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': '16px',
        'sm': '18px',
        'base': 'clamp(18px, 1.125rem + ((1vw - 3.2px) * 0.227), 20px)',
        'lg': 'clamp(20px, 1.25rem + ((1vw - 3.2px) * 0.455), 24px)',
        'xl': 'clamp(24px, 1.5rem + ((1vw - 3.2px) * 0.682), 30px)',
        '2xl': 'clamp(30px, 1.875rem + ((1vw - 3.2px) * 0.682), 36px)',
        '3xl': 'clamp(36px, 2.25rem + ((1vw - 3.2px) * 1.364), 48px)',
        '4xl': 'clamp(42px, 2.625rem + ((1vw - 3.2px) * 2.045), 60px)',
        '5xl': 'clamp(48px, 3rem + ((1vw - 3.2px) * 2.727), 72px)',
      },
      lineHeight: {
        'body': '1.75',
        'heading': '1.1',
        'medium': '1.5',
      },
      maxWidth: {
        'content': '640px',    // WordPress --wp--style--global--content-size
        'wide': '1200px',      // WordPress --wp--style--global--wide-size
      },
      spacing: {
        'xs': '20px',
        'sm': 'clamp(30px, 4vw, 40px)',
        'md': 'clamp(40px, 6vw, 60px)', 
        'lg': 'clamp(50px, 8vw, 80px)',
        'xl': 'clamp(60px, 10vw, 100px)',
        'gap': '30px', // WordPress consistent gap
      },
      boxShadow: {
        'natural': '6px 6px 9px rgba(0, 0, 0, 0.2)',
        'deep': '12px 12px 50px rgba(0, 0, 0, 0.4)',
        'sharp': '6px 6px 0px rgba(0, 0, 0, 0.2)',
        'light': '0 0 50px rgb(10, 10, 10, 0.1)',
        'solid': '5px 5px 0 rgb(10, 10, 10, 1)',
      },
      screens: {
        'mobile': {'max': '600px'},
        'tablet': {'max': '782px'},
        'desktop': {'min': '782px'},
      }
    },
  },
  plugins: [],
}
export default config
```

**Font Loading Setup**
```typescript
// src/lib/fonts.ts
import { Outfit } from 'next/font/google'
import localFont from 'next/font/local'

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const leagueSpartan = localFont({
  src: './fonts/LeagueSpartan-Variable.woff2',
  variable: '--font-league-spartan',
  display: 'swap',
})
```

### Day 5-7: Core Layout Components

**Site Header Component**
```typescript
// src/components/layout/SiteHeader.tsx
import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="site-header bg-base">
      <div className="max-w-wide mx-auto px-gap py-4">
        <div className="flex items-center justify-between">
          {/* Site Title - matches WordPress styling */}
          <h1 className="text-lg font-heading font-bold">
            <Link 
              href="/" 
              className="text-contrast no-underline hover:text-contrast"
            >
              Reno Sparks Tenants Union
            </Link>
          </h1>
          
          {/* Main Navigation */}
          <MainNavigation />
        </div>
      </div>
    </header>
  )
}
```

**Navigation Component**
```typescript
// src/components/layout/MainNavigation.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

const navigationItems = [
  { label: 'Blog', href: '/blog' },
  { label: 'Member Stories', href: '/stories' },
  { label: 'Mutual Aid Requests', href: '/mutual-aid' },
  { label: 'Upcoming Events', href: '/events' },
]

export function MainNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="wp-block-navigation" aria-label="Main navigation">
      {/* Desktop Navigation */}
      <ul className="hidden tablet:flex items-center space-x-6">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href}
              className="text-sm text-contrast no-underline hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile Hamburger */}
      <button
        className="tablet:hidden p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="7.5" width="16" height="1.5" />
          <rect x="4" y="15" width="16" height="1.5" />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-base shadow-lg tablet:hidden z-50">
          <ul className="py-4">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-6 py-3 text-contrast no-underline hover:bg-neutral"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
```

**Page Container Component**
```typescript
// src/components/layout/PageContainer.tsx
interface PageContainerProps {
  children: React.ReactNode
  maxWidth?: 'content' | 'wide' | 'full'
  className?: string
}

export function PageContainer({ 
  children, 
  maxWidth = 'content',
  className = '' 
}: PageContainerProps) {
  const maxWidthClasses = {
    content: 'max-w-content',
    wide: 'max-w-wide', 
    full: 'max-w-none'
  }

  return (
    <div className={`mx-auto px-gap ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  )
}
```

---

## Week 2: Homepage Replication

### Day 1-3: Homepage Hero Section

**Homepage Structure Analysis**
Based on foundation analysis, replicate the exact WordPress homepage:
- Hero section with "Homes for People, Not for Profit" messaging
- Content blocks matching WordPress structure
- Call-to-action buttons with exact styling
- Image placement and responsive behavior

**Homepage Implementation**
```typescript
// src/app/page.tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { HeroSection } from '@/components/sections/HeroSection'
import { ContentBlocks } from '@/components/sections/ContentBlocks'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      
      <PageContainer>
        <ContentBlocks />
      </PageContainer>
    </main>
  )
}
```

**Hero Section Component**
```typescript
// src/components/sections/HeroSection.tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { WordPressButton } from '@/components/ui/WordPressButton'

export function HeroSection() {
  return (
    <section className="py-lg bg-base">
      <PageContainer maxWidth="wide">
        <div className="text-center space-y-md">
          <h1 className="text-4xl tablet:text-5xl font-heading font-bold text-contrast leading-heading">
            Homes for People, Not for Profit
          </h1>
          
          <p className="text-lg text-contrast leading-body max-w-2xl mx-auto">
            A volunteer-led union building and protecting tenant power through 
            collective action. We are teaming up to fight for safe, affordable, 
            fair housing for all.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WordPressButton variant="primary" href="/get-involved">
              Join Our Movement
            </WordPressButton>
            <WordPressButton variant="secondary" href="/about">
              Learn More
            </WordPressButton>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
```

### Day 4-7: WordPress Block System

**WordPress Button Component**
```typescript
// src/components/ui/WordPressButton.tsx
import Link from 'next/link'

interface WordPressButtonProps {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export function WordPressButton({ 
  children, 
  href, 
  variant = 'primary',
  className = '' 
}: WordPressButtonProps) {
  const baseClasses = 'inline-block px-8 py-4 text-xs font-normal rounded-sm transition-all duration-200 no-underline'
  
  const variantClasses = {
    primary: 'bg-primary text-base hover:bg-red-700',
    secondary: 'bg-secondary text-base hover:bg-red-800'
  }

  return (
    <Link 
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}
```

**WordPress Block Components**
```typescript
// src/components/wordpress-blocks/index.tsx
// Replicate WordPress core blocks exactly

export function WordPressHeading({ 
  level, 
  children, 
  className = '' 
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  const sizeClasses = {
    1: 'text-2xl font-heading font-bold leading-heading',
    2: 'text-xl font-heading font-bold leading-heading', 
    3: 'text-lg font-heading font-semibold leading-heading',
    4: 'text-base font-heading font-medium leading-heading',
    5: 'text-sm font-heading font-medium leading-heading',
    6: 'text-xs font-heading font-medium leading-heading',
  }

  return (
    <Tag className={`${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  )
}

export function WordPressParagraph({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode
  className?: string  
}) {
  return (
    <p className={`text-base leading-body ${className}`}>
      {children}
    </p>
  )
}

export function WordPressList({ 
  children, 
  ordered = false,
  className = '' 
}: {
  children: React.ReactNode
  ordered?: boolean
  className?: string
}) {
  const Tag = ordered ? 'ol' : 'ul'
  const listStyles = ordered ? 'list-decimal' : 'list-disc'
  
  return (
    <Tag className={`${listStyles} pl-6 space-y-1 ${className}`}>
      {children}
    </Tag>
  )
}
```

---

## Week 3: Core Content Pages

### Day 1-3: Blog System

**Content Structure Setup**
```markdown
// src/content/blog/rent-stabilization-victory.md
---
title: "Exposed: Shocking Reasons Rents and Hidden Fees Are Too High"
slug: "rent-stabilization-victory"
author: "Jack Woods"  
date: "2025-03-20"
categories: ["Policy", "Rent Stabilization"]
tags: ["rent control", "corporate landlords", "policy"]
excerpt: "We were inspired by a post in r/Reno by user u/EmotionalBaby9423..."
featured_image: "/images/rent-chart.jpg"
---

Content here matching WordPress post structure...
```

**Blog Page Implementation**
```typescript
// src/app/blog/page.tsx
import { getBlogPosts } from '@/lib/content'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { PageContainer } from '@/components/layout/PageContainer'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <main>
      <PageContainer>
        <div className="py-lg">
          <h1 className="text-2xl font-heading font-bold mb-md">Blog</h1>
          
          <div className="grid gap-md tablet:grid-cols-2 desktop:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
```

**Individual Blog Post**
```typescript
// src/app/blog/[slug]/page.tsx
import { getBlogPost } from '@/lib/content'
import { PageContainer } from '@/components/layout/PageContainer'
import { WordPressContent } from '@/components/wordpress-blocks/WordPressContent'

interface Props {
  params: { slug: string }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPost(params.slug)

  return (
    <article>
      <PageContainer>
        <div className="py-lg">
          <header className="mb-md">
            <h1 className="text-2xl font-heading font-bold mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>By {post.author}</span>
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            
            {post.categories && (
              <div className="flex gap-2 mt-2">
                {post.categories.map((category) => (
                  <span 
                    key={category}
                    className="bg-neutral px-2 py-1 text-xs rounded"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </header>

          <WordPressContent content={post.content} />
        </div>
      </PageContainer>
    </article>
  )
}
```

### Day 4-7: Member Stories & Events

**Member Stories Page**
```typescript
// src/app/stories/page.tsx  
import { getMemberStories } from '@/lib/content'
import { StoryCard } from '@/components/stories/StoryCard'
import { PageContainer } from '@/components/layout/PageContainer'

export default async function StoriesPage() {
  const stories = await getMemberStories()

  return (
    <main>
      <PageContainer>
        <div className="py-lg">
          <h1 className="text-2xl font-heading font-bold mb-md">Member Stories</h1>
          
          <p className="text-lg leading-body mb-lg">
            Real experiences from tenants in our community organizing for better housing.
          </p>
          
          <div className="space-y-lg">
            {stories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
```

**Events Page**
```typescript
// src/app/events/page.tsx
import { getEvents } from '@/lib/content'
import { EventCard } from '@/components/events/EventCard'
import { PageContainer } from '@/components/layout/PageContainer'

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <main>
      <PageContainer>
        <div className="py-lg">
          <h1 className="text-2xl font-heading font-bold mb-md">Upcoming Events</h1>
          
          <div className="grid gap-md tablet:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
```

---

## Week 4: Secondary Pages & Navigation Completion

### Day 1-3: Mutual Aid Page

**Mutual Aid Implementation**
```typescript
// src/app/mutual-aid/page.tsx
import { PageContainer } from '@/components/layout/PageContainer'
import { WordPressButton } from '@/components/ui/WordPressButton'

export default function MutualAidPage() {
  return (
    <main>
      <PageContainer>
        <div className="py-lg">
          <h1 className="text-2xl font-heading font-bold mb-md">
            Mutual Aid Requests
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Community members supporting each other through housing challenges.
              Request help or offer support to build tenant power together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 my-lg">
              <WordPressButton href="/mutual-aid/request">
                Request Support
              </WordPressButton>
              <WordPressButton variant="secondary" href="/mutual-aid/offer">
                Offer Help
              </WordPressButton>
            </div>
            
            {/* Placeholder for mutual aid listings */}
            <div className="space-y-md">
              <h2>Recent Requests</h2>
              <p className="text-gray-600">
                Mutual aid requests will appear here. 
                This replicates the WordPress structure.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
```

### Day 4-5: Complete Internal Navigation

**Footer Component**
```typescript
// src/components/layout/SiteFooter.tsx
import Link from 'next/link'
import { PageContainer } from './PageContainer'

export function SiteFooter() {
  return (
    <footer className="bg-contrast text-base py-lg">
      <PageContainer maxWidth="wide">
        <div className="grid tablet:grid-cols-3 gap-lg">
          <div>
            <h3 className="font-heading font-bold mb-4">Organization</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-primary">About RSTU</Link></li>
              <li><Link href="/mission" className="hover:text-primary">Mission & Values</Link></li>
              <li><Link href="/leadership" className="hover:text-primary">Leadership</Link></li>
              <li><Link href="/reports" className="hover:text-primary">Annual Reports</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/tenant-rights" className="hover:text-primary">Tenant Rights</Link></li>
              <li><Link href="/legal-aid" className="hover:text-primary">Legal Aid</Link></li>
              <li><Link href="/emergency" className="hover:text-primary">Emergency Resources</Link></li>
              <li><Link href="/know-your-rights" className="hover:text-primary">Know Your Rights</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading font-bold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/join" className="hover:text-primary">Join Movement</Link></li>
              <li><Link href="/newsletter" className="hover:text-primary">Newsletter</Link></li>
              <li><Link href="/social" className="hover:text-primary">Social Media</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-lg pt-4 text-center text-sm">
          <p>&copy; 2024 Reno-Sparks Tenants Union. All rights reserved.</p>
        </div>
      </PageContainer>
    </footer>
  )
}
```

### Day 6-7: 404 Page & Error Handling

**404 Page**
```typescript
// src/app/not-found.tsx
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { WordPressButton } from '@/components/ui/WordPressButton'

export default function NotFound() {
  return (
    <main>
      <PageContainer>
        <div className="py-lg text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">
            Page Not Found
          </h1>
          
          <p className="text-lg leading-body mb-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <WordPressButton href="/">
            Return Home
          </WordPressButton>
        </div>
      </PageContainer>
    </main>
  )
}
```

---

## Week 5: WordPress Feature Parity

### Day 1-3: Content Management System

**Content Utilities**
```typescript
// src/lib/content.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface BlogPost {
  slug: string
  title: string
  author: string
  date: string
  categories?: string[]
  tags?: string[]
  excerpt: string
  featured_image?: string
  content: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'src/content/blog')
  const filenames = fs.readdirSync(postsDirectory)
  
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      return {
        slug: filename.replace('.md', ''),
        ...data,
        content,
      } as BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const filePath = path.join(process.cwd(), 'src/content/blog', `${slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug,
    ...data,
    content,
  } as BlogPost
}

// Similar functions for getMemberStories(), getEvents(), etc.
```

### Day 4-5: WordPress Block Rendering

**WordPress Content Renderer**
```typescript
// src/components/wordpress-blocks/WordPressContent.tsx
import { remark } from 'remark'
import html from 'remark-html'

interface Props {
  content: string
}

export async function WordPressContent({ content }: Props) {
  const processedContent = await remark()
    .use(html)
    .process(content)
  
  const contentHtml = processedContent.toString()

  return (
    <div 
      className="wordpress-content prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
```

### Day 6-7: SEO & Meta Tags

**SEO Implementation**
```typescript
// src/lib/seo.ts
import { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
}

export function generateSEO({
  title,
  description, 
  image,
  url
}: SEOProps): Metadata {
  const baseUrl = 'https://renosparkstenantsunion.org'
  
  return {
    title: `${title} - Reno Sparks Tenants Union`,
    description,
    openGraph: {
      title: `${title} - Reno Sparks Tenants Union`,
      description,
      url: url ? `${baseUrl}${url}` : baseUrl,
      siteName: 'Reno Sparks Tenants Union',
      images: image ? [{ url: image }] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Reno Sparks Tenants Union`,
      description,
      images: image ? [image] : [],
    },
  }
}
```

---

## Week 6: Optimization & Final Polish

### Day 1-3: Performance Optimization

**Image Optimization**
```typescript
// src/components/ui/OptimizedImage.tsx
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes="(max-width: 600px) 100vw, (max-width: 782px) 50vw, 33vw"
    />
  )
}
```

**Core Web Vitals Optimization**
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

### Day 4-5: Mobile Optimization & Testing

**Mobile-Specific Enhancements**
```typescript
// src/components/layout/MobileOptimizations.tsx
'use client'
import { useEffect } from 'react'

export function MobileOptimizations() {
  useEffect(() => {
    // Prevent zoom on input focus (iOS Safari)
    const metaViewport = document.querySelector('meta[name=viewport]')
    if (metaViewport) {
      metaViewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      )
    }
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth'
  }, [])

  return null
}
```

**Accessibility Testing**
```bash
# Run accessibility audits
npm install --save-dev @axe-core/react
npm install --save-dev eslint-plugin-jsx-a11y

# Add to testing pipeline
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest-axe
```

### Day 6-7: Final Testing & Deployment

**Production Deployment Checklist**
- [ ] All WordPress pages replicated and functional
- [ ] Mobile responsiveness matches WordPress
- [ ] SEO metadata implemented
- [ ] Core Web Vitals optimized
- [ ] Accessibility compliance verified
- [ ] All internal links working
- [ ] Forms functional (if applicable)
- [ ] Social media integration
- [ ] Analytics implementation

**Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://renosparkstenantsunion.org
NEXT_PUBLIC_GA_MEASUREMENT_ID=your-ga-id
```

---

## Success Criteria

### Week 1 ✓
- [ ] Next.js project setup complete
- [ ] Design system matches WordPress visual identity
- [ ] Core layout components functional
- [ ] Fonts and styling implemented

### Week 2 ✓ 
- [ ] Homepage visually indistinguishable from WordPress
- [ ] Responsive behavior matches original
- [ ] All WordPress blocks rendered correctly

### Week 3 ✓
- [ ] Blog system fully functional
- [ ] Member stories page complete
- [ ] Events page implemented
- [ ] Content management system working

### Week 4 ✓
- [ ] All main pages implemented
- [ ] Navigation fully functional
- [ ] Footer complete with all links
- [ ] 404 page and error handling

### Week 5 ✓
- [ ] WordPress feature parity achieved
- [ ] Content management workflows established
- [ ] SEO implementation complete

### Week 6 ✓
- [ ] Performance optimized for production
- [ ] Mobile experience polished
- [ ] Accessibility compliance verified
- [ ] Ready for deployment

---

## Post-Replication Enhancement Path

Once the WordPress replica is complete and deployed, you can then systematically implement the advanced features from your comprehensive architecture plans:

1. **User Authentication System** (Week 7-8)
2. **Property Database Integration** (Week 9-10)  
3. **Advanced Organizing Tools** (Week 11-12)
4. **Community Engagement Features** (Week 13-16)

---

## Getting Started

**Immediate Next Step**: Begin Week 1, Day 1 by setting up the Next.js project and implementing the design system foundation.

This roadmap provides a clear, step-by-step path to replicate the original WordPress site while building the foundation for future enhancements. Each week has specific, achievable goals that build upon the previous work.

Ready to start implementation? 🚀