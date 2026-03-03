/**
 * Inverted search index for fast client-side property search.
 * Pre-builds a token-to-APN mapping for O(1) lookups instead of O(n) scans.
 */

// Compressed property format (subset of fields needed for indexing)
interface IndexableProperty {
  a: string;  // apn
  d: string;  // address
  o: string;  // owner
}

/**
 * Tokenize text into searchable tokens.
 * Splits on non-alphanumeric, filters short tokens.
 */
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);
}

/**
 * Build an inverted index from properties.
 * Maps each token to a set of APNs that contain it.
 */
export function buildSearchIndex<T extends IndexableProperty>(
  properties: T[]
): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();

  for (const p of properties) {
    // Tokenize address and owner
    const tokens = tokenize(`${p.d} ${p.o}`);

    // Also add the APN as a searchable token
    if (p.a.length >= 2) {
      tokens.push(p.a.toLowerCase());
    }

    for (const token of tokens) {
      if (!index.has(token)) {
        index.set(token, new Set());
      }
      index.get(token)!.add(p.a);
    }
  }

  return index;
}

/**
 * Search using the inverted index.
 * Returns APNs that match ALL query tokens (intersection).
 */
export function searchWithIndex(
  query: string,
  index: Map<string, Set<string>>
): Set<string> {
  const tokens = tokenize(query);
  if (tokens.length === 0) return new Set();

  // Start with all matches for first token
  let resultApns: Set<string> | null = null;

  for (const token of tokens) {
    // Get exact matches
    const exactMatches = index.get(token);

    // Also check prefix matches for partial typing
    const prefixMatches = new Set<string>();
    index.forEach((apns, indexToken) => {
      if (indexToken.startsWith(token) || token.startsWith(indexToken)) {
        apns.forEach(apn => prefixMatches.add(apn));
      }
    });

    // Combine exact and prefix matches for this token
    const tokenMatches = new Set<string>();
    if (exactMatches) {
      exactMatches.forEach(apn => tokenMatches.add(apn));
    }
    prefixMatches.forEach(apn => tokenMatches.add(apn));

    if (resultApns === null) {
      resultApns = tokenMatches;
    } else {
      // Intersect with previous results
      const intersection = new Set<string>();
      resultApns.forEach(apn => {
        if (tokenMatches.has(apn)) {
          intersection.add(apn);
        }
      });
      resultApns = intersection;
    }

    // Early exit if no matches
    if (resultApns.size === 0) break;
  }

  return resultApns || new Set();
}

/**
 * Build a property map for quick lookups by APN.
 */
export function buildPropertyMap<T extends IndexableProperty>(
  properties: T[]
): Map<string, T> {
  return new Map(properties.map(p => [p.a, p]));
}
