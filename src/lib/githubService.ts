// GitHub API service for updating translation files
// Used by the inline content editing system

const GITHUB_API_URL = 'https://api.github.com'
const STORAGE_KEY = 'rstu_github_pat'

interface GitHubConfig {
  owner: string
  repo: string
  token: string
}

interface UpdateResult {
  success: boolean
  error?: string
  commitUrl?: string
}

/**
 * Get stored GitHub PAT from localStorage
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Store GitHub PAT in localStorage
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, token)
}

/**
 * Clear stored GitHub PAT
 */
export function clearStoredToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

function getConfig(): GitHubConfig | null {
  // Try localStorage first, then env var
  const token = getStoredToken() || process.env.NEXT_PUBLIC_GITHUB_PAT
  const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || 'cwcorella-git'
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || 'rstu-connect'

  if (!token) {
    return null
  }

  return { owner, repo, token }
}

// Fetch file content from GitHub
async function fetchFileContent(
  config: GitHubConfig,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const url = `${GITHUB_API_URL}/repos/${config.owner}/${config.repo}/contents/${path}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      console.error(`[GitHubService] Failed to fetch file: ${response.status}`)
      return null
    }

    const data = await response.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha }
  } catch (err) {
    console.error('[GitHubService] Error fetching file:', err)
    return null
  }
}

// Commit file update to GitHub
async function commitFileUpdate(
  config: GitHubConfig,
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<UpdateResult> {
  const url = `${GITHUB_API_URL}/repos/${config.owner}/${config.repo}/contents/${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))), // Handle unicode properly
        sha,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 409) {
        return { success: false, error: 'File was modified. Please refresh and try again.' }
      }
      return { success: false, error: errorData.message || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { success: true, commitUrl: data.commit.html_url }
  } catch (err) {
    console.error('[GitHubService] Error committing file:', err)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Escape special characters in regex
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Find and update a translation value in LanguageContext.tsx
// This uses a robust regex pattern to find the translation key and update its value
function updateTranslationInContent(
  content: string,
  locale: string,
  key: string,
  newValue: string
): string | null {
  // Escape the key for regex use (keys like 'landing.hero.title' have dots)
  const escapedKey = escapeRegex(key)

  // Escape the new value for safe insertion (handle quotes and special chars)
  const escapedNewValue = newValue
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')

  // Strategy: Find the locale's translations object, then find the key within it
  // The structure is: [locale]: { ... 'key': 'value', ... }

  // First, we need to find the position of the locale's translations
  // Then find the specific key within that locale's section

  // Pattern to find: 'key': 'existing value'
  // This works for simple string values
  const keyPattern = new RegExp(
    `(['"])${escapedKey}\\1\\s*:\\s*(['"])([^']*?)\\2`,
    'g'
  )

  // Find all matches and their positions
  const matches: { index: number; fullMatch: string; quote: string }[] = []
  let match
  while ((match = keyPattern.exec(content)) !== null) {
    matches.push({
      index: match.index,
      fullMatch: match[0],
      quote: match[2], // The quote character used for the value
    })
  }

  if (matches.length === 0) {
    console.error(`[GitHubService] Key '${key}' not found in translations`)
    return null
  }

  // For now, find which match is in the current locale's section
  // We need to find the locale marker and pick the right match
  const localePattern = new RegExp(`\\[['"]${locale}['"]\\]\\s*:\\s*\\{`, 'g')
  const localeMatch = localePattern.exec(content)

  if (!localeMatch) {
    console.error(`[GitHubService] Locale '${locale}' not found`)
    return null
  }

  const localeStart = localeMatch.index

  // Find the next locale start (or end of translations object) to bound our search
  const nextLocalePattern = /\[['"](?:en|es|tl|zh|vi)['"]\]\s*:\s*\{/g
  nextLocalePattern.lastIndex = localeStart + 1
  const nextLocaleMatch = nextLocalePattern.exec(content)
  const localeEnd = nextLocaleMatch ? nextLocaleMatch.index : content.length

  // Find the match that falls within this locale's section
  const matchInLocale = matches.find(m => m.index > localeStart && m.index < localeEnd)

  if (!matchInLocale) {
    console.error(`[GitHubService] Key '${key}' not found in locale '${locale}'`)
    return null
  }

  // Build the replacement
  const quote = matchInLocale.quote
  const replacement = `'${key}': ${quote}${escapedNewValue}${quote}`

  // Replace the match
  const updatedContent =
    content.substring(0, matchInLocale.index) +
    replacement +
    content.substring(matchInLocale.index + matchInLocale.fullMatch.length)

  return updatedContent
}

/**
 * Update a translation value in LanguageContext.tsx and commit to GitHub
 *
 * @param locale - The locale to update (en, es, tl, zh, vi)
 * @param key - The translation key (e.g., 'landing.hero.title')
 * @param newValue - The new translation value
 * @returns UpdateResult with success status and optional error/commitUrl
 */
export async function updateTranslation(
  locale: string,
  key: string,
  newValue: string
): Promise<UpdateResult> {
  const config = getConfig()
  if (!config) {
    return { success: false, error: 'GitHub token not configured' }
  }

  const filePath = 'src/contexts/LanguageContext.tsx'

  // Fetch current file content
  const fileData = await fetchFileContent(config, filePath)
  if (!fileData) {
    return { success: false, error: 'Failed to fetch LanguageContext.tsx' }
  }

  // Update the translation in the content
  const updatedContent = updateTranslationInContent(
    fileData.content,
    locale,
    key,
    newValue
  )

  if (!updatedContent) {
    return { success: false, error: `Translation key '${key}' not found for locale '${locale}'` }
  }

  // Commit the update
  const commitMessage = `Update translation: ${locale}.${key}\n\nUpdated via RSTU Connect inline editor`

  return commitFileUpdate(config, filePath, updatedContent, fileData.sha, commitMessage)
}

/**
 * Check if GitHub integration is configured
 */
export function isGitHubConfigured(): boolean {
  return !!(getStoredToken() || process.env.NEXT_PUBLIC_GITHUB_PAT)
}

/**
 * Validate a GitHub token by making a test API call
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
    return response.ok
  } catch {
    return false
  }
}
