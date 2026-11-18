#!/usr/bin/env bash
set -euo pipefail

# Re-encode an input video to a browser-safe MP4 profile for static hosting.
# Defaults are tuned for GitHub Pages playback reliability.

usage() {
  cat <<'EOF'
Usage:
  scripts/reencode-video.sh [--replace] [--crf N] [--preset NAME] [--fps N] [--no-audio] <input> [output]

Examples:
  scripts/reencode-video.sh assets/videos/lake_district.mp4
  scripts/reencode-video.sh assets/videos/lake_district.mp4 assets/videos/lake_district_web.mp4
  scripts/reencode-video.sh --replace assets/videos/lake_district.mp4

Options:
  --replace        Replace input file in-place after successful encode.
  --crf N          H.264 quality factor (default: 21; lower = higher quality).
  --preset NAME    x264 preset (default: medium; e.g. slow, medium, fast).
  --fps N          Force output frame rate.
  --no-audio       Remove audio track.
  -h, --help       Show this help.

Notes:
  - Output profile: H.264 High, level 4.0, yuv420p, +faststart, AAC audio.
  - ffmpeg must be installed and available on PATH.
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' is required but not installed." >&2
    exit 1
  fi
}

replace_mode="false"
crf="21"
preset="medium"
force_fps=""
no_audio="false"

args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --replace)
      replace_mode="true"
      shift
      ;;
    --crf)
      crf="${2:-21}"
      shift 2
      ;;
    --preset)
      preset="${2:-medium}"
      shift 2
      ;;
    --fps)
      force_fps="${2:-}"
      shift 2
      ;;
    --no-audio)
      no_audio="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

if [[ ${#args[@]} -lt 1 || ${#args[@]} -gt 2 ]]; then
  usage >&2
  exit 1
fi

input="${args[0]}"
if [[ ! -f "$input" ]]; then
  echo "Error: input file not found: $input" >&2
  exit 1
fi

if [[ -n "${args[1]:-}" ]]; then
  output="${args[1]}"
else
  input_dir="$(dirname "$input")"
  input_name="$(basename "$input")"
  stem="${input_name%.*}"
  output="${input_dir}/${stem}_web.mp4"
fi

if [[ "$replace_mode" == "true" ]]; then
  tmp_output="${output}.tmp.$$"
else
  tmp_output="$output"
fi

require_cmd ffmpeg

# Initialize arrays to avoid "unbound variable" errors
audio_args=(-c:a aac -b:a 128k -movflags +faststart)
if [[ "$no_audio" == "true" ]]; then
  audio_args=(-an -movflags +faststart)
fi

fps_args=()
if [[ -n "$force_fps" ]]; then
  fps_args=(-r "$force_fps")
fi

mkdir -p "$(dirname "$tmp_output")"

# Using ${VAR[@]+"${VAR[@]}"} pattern to safely handle empty arrays under set -u
ffmpeg \
  -y \
  -i "$input" \
  ${fps_args[@]+"${fps_args[@]}"} \
  -c:v libx264 \
  -profile:v high \
  -level:v 4.0 \
  -pix_fmt yuv420p \
  -crf "$crf" \
  -preset "$preset" \
  ${audio_args[@]+"${audio_args[@]}"} \
  "$tmp_output"

if [[ "$replace_mode" == "true" ]]; then
  mv "$tmp_output" "$output"
  if [[ "$input" != "$output" ]]; then
      mv "$output" "$input"
  fi
  echo "Re-encoded and replaced: $input"
else
  echo "Re-encoded output written to: $output"
fi