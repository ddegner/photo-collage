#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
	echo "Usage: $0 <distignore-file> <output-zip> [package-directory]"
	exit 1
fi

ignore_file="$1"
output_zip="$2"
package_directory="${3:-photo-collage}"
build_root="$(mktemp -d)"

rm -f "${output_zip}"

cleanup() {
	rm -rf "${build_root}"
}
trap cleanup EXIT

mkdir -p "${build_root}/${package_directory}"
grep -vE '^(#|$)' "${ignore_file}" > "${build_root}/.rsync_ignore"
rsync -rc --exclude-from="${build_root}/.rsync_ignore" . "${build_root}/${package_directory}/"

(
	cd "${build_root}"
	zip -qr "${OLDPWD}/${output_zip}" "${package_directory}"
)
