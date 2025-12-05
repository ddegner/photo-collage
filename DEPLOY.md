# WordPress.org Deployment Automation

Your Photo Collage plugin is now set up to automatically deploy to the WordPress.org Plugin Directory whenever you create a new release tag on GitHub.

## Initial Setup

Before your first deployment, you need to configure your WordPress.org SVN credentials in GitHub:

1. **Generate SVN Password** (if you haven't already):
   - Visit: https://wordpress.org/support/users/ddegner/edit/
   - Scroll to "Account & Security" section
   - Generate a new SVN password
   - **Save this password securely** - you'll need it for the next step

2. **Add Secrets to GitHub**:
   - Go to: https://github.com/ddegner/photo-collage/settings/secrets/actions
   - Click "New repository secret"
   - Add the following two secrets:
     - Name: `SVN_USERNAME`, Value: `ddegner`
     - Name: `SVN_PASSWORD`, Value: `[your SVN password from step 1]`

## How to Deploy a New Version

### 1. Prepare Your Release

Ensure your plugin is ready for release:
- Update the version number in `photo-collage.php` (line 5)
- Update the version in `package.json`
- Update `PHOTO_COLLAGE_VERSION` constant in `photo-collage.php` (line 26)
- Update the changelog in `readme.txt`
- Test the plugin thoroughly

### 2. Build and Commit

```bash
# Build the plugin
npm run build

# Commit your changes
git add .
git commit -m "Release version 0.5.3"
git push origin main
```

### 3. Create and Push a Tag

```bash
# Create a tag matching your version number
git tag 0.5.3

# Push the tag to GitHub
git push origin 0.5.3
```

**That's it!** The GitHub Action will automatically:
- Check out your code
- Install dependencies
- Build the plugin
- Deploy to WordPress.org SVN

### 4. Monitor the Deployment

1. Go to: https://github.com/ddegner/photo-collage/actions
2. Click on the latest "Deploy to WordPress.org" workflow run
3. Watch the progress and check for any errors

### 5. Verify on WordPress.org

After a successful deployment, verify your plugin:
- Visit: https://wordpress.org/plugins/photo-collage/
- Check that the new version appears
- Download and test the plugin to ensure everything works

## What Gets Deployed

The deployment uses the `.distignore` file to exclude development files. The following are **excluded** from deployment:
- `.git`, `.github/` - Git files and GitHub Actions
- `src/` - Source files (only built files in `build/` are deployed)
- `node_modules/`, `vendor/` - Dependencies
- `composer.json`, `composer.lock`, `phpcs.xml` - Development tools
- `README.md` - GitHub readme (use `readme.txt` for WordPress.org)
- `verify-distribution.sh` - Build verification script

## Plugin Assets

Banner images, icons, and screenshots should be placed in the `.wordpress-org/` directory. These will be deployed to the WordPress.org assets directory separately from your plugin code.

## Troubleshooting

### Deployment Fails

If the deployment fails:
1. Check the GitHub Actions log for error messages
2. Verify your SVN credentials are correct in GitHub Secrets
3. Ensure the tag version matches the version in your plugin files
4. Check that the build step completed successfully

### SVN Conflicts

If you encounter SVN conflicts:
- The 10up action handles most scenarios automatically
- Check the WordPress.org plugin SVN manually if needed: https://plugins.svn.wordpress.org/photo-collage/

### First Deployment

Your first deployment to the WordPress.org SVN repository has been approved. The SVN repository is located at:
- SVN URL: https://plugins.svn.wordpress.org/photo-collage
- Public URL: https://wordpress.org/plugins/photo-collage

## Testing Before Production

To test the workflow without publishing to production:
1. Create a test tag: `git tag 0.5.3-test && git push origin 0.5.3-test`
2. Monitor the GitHub Actions run
3. Delete the test tag if needed: `git tag -d 0.5.3-test && git push origin :refs/tags/0.5.3-test`

> **Note**: Be cautious with tags - every tag push triggers a deployment to the live WordPress.org Plugin Directory!
