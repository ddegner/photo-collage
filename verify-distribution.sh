#!/bin/bash
# Verify WordPress.org Distribution Contents
# This script shows which files will be included in the WordPress.org SVN deployment

echo "=== Files that WILL be included in WordPress.org distribution ==="
echo ""
echo "Source Code Files:"
find ./src -type f ! -name ".DS_Store" | sort
echo ""
echo "Build Configuration:"
echo "  ./package.json"
echo "  ./package-lock.json"
echo ""
echo "=== Files that will be EXCLUDED (per .distignore) ==="
echo ""
cat .distignore | grep -v "^$" | grep -v "^#"
