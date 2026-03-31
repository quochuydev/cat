Release a new version of the app. The user provides the new version number as $ARGUMENTS (e.g. "0.3.0").

Steps:

1. Validate that the version argument is provided. If not, ask the user for it.
2. Bump the version in these 3 files:
   - `src-tauri/tauri.conf.json` — the `"version"` field
   - `src-tauri/Cargo.toml` — the `version` field under `[package]`
   - `package.json` — the `"version"` field
3. Run `cargo check` in `src-tauri/` to update `Cargo.lock`.
4. Commit all changes with message: `Bump version to <version>`
5. Push to `main`.
6. Create git tag `v<version>` and push it.
7. Confirm the release workflow started with `gh run list --limit 1`.

The tag push triggers the GitHub Actions release workflow which builds, signs, and publishes the release with auto-update support.
