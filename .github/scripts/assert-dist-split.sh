#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
	echo "Usage: $0 <github-zip> [wporg-zip]"
	exit 1
fi

github_zip="$1"
wporg_zip="${2:-}"

if [[ ! -f "${github_zip}" ]]; then
	echo "GitHub ZIP not found: ${github_zip}"
	exit 1
fi

github_entries="$(unzip -Z -1 "${github_zip}")"

require_entry() {
	local entries="$1"
	local pattern="$2"
	local label="$3"
	if ! grep -E -q "${pattern}" <<<"${entries}"; then
		echo "Missing required entry in ${label}: ${pattern}"
		exit 1
	fi
}

forbid_entry() {
	local entries="$1"
	local pattern="$2"
	local label="$3"
	if grep -E -q "${pattern}" <<<"${entries}"; then
		echo "Forbidden entry found in ${label}: ${pattern}"
		exit 1
	fi
}

require_entry "${github_entries}" '^photo-collage/includes/class-photo-collage-release-updater.php$' "GitHub ZIP"
require_entry "${github_entries}" '^photo-collage/includes/enum-photo-collage-release-channel.php$' "GitHub ZIP"
forbid_entry "${github_entries}" '^photo-collage/\.github/' "GitHub ZIP"
forbid_entry "${github_entries}" '^photo-collage/.*\.zip$' "GitHub ZIP"

if [[ -n "${wporg_zip}" ]]; then
	if [[ ! -f "${wporg_zip}" ]]; then
		echo "WordPress.org ZIP not found: ${wporg_zip}"
		exit 1
	fi

	wporg_entries="$(unzip -Z -1 "${wporg_zip}")"

	forbid_entry "${wporg_entries}" '^photo-collage/includes/class-photo-collage-release-updater.php$' "WordPress.org ZIP"
	forbid_entry "${wporg_entries}" '^photo-collage/includes/enum-photo-collage-release-channel.php$' "WordPress.org ZIP"
	forbid_entry "${wporg_entries}" '^photo-collage/\.github/' "WordPress.org ZIP"
	forbid_entry "${wporg_entries}" '^photo-collage/.*\.zip$' "WordPress.org ZIP"
fi

echo "Distribution ZIP assertions passed."
