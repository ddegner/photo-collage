# WordPress.org Deployment Automation

This repo uses a release-centric flow:
- GitHub Releases are the canonical record and release notes.
- The attached ZIP asset is generated from the deployed WordPress.org payload.

## Initial Setup

Before your first deployment, configure WordPress.org SVN credentials in GitHub:

1. Generate an SVN password at https://wordpress.org/support/users/ddegner/edit/
2. Add repository secrets at https://github.com/ddegner/photo-collage/settings/secrets/actions
3. Required secrets:
   - `SVN_USERNAME` (WordPress.org username)
   - `SVN_PASSWORD` (WordPress.org SVN password)

## Workflows

- `beta-build.yml`:
  - Runs on branch pushes (not tags) and manual dispatch.
  - Builds a beta ZIP and uploads it as a workflow artifact.
  - Does not create GitHub Releases.

- `deploy.yml`:
  - Runs on `release.published`.
  - Skips prereleases and tags prefixed with `beta-`.
  - Builds and deploys to WordPress.org.
  - Generates a ZIP from the deployed package and attaches it to that GitHub Release.

## Stable Release Process

1. Prepare release changes:
   - Update versions in `photo-collage.php` and `package.json`
   - Update changelog/release notes content
   - Test the plugin

2. Commit and push to `master`:

```bash
git add .
git commit -m "Release <version>"
git push origin master
```

3. Create and push the release tag:

```bash
git tag -a <version> -m "Release <version>"
git push origin <version>
```

4. Create and publish a GitHub Release for tag `<version>`:
   - Add your release notes in the GitHub Release UI.
   - Publish the release.

Publishing the release triggers WordPress.org deployment and attaches `photo-collage-<version>.zip` to the same release.

## Monitoring

1. Open https://github.com/ddegner/photo-collage/actions
2. Open the latest `Deploy to WordPress.org` run
3. Verify success and check https://wordpress.org/plugins/photo-collage/

## Notes

- `.distignore` controls which files are excluded from deployment.
- `.wordpress-org/` contains plugin assets (banners/icons/screenshots).
- If deployment fails, check Actions logs and verify `SVN_USERNAME`/`SVN_PASSWORD`.
