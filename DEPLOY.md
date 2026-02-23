# WordPress.org Deployment Automation

This repo uses a release-centric flow:
- GitHub Releases are the canonical record and release notes.
- Every published GitHub Release gets a GitHub distribution ZIP:
  - `photo-collage-<tag>.zip` (includes release channel switch)
- Stable releases also deploy to WordPress.org and attach:
  - `photo-collage-wporg-<tag>.zip` (WordPress.org deployment payload, no release channel switch)

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
  - Builds a preview ZIP and uploads it as a workflow artifact.
  - Does not create GitHub Releases.

- `deploy.yml`:
  - Runs on `release.published`.
  - Builds a GitHub distribution ZIP (release-channel capable).
  - Attaches the GitHub ZIP to that release.
  - For stable tags (`x.y.z`), deploys to WordPress.org and attaches the WordPress.org ZIP.
  - For prerelease tags (for example `x.y.z-beta.1`), skips WordPress.org deployment.

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

Publishing the release triggers GitHub ZIP packaging, WordPress.org deployment, and attaches both ZIPs to the same release.

## Beta Release Process

1. Create and push a prerelease tag using semver prerelease format (example: `0.5.15-beta.1`).
2. Create and publish a GitHub Release marked as prerelease for that tag.
3. The workflow attaches `photo-collage-<tag>.zip` to the prerelease and skips WordPress.org deployment.

## Monitoring

1. Open https://github.com/ddegner/photo-collage/actions
2. Open the latest `Publish Release Packages` run
3. Verify success and check https://wordpress.org/plugins/photo-collage/

## Notes

- `.distignore` controls files excluded from GitHub ZIP packaging.
- `.distignore-wporg` controls files excluded from WordPress.org deployment ZIP.
- `.wordpress-org/` contains plugin assets (banners/icons/screenshots).
- If deployment fails, check Actions logs and verify `SVN_USERNAME`/`SVN_PASSWORD`.
