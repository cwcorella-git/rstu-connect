export interface ReadingDocument {
  id: string;                    // Unique identifier (filename slug)
  title: string;                 // Display title (from filename or frontmatter)
  filename: string;              // Original filename
  category: string;              // Auto-detected category
  excerpt: string;               // First 200 chars of content
  wordCount: number;             // For reading time estimate
  lastModified: string;          // File modification date (ISO string)
  tags: string[];                // Keywords/tags
  slug: string;                  // URL-safe slug
}

export interface ReadingManifest {
  documents: ReadingDocument[];
  categories: string[];
  totalDocuments: number;
}
