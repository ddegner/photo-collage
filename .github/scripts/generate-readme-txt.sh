#!/usr/bin/env bash
set -euo pipefail

input_file="${1:-README.md}"
output_file="${2:-readme.txt}"

cp "${input_file}" "${output_file}"
sed -i 's/[ \t]*$//' "${output_file}"
sed -i 's/^# \(.*\)/=== \1 ===/' "${output_file}"
sed -i 's/^## \(.*\)/== \1 ==/' "${output_file}"
sed -i 's/^### \(.*\)/= \1 =/' "${output_file}"
sed -i 's/^\*\*Contributors:\*\* \(.*\)/Contributors: \1/' "${output_file}"
sed -i 's/^\*\*Tags:\*\* \(.*\)/Tags: \1/' "${output_file}"
sed -i 's/^\*\*Tested up to:\*\* \(.*\)/Tested up to: \1/' "${output_file}"
sed -i 's/^\*\*Stable tag:\*\* \(.*\)/Stable tag: \1/' "${output_file}"
sed -i 's/^\*\*Requires at least:\*\* \(.*\)/Requires at least: \1/' "${output_file}"
sed -i 's/^\*\*Requires PHP:\*\* \(.*\)/Requires PHP: \1/' "${output_file}"
sed -i 's/^\*\*License:\*\* \(.*\)/License: \1/' "${output_file}"
sed -i 's/^\*\*License URI:\*\* \(.*\)/License URI: \1/' "${output_file}"
