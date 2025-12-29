export interface ReadingDocument {
  id: string;                    // Unique identifier (filename slug)
  title: string;                 // Display title (from filename or frontmatter)
  author: string | null;         // Author name from frontmatter
  date: string | null;           // Publication date from frontmatter (year or full date)
  filename: string;              // Original filename
  category: string;              // Auto-detected category
  excerpt: string;               // First 200 chars of content
  wordCount: number;             // For reading time estimate
  lastModified: string;          // File modification date (ISO string)
  tags: string[];                // Keywords/tags
  slug: string;                  // URL-safe slug
  polished?: boolean;            // Marks curated/high-quality documents
}

export interface ReadingManifest {
  documents: ReadingDocument[];
  categories: string[];
  totalDocuments: number;
}
