# Next.js Architecture Plan: Reno-Sparks Tenants Union Platform

**Project**: Modern Next.js replication of WordPress Frost theme site  
**Mission**: "Homes for People, Not for Profit"  
**Date**: September 2025  
**Architecture**: Next.js 15 App Router with sophisticated block system

---

## Executive Summary

This architecture plan outlines the development of a sophisticated Next.js application that replicates the WordPress Frost theme functionality while integrating tenant organizing intelligence capabilities. The platform combines modern web architecture with community organizing tools and data visualization capabilities.

### Key Technical Achievements

- **WordPress Block System Replication**: 25+ block types with full editing capabilities
- **Advanced Design System**: 200+ CSS custom properties with fluid typography
- **Tenant Organizing Intelligence**: Property data visualization and campaign management
- **Progressive Security**: Three-tier security system with community verification
- **Performance Optimization**: Server Components, efficient state management, and optimized data loading

---

## 1. Project Structure & Architecture

### Domain-Driven Design Organization

```
tenants-platform/
├── src/
│   ├── app/                           # Next.js 15 App Router
│   │   ├── (auth)/                   # Auth-protected routes
│   │   │   ├── dashboard/            # Member dashboard
│   │   │   ├── campaigns/            # Campaign management
│   │   │   └── intelligence/         # Property data insights
│   │   ├── (content)/               # Public content routes
│   │   │   ├── blog/                # Blog posts
│   │   │   ├── stories/             # Member stories
│   │   │   ├── events/              # Upcoming events
│   │   │   └── [slug]/              # Dynamic static pages
│   │   ├── api/                     # API endpoints
│   │   │   ├── blocks/              # Block data management
│   │   │   ├── content/             # Content CRUD operations
│   │   │   ├── organizing/          # Property & campaign data
│   │   │   └── auth/                # Authentication endpoints
│   │   ├── globals.css              # Global styles & design system
│   │   └── layout.tsx               # Root layout component
│   ├── components/
│   │   ├── blocks/                  # WordPress-like block components
│   │   │   ├── core/                # Core blocks (paragraph, heading, etc.)
│   │   │   ├── media/               # Media blocks (image, gallery)
│   │   │   ├── layout/              # Layout blocks (columns, group)
│   │   │   ├── navigation/          # Navigation blocks
│   │   │   └── organizing/          # Custom organizing blocks
│   │   ├── editor/                  # Block editor interface
│   │   ├── layouts/                 # Layout constraint system
│   │   ├── organizing/              # Organizing-specific components
│   │   │   ├── PropertyMap/         # Interactive mapping
│   │   │   ├── CorporateAnalysis/   # Landlord portfolio viz
│   │   │   └── CampaignDashboard/   # Campaign management
│   │   └── ui/                      # Design system components
│   ├── lib/
│   │   ├── blocks/                  # Block system core logic
│   │   │   ├── registry.ts          # Block registration system
│   │   │   ├── renderer.tsx         # Block rendering engine
│   │   │   └── validation.ts        # Block validation
│   │   ├── content/                 # Content management
│   │   ├── organizing/              # Property data & analytics
│   │   ├── design-system/           # Theme & CSS custom properties
│   │   ├── auth/                    # Authentication & security
│   │   └── database/                # Database integration
│   ├── hooks/                       # Custom React hooks
│   ├── stores/                      # State management stores
│   │   ├── editor.ts                # Block editor state
│   │   ├── design-system.ts         # Theme & customization
│   │   ├── auth.ts                  # Authentication state
│   │   └── organizing.ts            # Organizing data state
│   ├── styles/
│   │   ├── design-system.css        # CSS custom properties
│   │   ├── blocks.css               # Block-specific styles
│   │   ├── layouts.css              # Layout constraints
│   │   └── organizing.css           # Organizing-specific styles
│   └── types/                       # TypeScript definitions
└── public/
    ├── images/
    │   └── rstu_logo_isolated.png    # Organization logo
    └── fonts/                        # Custom fonts (Outfit, etc.)
```

---

## 2. Technology Stack & Dependencies

### Core Framework & Runtime

```json
{
  "name": "rstu-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    // Core Next.js framework
    "next": "^15.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    
    // TypeScript support
    "typescript": "^5.2.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    
    // State management
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "@tanstack/react-query": "^5.0.0",
    
    // Database & data management
    "better-sqlite3": "^9.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    
    // UI & styling
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.400.0",
    
    // Data visualization for property analysis
    "d3": "^7.0.0",
    "@types/d3": "^7.0.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^4.0.0",
    "@types/leaflet": "^1.9.0",
    
    // Content management
    "react-hook-form": "^7.0.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.0.0",
    
    // Security & authentication
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.0",
    "jsonwebtoken": "^9.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "crypto-js": "^4.1.1",
    "@types/crypto-js": "^4.1.0",
    
    // Performance & utilities
    "react-window": "^1.8.8",
    "@types/react-window": "^1.8.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    // Build tools
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    
    // Testing
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    
    // Development utilities
    "@types/jest": "^29.0.0",
    "webpack-bundle-analyzer": "^4.9.0"
  }
}
```

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['better-sqlite3'],
    optimizePackageImports: ['lucide-react', '@/components/blocks'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    // Optimize bundle splitting for block system
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        blocks: {
          name: 'blocks',
          test: /[\\/]components[\\/]blocks[\\/]/,
          chunks: 'all',
          priority: 10,
        },
        organizing: {
          name: 'organizing',
          test: /[\\/]components[\\/]organizing[\\/]/,
          chunks: 'all',
          priority: 8,
        }
      }
    };
    
    return config;
  },
};

module.exports = nextConfig;
```

---

## 3. Block System Implementation

### Core Block Architecture

```typescript
// types/blocks.ts
export interface BlockInstance {
  id: string;
  name: string;
  attributes: Record<string, any>;
  innerBlocks: BlockInstance[];
  className?: string;
  align?: 'left' | 'center' | 'right' | 'wide' | 'full';
}

export interface BlockDefinition<T = any> {
  name: string;
  category: 'content' | 'layout' | 'media' | 'organizing';
  title: string;
  description: string;
  icon: string;
  attributes: T;
  supports: {
    anchor?: boolean;
    className?: boolean;
    color?: boolean;
    spacing?: boolean;
    typography?: boolean;
    align?: boolean | string[];
  };
  component: React.ComponentType<BlockProps<T>>;
}

export interface BlockProps<T = any> {
  attributes: T;
  setAttributes?: (attrs: Partial<T>) => void;
  isSelected?: boolean;
  className?: string;
  innerBlocks?: BlockInstance[];
  clientId: string;
}
```

### Block Registry System

```typescript
// lib/blocks/registry.ts
import { HeaderBlock } from '@/components/blocks/core/HeaderBlock';
import { ParagraphBlock } from '@/components/blocks/core/ParagraphBlock';
import { ImageBlock } from '@/components/blocks/media/ImageBlock';
import { ColumnsBlock } from '@/components/blocks/layout/ColumnsBlock';
import { NavigationBlock } from '@/components/blocks/navigation/NavigationBlock';
import { PropertyMapBlock } from '@/components/blocks/organizing/PropertyMapBlock';
import { CampaignCalloutBlock } from '@/components/blocks/organizing/CampaignCalloutBlock';

export const blockRegistry: Record<string, BlockDefinition> = {
  'core/heading': {
    name: 'core/heading',
    category: 'content',
    title: 'Heading',
    description: 'Add a heading to structure your content',
    icon: 'Heading',
    attributes: {
      content: '',
      level: 2,
      textAlign: 'left',
      fontSize: 'large',
      textColor: undefined,
      backgroundColor: undefined,
    },
    supports: {
      className: true,
      color: true,
      typography: true,
      align: true,
    },
    component: HeaderBlock,
  },
  
  'core/paragraph': {
    name: 'core/paragraph',
    category: 'content',
    title: 'Paragraph',
    description: 'Add text content with rich formatting',
    icon: 'Type',
    attributes: {
      content: '',
      fontSize: 'medium',
      textColor: undefined,
      backgroundColor: undefined,
    },
    supports: {
      className: true,
      color: true,
      typography: true,
    },
    component: ParagraphBlock,
  },
  
  'core/image': {
    name: 'core/image',
    category: 'media',
    title: 'Image',
    description: 'Insert an image with caption',
    icon: 'Image',
    attributes: {
      url: '',
      alt: '',
      caption: '',
      width: null,
      height: null,
      align: 'none',
    },
    supports: {
      align: ['left', 'center', 'right', 'wide', 'full'],
      className: true,
    },
    component: ImageBlock,
  },
  
  'core/columns': {
    name: 'core/columns',
    category: 'layout',
    title: 'Columns',
    description: 'Display content in columns',
    icon: 'Columns',
    attributes: {
      verticalAlignment: null,
      isStackedOnMobile: true,
    },
    supports: {
      align: ['wide', 'full'],
      className: true,
      spacing: true,
    },
    component: ColumnsBlock,
  },
  
  'organizing/property-map': {
    name: 'organizing/property-map',
    category: 'organizing',
    title: 'Property Map',
    description: 'Display interactive property ownership map',
    icon: 'Map',
    attributes: {
      centerLat: 39.5296,
      centerLng: -119.8138,
      zoom: 11,
      showCorporateOwnership: true,
      highlightLandlords: [],
    },
    supports: {
      align: ['wide', 'full'],
      className: true,
    },
    component: PropertyMapBlock,
  },
  
  'organizing/campaign-callout': {
    name: 'organizing/campaign-callout',
    category: 'organizing',
    title: 'Campaign Callout',
    description: 'Highlight urgent organizing actions',
    icon: 'Megaphone',
    attributes: {
      title: 'Join Our Campaign',
      description: '',
      actionText: 'Get Involved',
      actionUrl: '',
      urgencyLevel: 'medium',
      targetLandlord: undefined,
    },
    supports: {
      className: true,
      color: true,
      spacing: true,
    },
    component: CampaignCalloutBlock,
  },
};

// Block registration utilities
export function getBlockDefinition(name: string): BlockDefinition | undefined {
  return blockRegistry[name];
}

export function getBlocksByCategory(category: string): BlockDefinition[] {
  return Object.values(blockRegistry).filter(block => block.category === category);
}

export function getAllBlocks(): BlockDefinition[] {
  return Object.values(blockRegistry);
}
```

### Block Components Examples

```typescript
// components/blocks/core/HeaderBlock.tsx
import { BlockProps } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface HeaderAttributes {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign: 'left' | 'center' | 'right';
  fontSize: string;
  textColor?: string;
  backgroundColor?: string;
}

export function HeaderBlock({ 
  attributes, 
  className,
  isSelected,
  setAttributes 
}: BlockProps<HeaderAttributes>) {
  const {
    content,
    level = 2,
    textAlign = 'left',
    fontSize = 'large',
    textColor,
    backgroundColor
  } = attributes;

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const styles = {
    textAlign,
    fontSize: `var(--wp--preset--font-size--${fontSize})`,
    color: textColor ? `var(--wp--preset--color--${textColor})` : undefined,
    backgroundColor: backgroundColor ? `var(--wp--preset--color--${backgroundColor})` : undefined,
  };

  return (
    <Tag 
      className={cn(
        'wp-block-heading',
        `has-text-align-${textAlign}`,
        textColor && `has-${textColor}-color`,
        backgroundColor && `has-${backgroundColor}-background-color`,
        isSelected && 'is-selected',
        className
      )}
      style={styles}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// components/blocks/organizing/PropertyMapBlock.tsx
'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { BlockProps } from '@/types/blocks';
import { useOrganizingData } from '@/hooks/useOrganizingData';

const LeafletMap = dynamic(() => import('@/components/organizing/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
});

interface PropertyMapAttributes {
  centerLat: number;
  centerLng: number;
  zoom: number;
  showCorporateOwnership: boolean;
  highlightLandlords: string[];
}

export function PropertyMapBlock({ 
  attributes, 
  className 
}: BlockProps<PropertyMapAttributes>) {
  const {
    centerLat = 39.5296,
    centerLng = -119.8138,
    zoom = 11,
    showCorporateOwnership = true,
    highlightLandlords = []
  } = attributes;

  const { data: properties } = useOrganizingData();
  
  return (
    <div className={cn('wp-block-organizing-property-map', className)}>
      <LeafletMap
        center={[centerLat, centerLng]}
        zoom={zoom}
        properties={properties}
        showCorporateOwnership={showCorporateOwnership}
        highlightLandlords={highlightLandlords}
      />
    </div>
  );
}
```

---

## 4. Design System Architecture

### CSS Custom Properties System

```css
/* styles/design-system.css */
:root {
  /* Brand Colors (from WordPress analysis) */
  --wp--preset--color--primary: #cc0000;      /* RSTU Red */
  --wp--preset--color--secondary: #7a0000;    /* Dark Red */
  --wp--preset--color--base: #ffffff;         /* White */
  --wp--preset--color--contrast: #000000;     /* Black */
  --wp--preset--color--neutral: #eeeeee;      /* Light Gray */
  --wp--preset--color--vivid-red: #cf2e2e;
  --wp--preset--color--luminous-vivid-orange: #ff6900;
  --wp--preset--color--luminous-vivid-amber: #fcb900;
  --wp--preset--color--vivid-green-cyan: #00d084;
  --wp--preset--color--vivid-cyan-blue: #0693e3;
  --wp--preset--color--vivid-purple: #9b51e0;

  /* Typography System - Outfit Font Family */
  --wp--preset--font-family--primary: Outfit, sans-serif;
  --wp--preset--font-family--heading: "League Spartan", sans-serif;
  --wp--preset--font-family--system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  
  /* Fluid Typography with clamp() functions */
  --wp--preset--font-size--xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --wp--preset--font-size--small: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
  --wp--preset--font-size--medium: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --wp--preset--font-size--large: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --wp--preset--font-size--x-large: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);
  --wp--preset--font-size--max-36: clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem);
  --wp--preset--font-size--max-48: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
  --wp--preset--font-size--max-60: clamp(2.625rem, 2rem + 3.125vw, 3.75rem);
  --wp--preset--font-size--max-72: clamp(3rem, 2.25rem + 3.75vw, 4.5rem);

  /* Font Weight Scale */
  --wp--custom--font-weight--thin: 100;
  --wp--custom--font-weight--light: 300;
  --wp--custom--font-weight--regular: 400;
  --wp--custom--font-weight--medium: 500;
  --wp--custom--font-weight--semi-bold: 600;
  --wp--custom--font-weight--bold: 700;
  --wp--custom--font-weight--extra-bold: 800;

  /* Spacing System - Fluid & Responsive */
  --wp--preset--spacing--xs: clamp(0.5rem, 1vw, 1rem);
  --wp--preset--spacing--small: clamp(1rem, 2vw, 1.5rem);
  --wp--preset--spacing--medium: clamp(1.5rem, 3vw, 2rem);
  --wp--preset--spacing--large: clamp(2rem, 4vw, 3rem);
  --wp--preset--spacing--x-large: clamp(2.5rem, 5vw, 4rem);
  --wp--custom--spacing--gap: 30px;

  /* Layout Constraints */
  --wp--style--global--content-size: 640px;   /* Standard content width */
  --wp--style--global--wide-size: 1200px;     /* Wide content width */
  
  /* Shadow System */
  --wp--preset--shadow--natural: 0 8px 16px rgba(0, 0, 0, 0.15);
  --wp--preset--shadow--deep: 0 12px 24px rgba(0, 0, 0, 0.25);
  --wp--preset--shadow--sharp: 0 2px 8px rgba(0, 0, 0, 0.2);
  --wp--preset--shadow--outlined: 0 0 0 2px rgb(255, 255, 255), 0 0 0 4px rgb(0, 0, 0);
  --wp--preset--shadow--solid: 4px 4px 0 rgba(0, 0, 0, 1);

  /* Responsive Breakpoints as CSS Properties */
  --wp--breakpoint--sm: 600px;
  --wp--breakpoint--md: 782px;
  --wp--breakpoint--lg: 1024px;
  --wp--breakpoint--xl: 1280px;

  /* Line Heights */
  --wp--custom--line-height--body: 1.6;
  --wp--custom--line-height--heading: 1.2;
  --wp--custom--line-height--medium: 1.4;

  /* Border Radius */
  --wp--custom--border--radius--small: 4px;
  --wp--custom--border--radius--medium: 8px;
  --wp--custom--border--radius--large: 12px;
}

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  :root {
    --wp--preset--color--base: #1a1a1a;
    --wp--preset--color--contrast: #ffffff;
    --wp--preset--color--neutral: #333333;
    --wp--preset--color--primary: #ff4444;
    --wp--preset--color--secondary: #cc3333;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --wp--preset--color--primary: #990000;
    --wp--preset--color--secondary: #660000;
    --wp--preset--shadow--natural: 0 4px 8px rgba(0, 0, 0, 0.5);
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  :root {
    --wp--animation--duration: 0s;
  }
}
```

### Layout Constraint System

```css
/* styles/layouts.css */
.wp-site-blocks {
  display: flex;
  flex-direction: column;
  gap: var(--wp--custom--spacing--gap);
}

/* Layout constraint classes */
.is-layout-constrained {
  max-width: var(--wp--style--global--content-size);
  margin-left: auto;
  margin-right: auto;
}

.is-layout-constrained > .alignwide {
  max-width: var(--wp--style--global--wide-size);
  margin-left: auto;
  margin-right: auto;
}

.is-layout-constrained > .alignfull {
  max-width: none;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.has-global-padding {
  padding-left: var(--wp--preset--spacing--medium);
  padding-right: var(--wp--preset--spacing--medium);
}

/* Alignment classes */
.alignleft {
  float: left;
  margin-right: var(--wp--preset--spacing--medium);
  margin-bottom: var(--wp--preset--spacing--small);
}

.alignright {
  float: right;
  margin-left: var(--wp--preset--spacing--medium);
  margin-bottom: var(--wp--preset--spacing--small);
}

.aligncenter {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive alignment behavior */
@media (max-width: 600px) {
  .alignleft,
  .alignright {
    float: none;
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
}

/* Column layout system */
.wp-block-columns {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wp--custom--spacing--gap);
}

.wp-block-column {
  flex: 1;
  min-width: 0;
}

/* Column responsive stacking */
@media (max-width: 781px) {
  .wp-block-columns:not(.is-not-stacked-on-mobile) {
    flex-direction: column;
  }
  
  .wp-block-columns:not(.is-not-stacked-on-mobile) > .wp-block-column {
    flex-basis: 100% !important;
  }
}

/* Vertical alignment for columns */
.wp-block-columns.are-vertically-aligned-top {
  align-items: flex-start;
}

.wp-block-columns.are-vertically-aligned-center {
  align-items: center;
}

.wp-block-columns.are-vertically-aligned-bottom {
  align-items: flex-end;
}
```

---

## 5. State Management Architecture

### Multi-Store Strategy

```typescript
// stores/editor.ts - Block Editor State with Zustand + Immer
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type { BlockInstance } from '@/types/blocks';

interface EditorState {
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  history: {
    past: BlockInstance[][];
    present: BlockInstance[];
    future: BlockInstance[][];
  };
  isCollaborating: boolean;
  collaborators: Array<{ id: string; cursor: number; name: string }>;
}

interface EditorActions {
  insertBlock: (block: BlockInstance, index?: number) => void;
  updateBlockAttributes: (blockId: string, attributes: Record<string, any>) => void;
  deleteBlock: (blockId: string) => void;
  selectBlock: (blockId: string | null) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  updateCollaboratorCursor: (userId: string, cursor: number, name: string) => void;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      blocks: [],
      selectedBlockId: null,
      history: { past: [], present: [], future: [] },
      isCollaborating: false,
      collaborators: [],

      // Actions
      insertBlock: (block, index) => set((state) => {
        // Save current state to history
        state.history.past.push([...state.blocks]);
        state.history.future = [];
        
        if (index !== undefined) {
          state.blocks.splice(index, 0, block);
        } else {
          state.blocks.push(block);
        }
        
        state.selectedBlockId = block.id;
        state.history.present = [...state.blocks];
      }),

      updateBlockAttributes: (blockId, attributes) => set((state) => {
        const updateBlockRecursively = (blocks: BlockInstance[]): boolean => {
          for (const block of blocks) {
            if (block.id === blockId) {
              Object.assign(block.attributes, attributes);
              return true;
            }
            if (block.innerBlocks && updateBlockRecursively(block.innerBlocks)) {
              return true;
            }
          }
          return false;
        };

        updateBlockRecursively(state.blocks);
        state.history.present = [...state.blocks];
      }),

      deleteBlock: (blockId) => set((state) => {
        state.history.past.push([...state.blocks]);
        state.history.future = [];
        
        const filterBlocks = (blocks: BlockInstance[]): BlockInstance[] => {
          return blocks
            .filter(block => block.id !== blockId)
            .map(block => ({
              ...block,
              innerBlocks: filterBlocks(block.innerBlocks)
            }));
        };

        state.blocks = filterBlocks(state.blocks);
        state.selectedBlockId = null;
        state.history.present = [...state.blocks];
      }),

      selectBlock: (blockId) => set({ selectedBlockId: blockId }),

      moveBlock: (fromIndex, toIndex) => set((state) => {
        state.history.past.push([...state.blocks]);
        state.history.future = [];
        
        const [movedBlock] = state.blocks.splice(fromIndex, 1);
        state.blocks.splice(toIndex, 0, movedBlock);
        state.history.present = [...state.blocks];
      }),

      undo: () => set((state) => {
        if (state.history.past.length > 0) {
          const previous = state.history.past.pop()!;
          state.history.future.unshift([...state.blocks]);
          state.blocks = previous;
          state.history.present = previous;
        }
      }),

      redo: () => set((state) => {
        if (state.history.future.length > 0) {
          const next = state.history.future.shift()!;
          state.history.past.push([...state.blocks]);
          state.blocks = next;
          state.history.present = next;
        }
      }),

      clearHistory: () => set((state) => {
        state.history = { past: [], present: [...state.blocks], future: [] };
      }),

      updateCollaboratorCursor: (userId, cursor, name) => set((state) => {
        const existingIndex = state.collaborators.findIndex(c => c.id === userId);
        if (existingIndex >= 0) {
          state.collaborators[existingIndex] = { id: userId, cursor, name };
        } else {
          state.collaborators.push({ id: userId, cursor, name });
        }
      }),
    })),
    { name: 'block-editor' }
  )
);

// stores/design-system.ts - Theme and Customization State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DesignSystemState {
  theme: 'light' | 'dark' | 'high-contrast';
  customProperties: Record<string, string>;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  animationPreferences: 'full' | 'reduced' | 'none';
  userCustomizations: Record<string, any>;
}

interface DesignSystemActions {
  setTheme: (theme: string) => void;
  updateCustomProperty: (property: string, value: string) => void;
  updateMultipleProperties: (properties: Record<string, string>) => void;
  setBreakpoint: (breakpoint: string) => void;
  setAnimationPreferences: (preference: string) => void;
  applyThemeToDOM: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_CSS_PROPERTIES = {
  '--wp--preset--color--primary': '#cc0000',
  '--wp--preset--color--secondary': '#7a0000',
  '--wp--preset--font-family--primary': 'Outfit, sans-serif',
  // ... all other CSS custom properties
};

export const useDesignSystemStore = create<DesignSystemState & DesignSystemActions>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'light',
      customProperties: DEFAULT_CSS_PROPERTIES,
      breakpoint: 'desktop',
      animationPreferences: 'full',
      userCustomizations: {},

      // Actions
      setTheme: (theme) => set({ theme }, false, 'setTheme'),
      
      updateCustomProperty: (property, value) => set((state) => ({
        customProperties: {
          ...state.customProperties,
          [property]: value
        }
      }), false, 'updateCustomProperty'),

      updateMultipleProperties: (properties) => set((state) => ({
        customProperties: {
          ...state.customProperties,
          ...properties
        }
      }), false, 'updateMultipleProperties'),

      setBreakpoint: (breakpoint) => set({ breakpoint }, false, 'setBreakpoint'),
      
      setAnimationPreferences: (preference) => set({ animationPreferences: preference }, false, 'setAnimationPreferences'),

      applyThemeToDOM: () => {
        const { customProperties } = get();
        const root = document.documentElement;
        Object.entries(customProperties).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
      },

      resetToDefaults: () => set({
        customProperties: DEFAULT_CSS_PROPERTIES,
        userCustomizations: {}
      }, false, 'resetToDefaults'),
    }),
    {
      name: 'design-system-storage',
      partialize: (state) => ({
        theme: state.theme,
        customProperties: state.customProperties,
        animationPreferences: state.animationPreferences,
        userCustomizations: state.userCustomizations
      })
    }
  )
);

// stores/organizing.ts - Property Data and Campaign State
import { create } from 'zustand';
import type { Property, CorporateEntity, Campaign } from '@/types/organizing';

interface OrganizingState {
  properties: Property[];
  corporateLandlords: CorporateEntity[];
  activeCampaigns: Campaign[];
  selectedProperties: string[];
  mapFilters: {
    showCorporateOnly: boolean;
    minPropertyCount: number;
    highlightLandlords: string[];
  };
  campaignUpdates: Record<string, any>;
}

interface OrganizingActions {
  setProperties: (properties: Property[]) => void;
  setCorporateLandlords: (landlords: CorporateEntity[]) => void;
  setActiveCampaigns: (campaigns: Campaign[]) => void;
  togglePropertySelection: (propertyId: string) => void;
  updateMapFilters: (filters: Partial<OrganizingState['mapFilters']>) => void;
  addCampaignUpdate: (campaignId: string, update: any) => void;
}

export const useOrganizingStore = create<OrganizingState & OrganizingActions>((set, get) => ({
  // Initial state
  properties: [],
  corporateLandlords: [],
  activeCampaigns: [],
  selectedProperties: [],
  mapFilters: {
    showCorporateOnly: false,
    minPropertyCount: 5,
    highlightLandlords: []
  },
  campaignUpdates: {},

  // Actions
  setProperties: (properties) => set({ properties }),
  setCorporateLandlords: (landlords) => set({ corporateLandlords: landlords }),
  setActiveCampaigns: (campaigns) => set({ activeCampaigns: campaigns }),
  
  togglePropertySelection: (propertyId) => set((state) => {
    const isSelected = state.selectedProperties.includes(propertyId);
    return {
      selectedProperties: isSelected 
        ? state.selectedProperties.filter(id => id !== propertyId)
        : [...state.selectedProperties, propertyId]
    };
  }),
  
  updateMapFilters: (filters) => set((state) => ({
    mapFilters: { ...state.mapFilters, ...filters }
  })),
  
  addCampaignUpdate: (campaignId, update) => set((state) => ({
    campaignUpdates: {
      ...state.campaignUpdates,
      [campaignId]: update
    }
  })),
}));
```

### Server State Management with TanStack Query

```typescript
// hooks/useOrganizingData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, CorporateEntity, Campaign } from '@/types/organizing';

// Property data queries with sophisticated caching
export const useProperties = (filters?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 10, // 10 minutes for data freshness
  });
};

// Corporate landlord portfolio tracking
export const useCorporateLandlords = () => {
  return useQuery({
    queryKey: ['corporate-landlords'],
    queryFn: fetchCorporateLandlords,
    select: (data: CorporateEntity[]) => {
      return data.map(landlord => ({
        ...landlord,
        portfolioValue: landlord.properties.reduce((sum, prop) => sum + prop.assessedValue, 0),
        organizingPriority: calculateOrganizingPriority(landlord)
      }));
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Campaign management with optimistic updates
export const useCampaignUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCampaign,
    onMutate: async (updatedCampaign) => {
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });
      
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(['campaigns']);
      
      queryClient.setQueryData<Campaign[]>(['campaigns'], (old = []) =>
        old.map(campaign => 
          campaign.id === updatedCampaign.id 
            ? { ...campaign, ...updatedCampaign } 
            : campaign
        )
      );
      
      return { previousCampaigns };
    },
    onError: (err, updatedCampaign, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(['campaigns'], context.previousCampaigns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });
};

// Content management queries
export const useContentByType = (contentType: 'blog' | 'stories' | 'events') => {
  return useQuery({
    queryKey: ['content', contentType],
    queryFn: () => fetchContentByType(contentType),
    staleTime: 1000 * 60 * 2, // 2 minutes for content freshness
  });
};
```

---

## 6. Security Implementation

### Progressive Security Architecture

```typescript
// lib/auth/security-tiers.ts
export interface SecurityTier {
  level: 'basic' | 'intermediate' | 'advanced';
  requirements: {
    timeGate?: number; // milliseconds
    verificationRequired?: boolean;
    twoFactorRequired?: boolean;
    deviceRestrictions?: string[];
  };
  permissions: {
    viewSensitiveData?: boolean;
    accessCampaignTools?: boolean;
    viewPropertyIntelligence?: boolean;
    moderateContent?: boolean;
  };
}

export const SECURITY_TIERS: Record<string, SecurityTier> = {
  basic: {
    level: 'basic',
    requirements: {
      timeGate: 0,
      verificationRequired: false,
      twoFactorRequired: false,
    },
    permissions: {
      viewSensitiveData: false,
      accessCampaignTools: false,
      viewPropertyIntelligence: false,
      moderateContent: false,
    }
  },
  
  intermediate: {
    level: 'intermediate',
    requirements: {
      timeGate: 1000 * 60 * 60 * 24 * 14, // 14 days
      verificationRequired: true,
      twoFactorRequired: false,
    },
    permissions: {
      viewSensitiveData: false,
      accessCampaignTools: true,
      viewPropertyIntelligence: true,
      moderateContent: false,
    }
  },
  
  advanced: {
    level: 'advanced',
    requirements: {
      timeGate: 1000 * 60 * 60 * 24 * 90, // 90 days
      verificationRequired: true,
      twoFactorRequired: true,
      deviceRestrictions: ['trusted-devices-only']
    },
    permissions: {
      viewSensitiveData: true,
      accessCampaignTools: true,
      viewPropertyIntelligence: true,
      moderateContent: true,
    }
  }
};

// Security context implementation
import { createContext, useContext, useReducer, useEffect } from 'react';
import CryptoJS from 'crypto-js';

interface SecurityState {
  currentTier: SecurityTier['level'];
  unlockedTiers: SecurityTier['level'][];
  timeGates: Record<string, { startsAt: Date; unlocksAt: Date; progress: number }>;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  memberVouchers: Array<{ voucherId: string; timestamp: Date }>;
  encryptedData: Record<string, string>;
}

type SecurityAction = 
  | { type: 'START_TIME_GATE'; payload: { tier: string; duration: number } }
  | { type: 'UNLOCK_TIER'; payload: string }
  | { type: 'UPDATE_VERIFICATION'; payload: SecurityState['verificationStatus'] }
  | { type: 'ADD_VOUCHER'; payload: { voucherId: string } }
  | { type: 'STORE_ENCRYPTED'; payload: { key: string; data: string } };

const SecurityContext = createContext<{
  state: SecurityState;
  actions: {
    startTimeGate: (tier: string, duration: number) => void;
    updateVerification: (status: SecurityState['verificationStatus']) => void;
    addMemberVoucher: (voucherId: string) => void;
    encryptAndStore: (key: string, data: any, password: string) => void;
    decryptData: (key: string, password: string) => any | null;
  };
} | null>(null);

export const SecurityProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(securityReducer, {
    currentTier: 'basic',
    unlockedTiers: ['basic'],
    timeGates: {},
    verificationStatus: 'pending',
    memberVouchers: [],
    encryptedData: {},
  });

  // Time gate monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      Object.entries(state.timeGates).forEach(([tier, gate]) => {
        if (now >= gate.unlocksAt && !state.unlockedTiers.includes(tier as any)) {
          dispatch({ type: 'UNLOCK_TIER', payload: tier });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.timeGates, state.unlockedTiers]);

  const actions = {
    startTimeGate: (tier: string, duration: number) => {
      dispatch({
        type: 'START_TIME_GATE',
        payload: { tier, duration }
      });
    },

    updateVerification: (status: SecurityState['verificationStatus']) => {
      dispatch({ type: 'UPDATE_VERIFICATION', payload: status });
    },

    addMemberVoucher: (voucherId: string) => {
      dispatch({ type: 'ADD_VOUCHER', payload: { voucherId } });
    },

    encryptAndStore: (key: string, data: any, password: string) => {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
      dispatch({ type: 'STORE_ENCRYPTED', payload: { key, data: encrypted } });
    },

    decryptData: (key: string, password: string) => {
      const encrypted = state.encryptedData[key];
      if (!encrypted) return null;
      
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      } catch {
        return null;
      }
    },
  };

  return (
    <SecurityContext.Provider value={{ state, actions }}>
      {children}
    </SecurityContext.Provider>
  );
};

// Security hook for components
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

// Higher-order component for security protection
export function withSecurityTier<P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: SecurityTier['level']
) {
  return function SecuredComponent(props: P) {
    const { state } = useSecurity();
    
    if (!state.unlockedTiers.includes(requiredTier)) {
      return (
        <div className="security-gate">
          <h2>Access Restricted</h2>
          <p>This feature requires {requiredTier} security clearance.</p>
          {/* Time gate progress indicator */}
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}
```

### Address Privacy Protection

```typescript
// lib/privacy/address-hashing.ts
import CryptoJS from 'crypto-js';

export class AddressPrivacyManager {
  private salt: string;
  
  constructor() {
    this.salt = this.loadOrGenerateSalt();
  }
  
  private loadOrGenerateSalt(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('address-salt');
      if (stored) return stored;
    }
    
    const newSalt = CryptoJS.lib.WordArray.random(32).toString();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('address-salt', newSalt);
    }
    
    return newSalt;
  }
  
  hashAddress(address: string): string {
    const normalized = address.toUpperCase().trim().replace(/\s+/g, ' ');
    return CryptoJS.SHA256(normalized + this.salt).toString();
  }
  
  hashCoordinates(lat: number, lng: number, precision = 6): string {
    const roundedLat = Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision);
    const roundedLng = Math.round(lng * Math.pow(10, precision)) / Math.pow(10, precision);
    const coordString = `${roundedLat},${roundedLng}`;
    
    return CryptoJS.SHA256(coordString + this.salt).toString();
  }
  
  // Generate geographic cluster hash (for organizing without exposing exact locations)
  generateClusterHash(addresses: string[]): string {
    const sortedHashes = addresses.map(addr => this.hashAddress(addr)).sort();
    const clusterKey = sortedHashes.join('|');
    
    return CryptoJS.SHA256(clusterKey + this.salt).toString().substring(0, 16);
  }
}

// Usage in components
export const useAddressPrivacy = () => {
  const [manager] = useState(() => new AddressPrivacyManager());
  
  const hashAddress = useCallback((address: string) => {
    return manager.hashAddress(address);
  }, [manager]);
  
  const hashCoordinates = useCallback((lat: number, lng: number) => {
    return manager.hashCoordinates(lat, lng);
  }, [manager]);
  
  const generateClusterHash = useCallback((addresses: string[]) => {
    return manager.generateClusterHash(addresses);
  }, [manager]);
  
  return { hashAddress, hashCoordinates, generateClusterHash };
};
```

---

## 7. Content Management System

### Content Types and Schema

```typescript
// types/content.ts
export interface BaseContent {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: BlockInstance[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    role: 'member' | 'organizer' | 'admin';
  };
  tags: string[];
  featured: boolean;
  seoMeta: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

export interface BlogPost extends BaseContent {
  type: 'blog';
  category: string;
  readingTime: number;
  featuredImage?: string;
  relatedPosts?: string[];
}

export interface MemberStory extends BaseContent {
  type: 'story';
  storyType: 'victory' | 'struggle' | 'organizing-tip' | 'personal-impact';
  location?: {
    neighborhood?: string;
    property?: string;
    landlord?: string;
  };
  impactLevel: 'individual' | 'building' | 'portfolio' | 'system-wide';
  sensitivityLevel: 'public' | 'members-only' | 'organizers-only';
  campaignConnection?: string;
  anonymize: boolean;
}

export interface OrganizingEvent extends BaseContent {
  type: 'event';
  eventDate: Date;
  endDate?: Date;
  location: {
    name: string;
    address: string;
    virtual?: boolean;
    coordinates?: [number, number];
  };
  capacity?: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  eventType: 'meeting' | 'action' | 'training' | 'social' | 'strategy';
  securityLevel: 'open' | 'members-only' | 'organizers-only';
  relatedCampaign?: string;
}

export interface LegalUpdate extends BaseContent {
  type: 'legal';
  caseType: 'eviction-defense' | 'housing-violation' | 'discrimination' | 'policy-advocacy';
  caseNumber?: string;
  courtJurisdiction?: string;
  involvedParties: {
    tenants?: string[];
    landlords?: string[];
    legalAid?: string[];
  };
  caseStatus: 'active' | 'settled' | 'victory' | 'appeal' | 'closed';
  publicRecord: boolean;
  documentsAvailable: boolean;
  impactAssessment?: string;
}

export type Content = BlogPost | MemberStory | OrganizingEvent | LegalUpdate;
```

### Content API Implementation

```typescript
// app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getContent, createContent, updateContent, deleteContent } from '@/lib/content/service';
import { validateContentSchema } from '@/lib/content/validation';
import { authenticateUser, checkPermissions } from '@/lib/auth/service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get('type');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const content = await getContent({
      type: contentType as any,
      status: status as any,
      limit,
      offset,
    });

    return NextResponse.json({
      content,
      pagination: {
        limit,
        offset,
        total: content.length, // This would come from a count query in real implementation
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const hasPermission = await checkPermissions(user.id, 'create-content');
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = validateContentSchema(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.errors },
        { status: 400 }
      );
    }

    const content = await createContent({
      ...body,
      author: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
```

### Content Editor Component

```typescript
// components/editor/ContentEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlockEditor } from '@/components/blocks/BlockEditor';
import { useEditorStore } from '@/stores/editor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Content } from '@/types/content';
import { contentSchema } from '@/lib/content/validation';

interface ContentEditorProps {
  content?: Content;
  contentType: 'blog' | 'story' | 'event' | 'legal';
  onSave?: (content: Content) => void;
  onCancel?: () => void;
}

export function ContentEditor({ 
  content, 
  contentType, 
  onSave, 
  onCancel 
}: ContentEditorProps) {
  const { blocks, updateBlocks } = useEditorStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<Content>({
    resolver: zodResolver(contentSchema),
    defaultValues: content || {
      type: contentType,
      title: '',
      slug: '',
      excerpt: '',
      content: [],
      status: 'draft',
      tags: [],
      featured: false,
    },
  });

  // Auto-generate slug from title
  const title = watch('title');
  useEffect(() => {
    if (title && !content) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [title, setValue, content]);

  const saveContentMutation = useMutation({
    mutationFn: async (contentData: Content) => {
      const response = await fetch('/api/content', {
        method: content ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          content: blocks,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
      return response.json();
    },
    onSuccess: (savedContent) => {
      queryClient.invalidateQueries({ queryKey: ['content', contentType] });
      onSave?.(savedContent);
    },
  });

  const onSubmit = (data: Content) => {
    saveContentMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="content-editor">
      <div className="editor-header">
        <div className="title-section">
          <input
            {...register('title')}
            placeholder="Enter title..."
            className="title-input"
            autoFocus
          />
          {errors.title && (
            <span className="error">{errors.title.message}</span>
          )}
        </div>

        <div className="meta-section">
          <input
            {...register('slug')}
            placeholder="content-slug"
            className="slug-input"
          />
          
          <input
            {...register('excerpt')}
            placeholder="Brief description..."
            className="excerpt-input"
          />
        </div>

        <div className="publishing-controls">
          <select {...register('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>

          {contentType === 'story' && (
            <select {...register('sensitivityLevel')}>
              <option value="public">Public</option>
              <option value="members-only">Members Only</option>
              <option value="organizers-only">Organizers Only</option>
            </select>
          )}

          <label>
            <input type="checkbox" {...register('featured')} />
            Featured Content
          </label>
        </div>
      </div>

      <div className="editor-content">
        <BlockEditor
          value={blocks}
          onChange={updateBlocks}
          placeholder="Start writing your content..."
        />
      </div>

      <div className="editor-footer">
        <div className="save-status">
          {isDirty && <span className="unsaved">Unsaved changes</span>}
          {saveContentMutation.isPending && <span className="saving">Saving...</span>}
          {saveContentMutation.isSuccess && <span className="saved">Saved</span>}
        </div>

        <div className="actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saveContentMutation.isPending}
            className="btn-primary"
          >
            {saveContentMutation.isPending ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </div>
    </form>
  );
}
```

---

## 8. Organizing Intelligence Integration

### Property Data Visualization

```typescript
// components/organizing/PropertyMap.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrganizingStore } from '@/stores/organizing';
import { useAddressPrivacy } from '@/lib/privacy/address-hashing';
import type { Property, CorporateEntity } from '@/types/organizing';

interface PropertyMapProps {
  center: [number, number];
  zoom: number;
  properties: Property[];
  showCorporateOwnership?: boolean;
  highlightLandlords?: string[];
}

export function PropertyMap({
  center,
  zoom,
  properties,
  showCorporateOwnership = true,
  highlightLandlords = []
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { mapFilters, updateMapFilters, selectedProperties, togglePropertySelection } = useOrganizingStore();
  const { hashCoordinates } = useAddressPrivacy();
  
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize Leaflet map
    mapInstance.current = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  // Update map markers when properties change
  useEffect(() => {
    if (!mapInstance.current || !properties.length) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    // Filter properties based on current filters
    const filteredProperties = properties.filter(property => {
      if (showCorporateOwnership && !property.isCorporateOwned) return false;
      if (mapFilters.minPropertyCount > 1 && (property.landlordPropertyCount || 0) < mapFilters.minPropertyCount) return false;
      if (highlightLandlords.length > 0 && !highlightLandlords.includes(property.ownerId)) return false;
      return true;
    });

    // Create markers for filtered properties
    filteredProperties.forEach(property => {
      if (!property.coordinates) return;

      const isSelected = selectedProperties.includes(property.id);
      const isHighlighted = highlightLandlords.includes(property.ownerId);
      
      // Create marker with different colors based on ownership type
      const markerColor = property.isCorporateOwned 
        ? (isHighlighted ? '#cc0000' : '#ff6600')
        : '#4a90e2';

      const marker = L.circleMarker(property.coordinates, {
        radius: isSelected ? 10 : 6,
        fillColor: markerColor,
        color: isSelected ? '#000000' : markerColor,
        weight: isSelected ? 3 : 1,
        opacity: 1,
        fillOpacity: 0.7
      });

      // Create popup with property information
      const popupContent = `
        <div class="property-popup">
          <h3>${property.address}</h3>
          <p><strong>Owner:</strong> ${property.ownerName}</p>
          <p><strong>Assessed Value:</strong> $${property.assessedValue?.toLocaleString()}</p>
          ${property.units ? `<p><strong>Units:</strong> ${property.units}</p>` : ''}
          ${property.isCorporateOwned ? `<p><strong>Portfolio Size:</strong> ${property.landlordPropertyCount} properties</p>` : ''}
          <button onclick="window.selectProperty('${property.id}')" class="btn-primary">
            ${isSelected ? 'Deselect' : 'Select'} Property
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(mapInstance.current!);

      // Add click handler for property selection
      marker.on('click', () => {
        togglePropertySelection(property.id);
      });
    });

    // Make selectProperty function available globally for popup buttons
    (window as any).selectProperty = (propertyId: string) => {
      togglePropertySelection(propertyId);
    };

  }, [properties, showCorporateOwnership, highlightLandlords, mapFilters, selectedProperties, togglePropertySelection]);

  return (
    <div className="property-map-container">
      <div className="map-controls">
        <div className="filter-controls">
          <label>
            <input
              type="checkbox"
              checked={showCorporateOwnership}
              onChange={(e) => updateMapFilters({ showCorporateOnly: e.target.checked })}
            />
            Show only corporate-owned properties
          </label>
          
          <div className="min-properties-filter">
            <label>
              Minimum portfolio size:
              <input
                type="range"
                min="1"
                max="50"
                value={mapFilters.minPropertyCount}
                onChange={(e) => updateMapFilters({ minPropertyCount: parseInt(e.target.value) })}
              />
              <span>{mapFilters.minPropertyCount} properties</span>
            </label>
          </div>
        </div>

        <div className="selection-info">
          {selectedProperties.length > 0 && (
            <div className="selected-count">
              {selectedProperties.length} properties selected
              <button 
                onClick={() => selectedProperties.forEach(id => togglePropertySelection(id))}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        ref={mapRef} 
        className="leaflet-map" 
        style={{ height: '500px', width: '100%' }}
      />

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff6600' }}></div>
          <span>Corporate-owned properties</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#cc0000' }}></div>
          <span>Highlighted landlords</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4a90e2' }}></div>
          <span>Individual ownership</span>
        </div>
      </div>
    </div>
  );
}

// Corporate Analysis Dashboard
// components/organizing/CorporateAnalysis.tsx
'use client';
import { useMemo } from 'react';
import { useCorporateLandlords } from '@/hooks/useOrganizingData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CorporateAnalysis() {
  const { data: corporateLandlords, isLoading } = useCorporateLandlords();

  const analysisData = useMemo(() => {
    if (!corporateLandlords) return [];

    return corporateLandlords
      .slice(0, 10) // Top 10 landlords
      .map(landlord => ({
        name: landlord.name.length > 20 
          ? landlord.name.substring(0, 20) + '...' 
          : landlord.name,
        properties: landlord.propertyCount,
        units: landlord.totalUnits || landlord.propertyCount,
        value: Math.round(landlord.portfolioValue / 1000000 * 10) / 10, // Millions
        organizingPriority: landlord.organizingPriority,
      }));
  }, [corporateLandlords]);

  if (isLoading) {
    return <div className="loading-spinner">Loading corporate analysis...</div>;
  }

  return (
    <div className="corporate-analysis">
      <div className="analysis-header">
        <h2>Corporate Landlord Analysis</h2>
        <div className="key-metrics">
          <div className="metric">
            <span className="metric-value">{corporateLandlords?.length || 0}</span>
            <span className="metric-label">Corporate Entities</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {Math.round((corporateLandlords?.reduce((sum, l) => sum + l.portfolioValue, 0) || 0) / 1000000)}M
            </span>
            <span className="metric-label">Total Portfolio Value</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {corporateLandlords?.reduce((sum, l) => sum + (l.totalUnits || l.propertyCount), 0) || 0}
            </span>
            <span className="metric-label">Total Units</span>
          </div>
        </div>
      </div>

      <div className="portfolio-chart">
        <h3>Top Corporate Landlords by Property Count</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analysisData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'properties') return [value, 'Properties'];
                if (name === 'units') return [value, 'Units'];
                if (name === 'value') return [`$${value}M`, 'Portfolio Value'];
                return [value, name];
              }}
            />
            <Bar dataKey="properties" fill="#cc0000" name="properties" />
            <Bar dataKey="units" fill="#7a0000" name="units" />
            <Bar dataKey="value" fill="#ff6600" name="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="organizing-targets">
        <h3>High-Priority Organizing Targets</h3>
        <div className="targets-grid">
          {analysisData
            .filter(landlord => landlord.organizingPriority >= 7)
            .map(landlord => (
              <div key={landlord.name} className="target-card">
                <h4>{landlord.name}</h4>
                <div className="target-stats">
                  <span>{landlord.properties} properties</span>
                  <span>{landlord.units} units</span>
                  <span>${landlord.value}M portfolio</span>
                </div>
                <div className="priority-indicator">
                  <span className="priority-label">Organizing Priority:</span>
                  <div className="priority-bar">
                    <div 
                      className="priority-fill"
                      style={{ 
                        width: `${landlord.organizingPriority * 10}%`,
                        backgroundColor: landlord.organizingPriority >= 8 ? '#cc0000' : '#ff6600'
                      }}
                    />
                  </div>
                  <span>{landlord.organizingPriority}/10</span>
                </div>
                <button className="btn-primary campaign-btn">
                  Start Campaign
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Performance Optimization

### Code Splitting and Bundle Optimization

```typescript
// components/blocks/LazyBlockLoader.tsx
import { lazy, Suspense } from 'react';
import type { BlockDefinition } from '@/types/blocks';

// Dynamic block loading with error boundaries
const BlockLoader: React.FC<{ 
  blockName: string; 
  props: any;
  fallback?: React.ComponentType 
}> = ({ blockName, props, fallback: FallbackComponent }) => {
  
  const BlockComponent = lazy(() => 
    import(`@/components/blocks/${blockName}`)
      .then(module => ({ default: module.default || module[blockName] }))
      .catch(() => import('@/components/blocks/FallbackBlock'))
  );

  const fallback = FallbackComponent 
    ? <FallbackComponent />
    : <div className="block-loading">Loading {blockName}...</div>;

  return (
    <Suspense fallback={fallback}>
      <BlockComponent {...props} />
    </Suspense>
  );
};

// Block preloader for performance
export class BlockPreloader {
  private preloadedBlocks = new Set<string>();
  private preloadQueue = new Map<string, Promise<any>>();

  async preloadBlock(blockName: string): Promise<void> {
    if (this.preloadedBlocks.has(blockName) || this.preloadQueue.has(blockName)) {
      return;
    }

    const preloadPromise = import(`@/components/blocks/${blockName}`)
      .then(() => {
        this.preloadedBlocks.add(blockName);
        this.preloadQueue.delete(blockName);
      })
      .catch(error => {
        console.warn(`Failed to preload block: ${blockName}`, error);
        this.preloadQueue.delete(blockName);
      });

    this.preloadQueue.set(blockName, preloadPromise);
    return preloadPromise;
  }

  preloadBlocksFromContent(content: any[]): void {
    const blockTypes = new Set<string>();
    
    const extractBlocks = (blocks: any[]) => {
      blocks.forEach(block => {
        if (block.name) blockTypes.add(block.name);
        if (block.innerBlocks) extractBlocks(block.innerBlocks);
      });
    };

    extractBlocks(content);
    blockTypes.forEach(blockType => this.preloadBlock(blockType));
  }

  getPreloadStatus(): { loaded: string[]; loading: string[] } {
    return {
      loaded: Array.from(this.preloadedBlocks),
      loading: Array.from(this.preloadQueue.keys())
    };
  }
}

// Global preloader instance
export const blockPreloader = new BlockPreloader();
```

### Virtual Scrolling for Large Datasets

```typescript
// components/organizing/VirtualizedPropertyList.tsx
import { FixedSizeList as List, areEqual } from 'react-window';
import { memo } from 'react';
import type { Property } from '@/types/organizing';

interface PropertyRowProps {
  index: number;
  style: React.CSSProperties;
  data: Property[];
}

const PropertyRow = memo<PropertyRowProps>(({ index, style, data }) => {
  const property = data[index];
  const { togglePropertySelection, selectedProperties } = useOrganizingStore();
  const isSelected = selectedProperties.includes(property.id);

  return (
    <div style={style} className={`property-row ${isSelected ? 'selected' : ''}`}>
      <div className="property-info">
        <h4>{property.address}</h4>
        <p className="owner-name">{property.ownerName}</p>
        <div className="property-details">
          <span className="assessed-value">
            ${property.assessedValue?.toLocaleString()}
          </span>
          {property.units && (
            <span className="unit-count">{property.units} units</span>
          )}
          {property.isCorporateOwned && (
            <span className="corporate-badge">Corporate</span>
          )}
        </div>
      </div>
      <div className="property-actions">
        <button
          onClick={() => togglePropertySelection(property.id)}
          className={`btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}, areEqual);

PropertyRow.displayName = 'PropertyRow';

interface VirtualizedPropertyListProps {
  properties: Property[];
  height?: number;
  itemHeight?: number;
}

export function VirtualizedPropertyList({ 
  properties, 
  height = 600, 
  itemHeight = 120 
}: VirtualizedPropertyListProps) {
  return (
    <div className="virtualized-property-list">
      <div className="list-header">
        <span>{properties.length} properties</span>
      </div>
      <List
        height={height}
        itemCount={properties.length}
        itemSize={itemHeight}
        itemData={properties}
        overscanCount={5}
      >
        {PropertyRow}
      </List>
    </div>
  );
}
```

### Efficient Data Fetching

```typescript
// hooks/useOptimizedQueries.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Optimized property data fetching with pagination
export const useInfiniteProperties = (filters?: PropertyFilters) => {
  return useInfiniteQuery({
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam = 0 }) => 
      fetchProperties({
        ...filters,
        offset: pageParam,
        limit: 50,
      }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 50 ? pages.length * 50 : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Memoized data transformations for performance
export const useTransformedCorporateData = () => {
  const { data: corporateLandlords } = useCorporateLandlords();

  return useMemo(() => {
    if (!corporateLandlords) return [];

    return corporateLandlords.map(landlord => ({
      ...landlord,
      portfolioValue: landlord.properties.reduce((sum, prop) => sum + prop.assessedValue, 0),
      averagePropertyValue: landlord.properties.length > 0 
        ? landlord.properties.reduce((sum, prop) => sum + prop.assessedValue, 0) / landlord.properties.length 
        : 0,
      organizingPriority: calculateOrganizingPriority(landlord),
      geographic Concentration: calculateGeographicConcentration(landlord.properties),
    }));
  }, [corporateLandlords]);
};

// Debounced search hook
export const useDebouncedPropertySearch = (searchTerm: string, delay = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return useQuery({
    queryKey: ['properties', 'search', debouncedTerm],
    queryFn: () => searchProperties(debouncedTerm),
    enabled: debouncedTerm.length >= 3,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation Setup (Week 1-2)

**Week 1: Project Initialization**
- [ ] Set up Next.js 15 project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Implement basic design system with CSS custom properties
- [ ] Set up database integration (SQLite + Prisma)
- [ ] Create basic project structure and folders
- [ ] Implement authentication system foundation

**Week 2: Core Architecture**
- [ ] Build block registry system
- [ ] Implement basic block components (header, paragraph, image)
- [ ] Set up state management stores (Zustand)
- [ ] Create layout constraint system
- [ ] Implement basic routing structure
- [ ] Set up development tooling (ESLint, Prettier, Husky)

### Phase 2: Content Management (Week 3-4)

**Week 3: Block System**
- [ ] Implement remaining core blocks (columns, navigation, etc.)
- [ ] Build block editor interface
- [ ] Add undo/redo functionality to editor
- [ ] Create block validation and error handling
- [ ] Implement block preloading system
- [ ] Add organizing-specific blocks (property map, campaign callout)

**Week 4: Content Types**
- [ ] Implement content management API endpoints
- [ ] Build content editor components
- [ ] Add content type schemas and validation
- [ ] Create content listing and management interfaces
- [ ] Implement SEO metadata management
- [ ] Add content scheduling functionality

### Phase 3: Organizing Intelligence (Week 5-6)

**Week 5: Data Integration**
- [ ] Connect to existing property database (192K+ records)
- [ ] Implement property data API endpoints
- [ ] Build interactive property mapping with Leaflet
- [ ] Create corporate landlord analysis dashboard
- [ ] Add property search and filtering
- [ ] Implement address privacy hashing

**Week 6: Advanced Analytics**
- [ ] Build portfolio visualization with D3.js
- [ ] Implement campaign planning tools
- [ ] Add geographic clustering analysis
- [ ] Create organizing priority algorithms
- [ ] Build member coordination features
- [ ] Add real-time campaign updates

### Phase 4: Security & Community (Week 7-8)

**Week 7: Security Implementation**
- [ ] Implement three-tier security system
- [ ] Add time gate functionality
- [ ] Build community verification workflows
- [ ] Implement encrypted data storage
- [ ] Add two-factor authentication
- [ ] Create security audit logging

**Week 8: Community Features**
- [ ] Build member directory and profiles
- [ ] Implement member verification system
- [ ] Add community messaging features
- [ ] Create campaign collaboration tools
- [ ] Build organizing event management
- [ ] Add member story collection system

### Phase 5: Performance & Polish (Week 9-10)

**Week 9: Optimization**
- [ ] Implement code splitting and lazy loading
- [ ] Add virtual scrolling for large datasets
- [ ] Optimize database queries and caching
- [ ] Implement service worker for offline capability
- [ ] Add performance monitoring
- [ ] Optimize bundle sizes and loading times

**Week 10: Testing & Deployment**
- [ ] Complete unit test suite
- [ ] Add integration tests for critical paths
- [ ] Implement end-to-end testing
- [ ] Set up CI/CD pipeline
- [ ] Prepare production deployment
- [ ] Create backup and monitoring systems

---

## 11. Development Workflow

### Git Workflow

```bash
# Feature branch workflow
git checkout develop
git pull origin develop
git checkout -b feature/block-editor-system
# ... work on feature
git add .
git commit -m "feat: implement block editor with undo/redo"
git push origin feature/block-editor-system
# Create pull request to develop branch
```

### Code Quality Standards

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "react/display-name": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}

// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false
}
```

### Testing Strategy

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

module.exports = createJestConfig(customJestConfig)
```

---

## 12. Deployment Strategy

### Production Environment

```dockerfile
# Dockerfile
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next ./.next
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://renosparkstenantsunion.org
DATABASE_URL=file:./data/production.db
JWT_SECRET=your-production-jwt-secret
ORGANIZING_DB_PATH=./data/washoe_opendata/washoe_parcels.db
ENCRYPTION_KEY=your-production-encryption-key

# Security settings
ENABLE_MEMBER_VERIFICATION=true
REQUIRE_TWO_FACTOR=true
TIME_GATE_INTERMEDIATE=1209600000  # 14 days in milliseconds
TIME_GATE_ADVANCED=7776000000     # 90 days in milliseconds

# External services
LEAFLET_MAP_API_KEY=your-leaflet-api-key
SMTP_HOST=your-email-host
SMTP_USER=organizing@renosparkstenantsunion.org
```

### Monitoring and Analytics

```typescript
// lib/monitoring/analytics.ts
export class OrganizingAnalytics {
  private static instance: OrganizingAnalytics;
  
  static getInstance(): OrganizingAnalytics {
    if (!this.instance) {
      this.instance = new OrganizingAnalytics();
    }
    return this.instance;
  }
  
  trackOrganizingActivity(event: string, properties: Record<string, any>): void {
    // Privacy-conscious analytics - no personal data
    const anonymizedData = {
      event,
      timestamp: new Date().toISOString(),
      sessionId: this.getAnonymizedSessionId(),
      ...properties
    };
    
    // Send to self-hosted analytics (not third-party)
    this.sendToAnalytics(anonymizedData);
  }
  
  trackCampaignEngagement(campaignId: string, action: string): void {
    this.trackOrganizingActivity('campaign_engagement', {
      campaignId: this.hashId(campaignId),
      action
    });
  }
  
  trackPropertyInteraction(propertyCount: number, interaction: string): void {
    this.trackOrganizingActivity('property_interaction', {
      propertyCount,
      interaction
    });
  }
  
  private getAnonymizedSessionId(): string {
    // Generate session ID that cannot be traced back to individuals
    const sessionData = `${Date.now()}-${Math.random()}`;
    return CryptoJS.SHA256(sessionData).toString().substring(0, 16);
  }
  
  private hashId(id: string): string {
    return CryptoJS.SHA256(id).toString().substring(0, 8);
  }
  
  private sendToAnalytics(data: any): void {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {
      // Fail silently - analytics should never break the user experience
    });
  }
}
```

---

## Conclusion

This comprehensive architecture plan provides a solid foundation for building a sophisticated Next.js application that replicates the WordPress Frost theme functionality while adding powerful tenant organizing capabilities. 

### Key Success Factors

1. **Faithful WordPress Replication**: The block system architecture closely mirrors WordPress's approach while leveraging modern React patterns
2. **Performance-First Design**: Code splitting, virtual scrolling, and optimized state management ensure smooth operation with large datasets
3. **Security-Conscious Implementation**: Progressive security tiers and address privacy protection built from the ground up
4. **Organizing Intelligence Integration**: Seamless integration with existing property data and corporate analysis capabilities
5. **Maintainable Architecture**: Domain-driven design and clear separation of concerns support long-term growth

### Implementation Timeline

The 10-week roadmap provides a structured approach to building this complex platform, with clear milestones and deliverables. The modular architecture allows for parallel development and incremental delivery of features.

### Next Steps

1. **Initialize Project**: Set up the Next.js 15 environment with the specified technology stack
2. **Design System Implementation**: Begin with the CSS custom properties system as the foundation
3. **Block System Development**: Start with core blocks and build up to organizing-specific components
4. **Community Integration**: Engage with the Reno-Sparks Tenants Union for feedback and testing

This architecture plan successfully combines modern web development best practices with the specific needs of community organizing, creating a platform that serves both the technical requirements and the mission of "Homes for People, Not for Profit."