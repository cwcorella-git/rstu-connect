# Generate Comprehensive Security Audit with Actionable Remediation Prompts

Analyze the RSTU Connect codebase for security vulnerabilities and produce a detailed report with specific, actionable prompts for fixing each issue. This command generates output similar to `security-audit.md` but searches the codebase fresh.

## Instructions for Claude

1. **Search the codebase thoroughly** for these vulnerability categories:
   - SQL injection risks (though Next.js limits this, check for dangerous patterns)
   - XSS vulnerabilities (unescaped user input rendered in DOM)
   - CSRF vulnerabilities (state-changing requests without protection)
   - Hardcoded secrets/credentials (API keys, passwords, tokens)
   - Insecure credential storage (localStorage with sensitive data)
   - Missing input validation (user input accepted without checks)
   - Missing authorization checks (functions that modify data without permission verification)
   - Direct Object Reference/IDOR (accessing data by ID without permission checks)
   - Unvalidated redirects (URLs from user input)
   - Weak cryptography (Math.random() for tokens, weak hashes)
   - Insecure session management (no httpOnly/Secure flags, long timeouts)
   - Missing rate limiting (no protection against brute force)

2. **Focus on these areas:**
   - `src/lib/` - Data access, authentication, storage functions
   - `src/components/` - DOM rendering, user input handling
   - `scripts/` - Data loading, automation scripts
   - Configuration files - Environment variable handling, secrets

3. **For each vulnerability found:**
   - Document the exact file path and line number(s)
   - Explain what the vulnerability is and why it's dangerous
   - Show the vulnerable code snippet
   - Rate severity: CRITICAL, HIGH, or MEDIUM
   - Provide a specific, actionable remediation prompt that Claude Sonnet 4.5 can execute

4. **Format each remediation prompt as:**
   - Direct instruction to Claude Sonnet 4.5
   - Specific files to modify
   - Clear before/after behavior
   - Example code if helpful
   - Success criteria (how to verify the fix works)

5. **Generate output as structured markdown** with:
   - Executive summary
   - Vulnerability list organized by severity
   - Implementation priority/timeline
   - References for learning

6. **Be thorough but practical:**
   - Don't report false positives
   - Focus on realistic attack vectors
   - Prioritize issues that affect multi-user data or authentication
   - Consider the frontend-only architecture when assessing severity

## Output Format

Structure the report as:

```
# RSTU Connect Security Audit Report

[Date and scope]

## Executive Summary
[1-2 paragraph overview]

## CRITICAL VULNERABILITIES
### 1. [Vulnerability Name]
- Location: files and lines
- Description: what is the issue
- Risk: impact if exploited
- Remediation Prompt: specific, actionable instructions for Claude Sonnet 4.5

[Repeat for each critical issue]

## HIGH SEVERITY VULNERABILITIES
[Same format as critical]

## MEDIUM SEVERITY VULNERABILITIES
[Same format as high]

## Implementation Priority
- Immediate (Today)
- This Week
- This Sprint
- Ongoing

## References
[Links to security resources]
```

## Notes

- The codebase uses Supabase for backend (some integration, some fallback to localStorage)
- Next.js 14 with static export (runs on GitHub Pages)
- TypeScript + React with Tailwind CSS
- The project is an organizing platform for a tenants union
- Multi-user features (chat, voting, events) currently use localStorage, which is a major architectural issue

## Example Output Structure for First Vulnerability

```
### 1. Hardcoded Database Credentials

Location: scripts/load-all-data-to-supabase.js (lines 19-20)

Description: Supabase credentials are hardcoded as fallback values in the repository if environment variables are not set.

Risk: Anyone with repository access has direct database access. Database can be completely compromised, including theft of all organizing data, deletion of records, or malicious modifications.

Code Example:
[Show vulnerable code]

Remediation Prompt:
"Remove all hardcoded Supabase credentials from the repository. In scripts/load-all-data-to-supabase.js and scripts/load-properties-to-supabase.js, remove the fallback credential values. If environment variables are not set, throw an error. Move all credentials to .env.local (already in .gitignore). Also: Rotate these exposed Supabase keys immediately in the Supabase dashboard and generate new credentials."

Success Criteria:
- Scripts will not run without environment variables
- No credentials appear in the repository
- All exposed keys are rotated
```

---

When this command is invoked, provide a fresh security audit of the codebase with the same depth and specificity as shown above. Focus on real vulnerabilities, not theoretical ones. Provide remediations that Claude Sonnet 4.5 can directly execute by feeding the prompts into the chat.
