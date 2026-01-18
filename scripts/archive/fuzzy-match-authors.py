#!/usr/bin/env python3
"""
Fuzzy match RSTU Connect documents to Anarchist Library documents to extract author metadata.
"""

import json
import psycopg2
import re
from difflib import SequenceMatcher
from typing import List, Dict, Optional, Tuple

# Database connection parameters
DB_CONFIG = {
    'host': '192.168.1.15',
    'port': 5432,
    'database': 'veritable_games',
    'user': 'postgres',
    'password': 'postgres'
}

def clean_title(title: str) -> str:
    """Clean and normalize a title for matching."""
    # Convert to lowercase
    title = title.lower()
    # Remove special characters and extra whitespace
    title = re.sub(r'[^\w\s]', ' ', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()

def extract_significant_words(title: str, count: int = 5) -> List[str]:
    """Extract significant words from title, excluding common words."""
    stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
                 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
                 'can', 'could', 'may', 'might', 'must', 'that', 'this', 'these', 'those'}

    words = clean_title(title).split()
    significant = [w for w in words if w not in stopwords and len(w) > 2]
    return significant[:count]

def similarity_ratio(str1: str, str2: str) -> float:
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, str1, str2).ratio()

class AuthorMatcher:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.cursor = self.conn.cursor()
        self.matches = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cursor.close()
        self.conn.close()

    def try_exact_match(self, rstu_doc: Dict) -> Optional[Dict]:
        """Try exact title match (case insensitive)."""
        clean_rstu_title = clean_title(rstu_doc['title'])

        query = """
            SELECT title, author, publication_date
            FROM anarchist.documents
            WHERE LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', ' ', 'g')) = %s
            AND author IS NOT NULL AND author != ''
            LIMIT 1
        """

        self.cursor.execute(query, (clean_rstu_title,))
        result = self.cursor.fetchone()

        if result:
            return {
                'rstu_id': rstu_doc['id'],
                'rstu_title': rstu_doc['title'],
                'anarchist_title': result[0],
                'author': result[1],
                'publication_date': result[2],
                'match_method': 'exact',
                'confidence': 1.0
            }
        return None

    def try_contains_match(self, rstu_doc: Dict) -> Optional[Dict]:
        """Try title contains match using significant words."""
        significant_words = extract_significant_words(rstu_doc['title'], 3)

        if not significant_words:
            return None

        # Build ILIKE query for significant words
        conditions = []
        for word in significant_words:
            conditions.append(f"LOWER(title) LIKE '%{word}%'")

        where_clause = " AND ".join(conditions)

        query = f"""
            SELECT title, author, publication_date
            FROM anarchist.documents
            WHERE {where_clause}
            AND author IS NOT NULL AND author != ''
            LIMIT 10
        """

        self.cursor.execute(query)
        results = self.cursor.fetchall()

        if not results:
            return None

        # Find best match by similarity ratio
        best_match = None
        best_ratio = 0.0
        clean_rstu_title = clean_title(rstu_doc['title'])

        for result in results:
            clean_anarchist_title = clean_title(result[0])
            ratio = similarity_ratio(clean_rstu_title, clean_anarchist_title)

            if ratio > best_ratio and ratio > 0.6:  # Minimum 60% similarity
                best_ratio = ratio
                best_match = {
                    'rstu_id': rstu_doc['id'],
                    'rstu_title': rstu_doc['title'],
                    'anarchist_title': result[0],
                    'author': result[1],
                    'publication_date': result[2],
                    'match_method': 'contains',
                    'confidence': round(ratio, 3)
                }

        return best_match

    def try_trigram_match(self, rstu_doc: Dict) -> Optional[Dict]:
        """Try trigram similarity match if pg_trgm extension is available."""
        try:
            # Check if pg_trgm extension exists
            self.cursor.execute("SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_trgm'")
            if self.cursor.fetchone()[0] == 0:
                return None

            clean_rstu_title = clean_title(rstu_doc['title'])

            query = """
                SELECT title, author, publication_date,
                       SIMILARITY(LOWER(title), %s) as sim
                FROM anarchist.documents
                WHERE author IS NOT NULL AND author != ''
                AND SIMILARITY(LOWER(title), %s) > 0.3
                ORDER BY sim DESC
                LIMIT 1
            """

            self.cursor.execute(query, (clean_rstu_title, clean_rstu_title))
            result = self.cursor.fetchone()

            if result and result[3] > 0.5:  # Minimum 50% similarity
                return {
                    'rstu_id': rstu_doc['id'],
                    'rstu_title': rstu_doc['title'],
                    'anarchist_title': result[0],
                    'author': result[1],
                    'publication_date': result[2],
                    'match_method': 'trigram',
                    'confidence': round(result[3], 3)
                }
        except Exception as e:
            print(f"Trigram matching not available: {e}")
            return None

        return None

    def try_first_words_match(self, rstu_doc: Dict) -> Optional[Dict]:
        """Try matching first significant words."""
        significant_words = extract_significant_words(rstu_doc['title'], 5)

        if len(significant_words) < 3:
            return None

        # Try first 3 words
        first_words = ' '.join(significant_words[:3])

        query = """
            SELECT title, author, publication_date
            FROM anarchist.documents
            WHERE LOWER(title) LIKE %s
            AND author IS NOT NULL AND author != ''
            LIMIT 10
        """

        self.cursor.execute(query, (f'%{first_words}%',))
        results = self.cursor.fetchall()

        if not results:
            return None

        # Find best match by similarity
        best_match = None
        best_ratio = 0.0
        clean_rstu_title = clean_title(rstu_doc['title'])

        for result in results:
            clean_anarchist_title = clean_title(result[0])
            ratio = similarity_ratio(clean_rstu_title, clean_anarchist_title)

            if ratio > best_ratio and ratio > 0.5:  # Minimum 50% similarity
                best_ratio = ratio
                best_match = {
                    'rstu_id': rstu_doc['id'],
                    'rstu_title': rstu_doc['title'],
                    'anarchist_title': result[0],
                    'author': result[1],
                    'publication_date': result[2],
                    'match_method': 'first_words',
                    'confidence': round(ratio, 3)
                }

        return best_match

    def match_document(self, rstu_doc: Dict) -> Optional[Dict]:
        """Try multiple matching strategies for a document."""
        # Try exact match first
        match = self.try_exact_match(rstu_doc)
        if match:
            return match

        # Try trigram match (if available)
        match = self.try_trigram_match(rstu_doc)
        if match:
            return match

        # Try contains match
        match = self.try_contains_match(rstu_doc)
        if match:
            return match

        # Try first words match
        match = self.try_first_words_match(rstu_doc)
        if match:
            return match

        return None

    def match_all(self, rstu_docs: List[Dict], priority_categories: List[str] = None) -> List[Dict]:
        """Match all documents, optionally prioritizing certain categories."""
        if priority_categories:
            # Sort docs to prioritize certain categories
            priority_docs = [d for d in rstu_docs if d['category'] in priority_categories]
            other_docs = [d for d in rstu_docs if d['category'] not in priority_categories]
            docs_to_process = priority_docs + other_docs
        else:
            docs_to_process = rstu_docs

        total = len(docs_to_process)
        matched = 0

        for i, doc in enumerate(docs_to_process, 1):
            if i % 50 == 0 or i == 1:
                print(f"Processing {i}/{total} ({doc['category']}: {doc['title'][:50]}...)")

            match = self.match_document(doc)
            if match:
                self.matches.append(match)
                matched += 1
                if matched % 10 == 0:
                    print(f"  Found {matched} matches so far...")

        return self.matches

def main():
    # Load RSTU documents missing authors
    print("Loading RSTU documents missing authors...")
    with open('/home/user/Projects/rstu-connect/data/docs-missing-author.json', 'r') as f:
        rstu_docs = json.load(f)

    print(f"Loaded {len(rstu_docs)} documents")

    # Count by category
    categories = {}
    for doc in rstu_docs:
        cat = doc['category']
        categories[cat] = categories.get(cat, 0) + 1

    print("\nBy category:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    # Match documents
    print("\nStarting fuzzy matching...")
    print("Priority categories: Misc, Abolition")

    with AuthorMatcher() as matcher:
        matches = matcher.match_all(rstu_docs, priority_categories=['Misc', 'Abolition'])

    # Save results
    output_path = '/home/user/Projects/rstu-connect/data/fuzzy-author-matches.json'
    print(f"\nSaving {len(matches)} matches to {output_path}...")

    with open(output_path, 'w') as f:
        json.dump(matches, f, indent=2)

    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total documents processed: {len(rstu_docs)}")
    print(f"Total matches found: {len(matches)}")
    print(f"Match rate: {len(matches)/len(rstu_docs)*100:.1f}%")

    # By match method
    methods = {}
    for match in matches:
        method = match['match_method']
        methods[method] = methods.get(method, 0) + 1

    print("\nBy match method:")
    for method, count in sorted(methods.items(), key=lambda x: -x[1]):
        print(f"  {method}: {count}")

    # By category
    match_categories = {}
    for match in matches:
        # Find original doc to get category
        rstu_id = match['rstu_id']
        for doc in rstu_docs:
            if doc['id'] == rstu_id:
                cat = doc['category']
                match_categories[cat] = match_categories.get(cat, 0) + 1
                break

    print("\nMatches by category:")
    for cat, count in sorted(match_categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    # High confidence matches
    high_conf = [m for m in matches if m['confidence'] >= 0.8]
    print(f"\nHigh confidence matches (>=0.8): {len(high_conf)}")

    print("\n" + "="*60)
    print(f"Results saved to: {output_path}")

if __name__ == '__main__':
    main()
