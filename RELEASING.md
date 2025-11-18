# Release Process

## Creating a New Release

OpsDec uses semantic versioning (MAJOR.MINOR.PATCH) for releases.

### 1. Update Version Number

Update the version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

### 2. Create a Git Tag

```bash
# Create an annotated tag
git tag -a v1.0.0 -m "Release v1.0.0 - Brief description"

# Push the tag to GitHub
git push origin v1.0.0
```

### 3. Automated Build

GitHub Actions will automatically:
- Build multi-platform Docker images (amd64, arm64)
- Create the following image tags:
  - `ghcr.io/mondominator/opsdec:1.0.0` (full version)
  - `ghcr.io/mondominator/opsdec:1.0` (major.minor)
  - `ghcr.io/mondominator/opsdec:1` (major only)
  - `ghcr.io/mondominator/opsdec:latest` (if on main branch)

### 4. Create GitHub Release

Use the GitHub UI or CLI to create a release:

```bash
# Using GitHub CLI
gh release create v1.0.0 \
  --title "OpsDec v1.0.0" \
  --notes "Release notes here" \
  --latest
```

## Version Guidelines

- **MAJOR** (1.0.0): Breaking changes, major new features
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, small improvements

## Available Image Tags

For each push to main:
- `latest` - Always points to the latest main branch build
- `YYYYMMDD` - Date-based tag (e.g., `20251118`)
- `main-abc1234` - Commit SHA tag

For version releases (v1.2.3):
- `1.2.3` - Full semantic version
- `1.2` - Major.Minor only
- `1` - Major version only

## Testing Before Release

1. Build and test locally:
   ```bash
   docker build -t opsdec:test .
   docker run -d --name opsdec-test opsdec:test
   ```

2. Run through test scenarios
3. Check logs for errors
4. Verify all features work as expected

## Rollback

If a release has issues:

```bash
# Delete the tag locally and remotely
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Delete the GitHub release
gh release delete v1.0.0
```

Note: Docker images cannot be deleted from GHCR once pushed. Users should pin to specific working versions.
