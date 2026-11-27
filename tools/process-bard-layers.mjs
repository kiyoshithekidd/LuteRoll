#!/usr/bin/env node
/**
 * Post-processing pipeline for Issue #42 Modular Build-a-Bard `.webp` layers.
 *
 * Supports:
 * - `bard_base_*.jpg` -> chroma-keyed transparent 512x512 `.webp`
 * - `raw_<slot>_<name>_*.jpg` -> pixel-diffed against master base mannequin + magenta despill -> 384x384 `.webp`
 * - `layer_hat_*.jpg` -> isolated chroma-keyed + anchored onto head crown -> 384x384 `.webp`
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ARTIFACT_DIR =
  process.argv[2] ??
  '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p_devbox/484d867d-ac02-4d95-9af4-08881e80788e';
const OUT_DIR = path.resolve('src/client/assets/bardLayers');

fs.mkdirSync(OUT_DIR, { recursive: true });

const pyScript = `
from PIL import Image
import glob, os, sys

art_dir, out_dir = sys.argv[1], sys.argv[2]

def find_latest(pattern):
    matches = sorted(glob.glob(os.path.join(art_dir, pattern)))
    return matches[-1] if matches else None

def is_magenta(r, g, b):
    return r > 170 and b > 170 and g < 120 and (r - g) > 65 and (b - g) > 65

def despill_magenta(r, g, b):
    # Clamp magenta fringe along anti-aliased edges
    if r > 130 and b > 130 and g < 110 and (r - g) > 35 and (b - g) > 35:
        avg = g
        return (min(r, avg + 25), g, min(b, avg + 25))
    return (r, g, b)

def key_bg(img, size=512):
    w, h = img.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ipx, opx = img.load(), out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _ = ipx[x, y]
            if is_magenta(r, g, b):
                continue
            r, g, b = despill_magenta(r, g, b)
            opx[x, y] = (r, g, b, 255)
    return out.resize((size, size), Image.Resampling.LANCZOS)

def extract_diff(img, ref, min_y_ratio=0.0, size=384):
    w, h = img.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ipx, rpx, opx = img.load(), ref.load(), out.load()
    for y in range(h):
        if y < int(h * min_y_ratio):
            continue
        for x in range(w):
            r, g, b, _ = ipx[x, y]
            if is_magenta(r, g, b):
                continue
            rr, rg, rb, _ = rpx[x, y]
            diff = abs(r - rr) + abs(g - rg) + abs(b - rb)
            if diff > 40:
                alpha = 255 if diff > 68 else int((diff - 40) / 28 * 255)
                r, g, b = despill_magenta(r, g, b)
                opx[x, y] = (r, g, b, alpha)
    return out.resize((size, size), Image.Resampling.LANCZOS)

def place_isolated_hat(img, size=384):
    keyed = key_bg(img, size=1024)
    bbox = keyed.getbbox()
    if not bbox:
        return keyed.resize((size, size), Image.Resampling.LANCZOS)
    cropped = keyed.crop(bbox)
    cw, ch = cropped.size
    target_w = int(1024 * 0.48)
    target_h = max(1, int(ch * (target_w / cw)))
    resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    # Anchor centered at x=512, resting on head crown around y=225
    paste_x = (1024 - target_w) // 2 + 12
    paste_y = max(10, 235 - int(target_h * 0.72))
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)

base_path = find_latest('bard_base_bright_*.jpg')
if not base_path:
    print('Missing bard_base_bright')
    sys.exit(1)

base_ref = Image.open(base_path).convert('RGBA')

# 1. Base dolls (512x512)
for face in ['bright', 'lashes', 'serene']:
    p = find_latest(f'bard_base_{face}_*.jpg')
    if p:
        out_p = os.path.join(out_dir, f'base_{face}.webp')
        key_bg(Image.open(p).convert('RGBA'), 512).save(out_p, 'WEBP', quality=82, method=6)
        print(f'Saved {out_p} ({os.path.getsize(out_p)//1024} KB)')

# 2. Pixel-diffed Hair, Outfits, Props (384x384)
jobs = [
    ('raw_hair_bowl_*.jpg', 'hair_bowl.webp', 0.0),
    ('raw_hair_tail_*.jpg', 'hair_tail.webp', 0.0),
    ('raw_hair_curls_*.jpg', 'hair_curls.webp', 0.0),
    ('raw_hair_braid_*.jpg', 'hair_braid.webp', 0.0),
    ('raw_hair_swept_*.jpg', 'hair_swept.webp', 0.0),
    ('raw_hair_baroque_*.jpg', 'hair_baroque.webp', 0.0),
    ('raw_hair_mythic_mane_*.jpg', 'hair_mythic_mane.webp', 0.0),
    ('raw_outfit_burlap_*.jpg', 'outfit_burlap.webp', 0.56),
    ('raw_prop_cracked_lute_*.jpg', 'prop_cracked_lute.webp', 0.45),
]
for pattern, out_name, min_y in jobs:
    p = find_latest(pattern)
    if p:
        out_p = os.path.join(out_dir, out_name)
        extract_diff(Image.open(p).convert('RGBA'), base_ref, min_y, 384).save(out_p, 'WEBP', quality=82, method=6)
        print(f'Saved {out_p} ({os.path.getsize(out_p)//1024} KB)')

# 3. Isolated Hats
hat_p = find_latest('layer_hat_feather_*.jpg')
if hat_p:
    out_p = os.path.join(out_dir, 'hat_feather.webp')
    place_isolated_hat(Image.open(hat_p).convert('RGBA'), 384).save(out_p, 'WEBP', quality=82, method=6)
    print(f'Saved {out_p} ({os.path.getsize(out_p)//1024} KB)')
`;

execFileSync('python3', ['-c', pyScript, ARTIFACT_DIR, OUT_DIR], {
  stdio: 'inherit',
});
