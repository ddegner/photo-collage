# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build              # Production build (outputs to build/)
npm run start              # Dev mode with file watching
npm run lint:js            # ESLint (WordPress preset)
npm run lint:css           # Stylelint for SCSS
npm run lint:php           # PHPCS with WordPress Coding Standards
npm run format             # Prettier (WordPress config)
composer lint              # Same as lint:php
composer fix               # Auto-fix PHP coding standards violations
```

Build uses `@wordpress/scripts` with `--blocks-manifest` flag, which generates `build/blocks-manifest.php` for WordPress 6.8+ metadata collection.

## Release Process

Version lives in two places that must stay in sync: `photo-collage.php` (plugin header + `PHOTO_COLLAGE_VERSION` constant) and `package.json`. See DEPLOY.md for full release workflow. Pushes to master auto-create beta prereleases; stable releases require manual tag creation.

## Architecture

### Three-Block System

The plugin provides three WordPress blocks that work together:

- **Container** (`photo-collage/container`) — Wrapper/canvas providing positioning context. Two height modes: "fixed" (explicit) and "auto" (computed from child geometry).
- **Image** (`photo-collage/image`) — Positioned image with rotation, opacity, z-index, captions, lightbox support.
- **Frame** (`photo-collage/frame`) — Positioned wrapper for arbitrary non-image content.

### Block File Convention

Each block in `src/blocks/{name}/` follows this structure:
- `block.json` — Metadata and attribute definitions
- `index.js` — Block registration
- `edit.js` — Editor component (React)
- `save.js` — Serialized output
- `render.php` — Server-side rendering (receives `$attributes`, `$content`, `$block`)
- `deprecated.js` — Migration handlers for older attribute schemas
- `editor.scss` / `style.scss` — Editor-only and frontend styles

Shared components live in `src/blocks/components/`, utilities in `src/blocks/utils/`.

### PHP Class Roles

- **`Photo_Collage_Block_Attributes`** — Readonly data class (~50 properties). Factory method `from_array()` normalizes raw block attributes, resolves WordPress preset tokens (spacing/color/gradient), and provides defaults.
- **`Photo_Collage_Renderer`** — Static utility that builds CSS style arrays and generates HTML using `WP_HTML_Tag_Processor`. All render.php files delegate to this.
- **`Photo_Collage_Collage_Scanner`** — Finds posts containing collage blocks with a 300s cache + version-based invalidation.
- **`Photo_Collage_Collage_Converter`** — Converts collage blocks to static HTML or core blocks (used on uninstall).
- **`Photo_Collage_Admin_Settings`** — Settings page, scanner UI, uninstall preferences, release channel selection.
- **`Photo_Collage_Release_Updater`** — Conditionally loaded if release-channel files exist (GitHub builds only, not wporg).

### Attribute Flow (JS ↔ PHP)

Attributes defined in `block.json` use camelCase in JavaScript. `Photo_Collage_Block_Attributes::from_array()` converts to snake_case PHP properties. The renderer reads these typed properties—never raw attribute arrays.

### Auto-Height System

`src/blocks/container/auto-height.js` computes minimum container height from child block geometry (aspect ratios, positions, sizes). Server-side pre-computes geometry hints via `data-pc-geometry` attributes. Frontend uses ResizeObserver + MutationObserver for live updates.

## Code Conventions

**PHP:** Requires PHP 8.3. Uses `declare(strict_types=1)` everywhere, readonly classes, constructor promotion, enums, match expressions, first-class callables for hooks (`photo_collage_register_blocks( ... )`). Short array syntax `[]` is allowed (PHPCS exclusion). WordPress naming: `photo_collage_` prefix for functions, `Photo_Collage_` for classes.

**JS:** ES6 modules, React hooks, `@wordpress/*` packages. camelCase variables, PascalCase components.

**Output escaping:** Always use `esc_attr()`, `esc_url()`, `wp_kses_post()`. HTML built via `WP_HTML_Tag_Processor`.

**Patterns directory:** `patterns/` contains PHP-based block pattern definitions (layout presets).
