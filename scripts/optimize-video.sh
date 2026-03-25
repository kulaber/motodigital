#!/usr/bin/env bash
# optimize-video.sh
# Optimizes custombike_intro.mp4 for web delivery:
#   - Web-optimized MP4 (H.264, faststart, no audio)
#   - WebM (VP9, no audio)
#   - Poster image as WebP (first frame)
#
# Requirements: ffmpeg with libvpx-vp9 and libwebp support
# Usage: bash scripts/optimize-video.sh

set -euo pipefail

INPUT="public/custombike_intro.mp4"
OUT_MP4="public/custombike_intro-optimized.mp4"
OUT_WEBM="public/custombike_intro.webm"
OUT_POSTER="public/custombike_intro-poster.webp"

if [ ! -f "$INPUT" ]; then
  echo "Error: $INPUT not found. Run this script from the project root." >&2
  exit 1
fi

echo "→ Generating web-optimized MP4 (H.264, CRF 23, faststart)…"
ffmpeg -y -i "$INPUT" \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libx264 \
  -crf 23 \
  -preset slow \
  -movflags +faststart \
  -an \
  "$OUT_MP4"

echo "→ Generating WebM (VP9, CRF 30, two-pass)…"
ffmpeg -y -i "$INPUT" \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -an \
  -pass 1 \
  -f webm /dev/null

ffmpeg -y -i "$INPUT" \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:v libvpx-vp9 \
  -crf 30 \
  -b:v 0 \
  -an \
  -pass 2 \
  "$OUT_WEBM"

echo "→ Extracting poster frame as WebP (frame 0, quality 80)…"
ffmpeg -y -i "$INPUT" \
  -vframes 1 \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -q:v 80 \
  "$OUT_POSTER"

# Clean up VP9 two-pass log files
rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree

echo ""
echo "Done! Output files:"
du -sh "$OUT_MP4" "$OUT_WEBM" "$OUT_POSTER"
