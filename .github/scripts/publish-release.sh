#!/usr/bin/env bash
set -euo pipefail

usage() {
	cat <<'USAGE'
Usage: bash .github/scripts/publish-release.sh --tag <tag> [options]

Options:
  --tag <tag>           Required release tag (for example: 0.5.16 or 0.5.16-beta.1)
  --title <title>       Release title (defaults to tag)
  --notes <text>        Inline release notes
  --notes-file <path>   Release notes file path
  --prerelease          Mark release as prerelease
  --skip-master-push    Skip `git push origin HEAD:master`
  --help                Show this help
USAGE
}

tag=""
title=""
notes=""
notes_file=""
prerelease="false"
skip_master_push="false"

while [[ $# -gt 0 ]]; do
	case "$1" in
		--tag)
			tag="${2:-}"
			shift 2
			;;
		--title)
			title="${2:-}"
			shift 2
			;;
		--notes)
			notes="${2:-}"
			shift 2
			;;
		--notes-file)
			notes_file="${2:-}"
			shift 2
			;;
		--prerelease)
			prerelease="true"
			shift
			;;
		--skip-master-push)
			skip_master_push="true"
			shift
			;;
		--help)
			usage
			exit 0
			;;
		*)
			echo "Unknown option: $1"
			usage
			exit 1
			;;
	esac
done

if [[ -z "${tag}" ]]; then
	echo "Missing required --tag option."
	usage
	exit 1
fi

if [[ -n "${notes}" && -n "${notes_file}" ]]; then
	echo "Use either --notes or --notes-file, not both."
	exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
	echo "Working tree is not clean. Commit or stash changes before publishing."
	exit 1
fi

if [[ "${skip_master_push}" != "true" ]]; then
	git push origin HEAD:master
fi

if git rev-parse -q --verify "refs/tags/${tag}" >/dev/null 2>&1; then
	echo "Tag ${tag} already exists locally."
else
	git tag -a "${tag}" -m "Release ${tag}"
fi

git push origin "refs/tags/${tag}"

echo "Waiting for GitHub to recognize tag ${tag}..."
tag_ready="false"
for _ in {1..20}; do
	if gh release view "${tag}" >/dev/null 2>&1; then
		echo "Release ${tag} already exists on GitHub."
		exit 1
	fi

	if gh api "repos/:owner/:repo/git/ref/tags/${tag}" >/dev/null 2>&1; then
		tag_ready="true"
		break
	fi
	sleep 2
done

if [[ "${tag_ready}" != "true" ]]; then
	echo "Timed out waiting for tag ${tag} to be visible in GitHub API."
	exit 1
fi

if [[ -z "${title}" ]]; then
	title="${tag}"
fi

release_args=(release create "${tag}" --verify-tag --title "${title}")

if [[ "${prerelease}" == "true" ]]; then
	release_args+=(--prerelease)
fi

if [[ -n "${notes_file}" ]]; then
	release_args+=(--notes-file "${notes_file}")
elif [[ -n "${notes}" ]]; then
	release_args+=(--notes "${notes}")
else
	release_args+=(--generate-notes)
fi

gh "${release_args[@]}"
