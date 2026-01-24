import { createLogger } from './logger'

const log = createLogger('Github')

// GitHub API service for updating translation files
// Used by the inline content editing system

const GITHUB_API_URL = 'https://api.github.com'
const PROXY_URL = process.env.NEXT_PUBLIC_GITHUB_PROXY_URL || 'https://rstu-github-proxy.onrender.com'
const STORAGE_KEY = 'rstu_github_pat'
const USE_PROXY = true // Use proxy to avoid CORS issues

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

// Result type for fetch operations
type FetchFileResult =
  | { success: true; content: string; sha: string }
  | { success: false; error: string }

// Fetch file content from GitHub (via proxy to avoid CORS)
async function fetchFileContent(
  config: GitHubConfig,
  path: string
): Promise<FetchFileResult> {
  const githubPath = `repos/${config.owner}/${config.repo}/contents/${path}`
  const url = USE_PROXY
    ? `${PROXY_URL}/github/${githubPath}`
    : `${GITHUB_API_URL}/${githubPath}`

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }

    // Use X-GitHub-Token header for proxy, Authorization for direct
    if (USE_PROXY) {
      headers['X-GitHub-Token'] = config.token
    } else {
      headers['Authorization'] = `Bearer ${config.token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorMessage = `GitHub API error: ${response.status}`

      // Provide more specific error messages for common status codes
      if (response.status === 401) {
        errorMessage = 'GitHub token is invalid or expired. Please update your token.'
      } else if (response.status === 403) {
        errorMessage = 'GitHub token lacks permission. Ensure it has "repo" scope.'
      } else if (response.status === 404) {
        errorMessage = `File not found: ${path}. Check repository access.`
      } else if (response.status === 422) {
        errorMessage = `Invalid request: ${errorText}`
      }

      log.error(`Failed to fetch file: ${response.status}`, errorText)
      return { success: false, error: errorMessage }
    }

    const data = await response.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return { success: true, content, sha: data.sha }
  } catch (err) {
    log.error('Error fetching file:', err)
    const errorMessage = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: `Failed to connect to GitHub: ${errorMessage}` }
  }
}

// Commit file update to GitHub (via proxy to avoid CORS)
async function commitFileUpdate(
  config: GitHubConfig,
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<UpdateResult> {
  const githubPath = `repos/${config.owner}/${config.repo}/contents/${path}`
  const url = USE_PROXY
    ? `${PROXY_URL}/github/${githubPath}`
    : `${GITHUB_API_URL}/${githubPath}`

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    }

    if (USE_PROXY) {
      headers['X-GitHub-Token'] = config.token
    } else {
      headers['Authorization'] = `Bearer ${config.token}`
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
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
    log.error('Error committing file:', err)
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Escape special characters in regex
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Find and update a translation value in LanguageContext.tsx
// This uses a robust regex pattern to find the translation key and update its value
type UpdateContentResult = { success: true; content: string } | { success: false; error: string }

function updateTranslationInContent(
  content: string,
  locale: string,
  key: string,
  newValue: string
): UpdateContentResult {
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
  // This handles escaped quotes in values (e.g., 'Nevada\'s First')
  const keyPattern = new RegExp(
    `(['"])${escapedKey}\\1\\s*:\\s*(['"])((\\\\.|[^\\\\])*?)\\2`,
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
    log.error(`Key '${key}' not found in translations`)
    return { success: false, error: `Key '${key}' not found anywhere in file (found 0 matches)` }
  }

  // For now, find which match is in the current locale's section
  // We need to find the locale marker and pick the right match
  // The structure is: en: { ... } or es: { ... } (simple identifier, not bracket notation)
  const localePattern = new RegExp(`(?:^|\\n)\\s*${locale}:\\s*\\{`, 'gm')
  const localeMatch = localePattern.exec(content)

  if (!localeMatch) {
    log.error(`Locale '${locale}' not found`)
    return { success: false, error: `Locale '${locale}' section not found in file` }
  }

  const localeStart = localeMatch.index

  // Find the next locale start (or end of translations object) to bound our search
  const nextLocalePattern = /(?:^|\n)\s*(?:en|es|tl|zh|vi):\s*\{/gm
  nextLocalePattern.lastIndex = localeStart + 1
  const nextLocaleMatch = nextLocalePattern.exec(content)
  const localeEnd = nextLocaleMatch ? nextLocaleMatch.index : content.length

  // Find the match that falls within this locale's section
  const matchInLocale = matches.find(m => m.index > localeStart && m.index < localeEnd)

  if (!matchInLocale) {
    log.error(`Key '${key}' not found in locale '${locale}' (found ${matches.length} global matches, locale range: ${localeStart}-${localeEnd})`)
    return { success: false, error: `Key '${key}' found ${matches.length}x but not in '${locale}' section (locale range: ${localeStart}-${localeEnd})` }
  }

  // Build the replacement
  const quote = matchInLocale.quote
  const replacement = `'${key}': ${quote}${escapedNewValue}${quote}`

  // Replace the match
  const updatedContent =
    content.substring(0, matchInLocale.index) +
    replacement +
    content.substring(matchInLocale.index + matchInLocale.fullMatch.length)

  return { success: true, content: updatedContent }
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
  const fileResult = await fetchFileContent(config, filePath)
  if (!fileResult.success) {
    return { success: false, error: fileResult.error }
  }

  // Update the translation in the content
  const updateResult = updateTranslationInContent(
    fileResult.content,
    locale,
    key,
    newValue
  )

  if (!updateResult.success) {
    return { success: false, error: updateResult.error }
  }

  // Commit the update
  const commitMessage = `Update translation: ${locale}.${key}\n\nUpdated via RSTU Connect inline editor`

  return commitFileUpdate(config, filePath, updateResult.content, fileResult.sha, commitMessage)
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
  const url = USE_PROXY ? `${PROXY_URL}/github/user` : `${GITHUB_API_URL}/user`

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    }

    if (USE_PROXY) {
      headers['X-GitHub-Token'] = token
    } else {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, { headers })
    return response.ok
  } catch {
    return false
  }
}
