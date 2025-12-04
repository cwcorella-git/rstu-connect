# Archive Directory

This directory contains legacy/deprecated systems that have been replaced in the current implementation but are preserved for reference and potential future re-implementation.

## Archived Systems

### relay-server/
- **Original Purpose:** Gun.js relay server for real-time chat
- **Status:** Replaced by Tlk.io embedded chat
- **Reason:** CSRF cookie errors, authentication complexity
- **Archived:** December 4, 2025

### netlify-element-config/
- **Original Purpose:** Matrix/Element chat deployment configuration
- **Status:** Replaced by Tlk.io embedded chat  
- **Reason:** Deployment complexity, separate hosting required
- **Archived:** December 4, 2025

### documents/
- **Original Purpose:** Old document structure (pre-build system)
- **Status:** Replaced by docs/ with build-time generation
- **Reason:** Duplication, now auto-generated from docs/
- **Archived:** December 4, 2025

### 404/
- **Original Purpose:** Custom 404 error page
- **Status:** Can be integrated into Next.js App Router
- **Reason:** Superseded by Next.js built-in 404 handling
- **Archived:** December 4, 2025

## Recovery

All archived systems are complete and functional. To restore:
1. Move directory back to project root
2. Install dependencies if needed (check README in each)
3. Update configuration for current environment

## Data Preservation

**Important:** The data/ directory is NOT archived - it contains valuable organizing intelligence and property databases that may be integrated in future phases.

