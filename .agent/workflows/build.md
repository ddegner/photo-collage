---
description: Build the Photo Collage plugin after code changes
---

# Build Workflow

After making changes to any source files in `src/blocks/`, run the build command to compile the plugin.

## Steps

1. Make your code changes to files in `src/blocks/`

// turbo
2. Run the build command:
```bash
npm run build
```

This compiles the JavaScript/React source files into the `build/` directory.

## Notes

- The build command is safe to auto-run (non-destructive, read-only operation)
- Always rebuild after editing `.js`, `.jsx`, `.scss`, or `block.json` files
- The build output goes to `build/blocks/`
- Use `npm run start` for development mode with hot reloading
