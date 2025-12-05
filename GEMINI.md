# GEMINI.md - Project Overview

This document provides a comprehensive overview of the RSTU Connect project for the Gemini CLI.

## Project Overview

RSTU Connect is the web platform for the Reno-Sparks Tenants Union (RSTU). It's a Next.js application built with TypeScript and styled with Tailwind CSS. The platform serves two main purposes:

1.  **Organize Tab:** Provides a directory of the 15 largest apartment complexes in Reno-Sparks, with anonymous chat rooms (via Tlk.io) and property information for each building.
2.  **Reading Library:** A collection of 1,738 documents related to tenant organizing, labor unions, and political theory. It features search, filtering, and a reading progress tracker.

The application is deployed as a static site on Neocities, with continuous deployment managed by GitHub Actions. User data, such as reading progress and admin state, is stored in the browser's localStorage.

## Building and Running

### Prerequisites

*   Node.js 18+
*   npm

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

3.  **Build the static site:**
    ```bash
    npm run build
    ```
    The output will be in the `out/` directory.

4.  **Deploy:**
    ```bash
    npm run deploy
    ```
    This command builds the site and copies the output to the root directory for Neocities deployment.

## Development Conventions

*   **State Management:** React Context is used for global state management, with data persisted in `localStorage`.
*   **Styling:** Tailwind CSS is used for styling. The main color theme is RSTU red (`#cc0000`).
*   **Documents:** The reading library documents are stored as Markdown files with YAML frontmatter in the `docs/` directory. A JSON manifest of all documents is generated at build time.
*   **Admin Panel:** An admin panel is available via `Ctrl+Shift+A` for document curation. Admin state is stored in `localStorage`.
*   **Static Site Generation (SSG):** The application is built as a static site to enable free hosting and fast performance.
*   **Chat System:** Tlk.io is used for anonymous chat rooms to reduce friction for tenants.
