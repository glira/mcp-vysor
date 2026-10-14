#!/usr/bin/env bash
# Build Agensi skill zips. Each archive has SKILL.md at the root.
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
dist="$root/zips"
mkdir -p "$dist"

pack() {
  local name="$1"
  local src="$root/$name"
  local out="$dist/${name}.zip"
  if [[ ! -f "$src/SKILL.md" ]]; then
    echo "missing $src/SKILL.md" >&2
    exit 1
  fi
  rm -f "$out"
  (
    cd "$src"
    zip -r -X "$out" . -x '*.DS_Store'
  )
  local bytes
  bytes="$(wc -c < "$out" | tr -d ' ')"
  if (( bytes > 50000000 )); then
    echo "$out exceeds 50 MB ($bytes)" >&2
    exit 1
  fi
  if ! unzip -l "$out" | awk 'NR>3 {print $4}' | grep -qx 'SKILL.md'; then
    echo "$out does not contain SKILL.md at archive root" >&2
    exit 1
  fi
  echo "ok $out ($bytes bytes)"
}

pack mcp-vysor-starter
pack mcp-vysor-pro
pack mcp-tomticket-starter
