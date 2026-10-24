(() => {
  "use strict";

  const groupDefinitions = [
    {
      title: "light",
      sliders: [
        ["exposure", "exposure", -100, 100, 0, (v) => (v > 0 ? `+${(v / 100).toFixed(2)}` : (v / 100).toFixed(2))],
        ["contrast", "contrast", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["highlights", "highlights", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["shadows", "shadows", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["whites", "whites", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["blacks", "blacks", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)]
      ]
    },
    {
      title: "color",
      sliders: [
        ["saturation", "saturation", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["vibrance", "vibrance", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["temperature", "temperature", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["tint", "tint", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)]
      ]
    },
    {
      title: "detail",
      sliders: [
        ["texture", "texture", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["clarity", "clarity", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)],
        ["sharpness", "sharpness", 0, 100, 0, (v) => `${v}`],
        ["vignette", "vignette", -100, 100, 0, (v) => (v > 0 ? `+${v}` : `${v}`)]
      ]
    },
    {
      title: "distortion",
      sliders: [
        ["glitchPower", "power", 0, 100, 0, (v) => `${v}%`],
        ["glitchSeed", "seed", 0, 99999, 1337, (v) => `${Math.round(v)}`],
        ["warpX", "warp x", 0, 80, 0, (v) => `${Math.round(v)}px`],
        ["warpY", "warp y", 0, 80, 0, (v) => `${Math.round(v)}px`],
        ["chunk", "chunk grid", 2, 64, 16, (v) => `${Math.round(v)}px`],
        ["tear", "tear", 0, 100, 0, (v) => `${Math.round(v)}%`],
        ["smear", "pixel smear", 0, 100, 0, (v) => (Math.round(v) === 0 ? "off" : `${Math.round(v)}%`)],
        ["sort", "pixel sort", 0, 100, 0, (v) => (Math.round(v) === 0 ? "off" : `${Math.round(v)}%`)],
        ["block", "pixel block", 0, 64, 0, (v) => (Math.round(v) === 0 ? "off" : `${Math.round(v)}px`)]
      ]
    },
    {
      title: "chroma & noise",
      sliders: [
        ["rgbSplit", "rgb split", 0, 30, 0, (v) => `${Math.round(v)}px`],
        ["glitchGrain", "digital grain", 0, 100, 0, (v) => `${Math.round(v)}%`],
        ["grain", "film grain", 0, 100, 0, (v) => `${v}%`],
        ["grainSize", "grain size", 1, 100, 25, (v) => `${v}`],
        ["roughness", "roughness", 0, 100, 50, (v) => `${v}`],
        ["glitchBlend", "blend", 0, 100, 100, (v) => `${Math.round(v)}%`]
      ]
    }
  ];

  const presets = [
    {
      name: "cinematic",
      values: {
        exposure: -15,
        contrast: 20,
        highlights: -30,
        shadows: -15,
        blacks: -10,
        temperature: -3,
        tint: -4,
        vibrance: -12,
        saturation: -6,
        texture: 12,
        clarity: -4,
        grain: 20,
        grainSize: 20,
        vignette: -12
      }
    },
    {
      name: "noir",
      values: {
        saturation: -100,
        contrast: 40,
        highlights: -20,
        whites: 25,
        blacks: -25,
        shadows: -15,
        clarity: 25,
        texture: 15,
        sharpness: 30,
        grain: 35,
        grainSize: 18,
        vignette: -20
      }
    },
    {
      name: "cyberpunk",
      values: {
        contrast: 30,
        highlights: 15,
        shadows: -20,
        temperature: -20,
        tint: 30,
        saturation: 25,
        vibrance: 35,
        clarity: 20,
        rgbSplit: 8,
        glitchPower: 30,
        glitchBlend: 85
      }
    },
    {
      name: "vhs",
      values: {
        temperature: 15,
        tint: -10,
        contrast: -10,
        exposure: 5,
        glitchPower: 40,
        warpX: 18,
        warpY: 6,
        chunk: 24,
        tear: 45,
        rgbSplit: 12,
        glitchGrain: 25,
        grain: 20,
        glitchBlend: 85
      }
    },
    {
      name: "mosh",
      values: {
        glitchPower: 60,
        glitchSeed: 4242,
        warpX: 35,
        warpY: 25,
        chunk: 20,
        tear: 50,
        block: 18,
        smear: 40,
        rgbSplit: 14,
        glitchBlend: 100
      }
    }
  ];

  const defaults = {};
  for (const group of groupDefinitions) {
    for (const [key, , , , initial] of group.sliders) {
      defaults[key] = initial;
    }
  }

  const values = { ...defaults };
  const sliderFormatterMap = {};
  for (const group of groupDefinitions) {
    for (const [key, , , , , fmt] of group.sliders) {
      sliderFormatterMap[key] = fmt;
    }
  }

  const dom = {
    app: document.getElementById("app"),
    fileInput: document.getElementById("file-input"),
    openButton: document.getElementById("open-button"),
    emptyOpen: document.getElementById("empty-open"),
    chaosButton: document.getElementById("chaos-button"),
    compareButton: document.getElementById("compare-button"),
    copyButton: document.getElementById("copy-button"),
    exportButton: document.getElementById("export-button"),
    exportFormat: document.getElementById("export-format"),
    resetButton: document.getElementById("reset-button"),
    preview: document.getElementById("preview"),
    emptyState: document.getElementById("empty-state"),
    photoName: document.getElementById("photo-name"),
    photoMeta: document.getElementById("photo-meta"),
    previewNote: document.getElementById("preview-note"),
    dropZone: document.getElementById("drop-zone"),
    controlsContainer: document.getElementById("controls-container"),
    presetPills: document.getElementById("preset-pills"),
    toast: document.getElementById("toast")
  };

  const previewCtx = dom.preview.getContext("2d", { willReadFrequently: true });
  const offscreenCanvas = document.createElement("canvas");
  const offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });

  let sourceImage = null;
  let sourceName = "";
  let renderQueued = false;
  let toastTimer = null;
  let isComparing = false;

  const MathFx = {
    clamp(v, a, b) {
      return v < a ? a : (v > b ? b : v);
    },
    hash2i(x, y, seed) {
      let h = (x | 0) * 374761393 + (y | 0) * 668265263 + (seed | 0) * 2147483647;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      h ^= (h >>> 16);
      return (h >>> 0) / 4294967296;
    },
    rint(a, b) {
      return (a + Math.floor(Math.random() * (b - a + 1))) | 0;
    },
    smoothstep(edge0, edge1, value) {
      const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    },
    grainHash(x, y, seed) {
      let v = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed) >>> 0;
      v = Math.imul(v ^ (v >>> 13), 1274126177);
      v = (v ^ (v >>> 16)) >>> 0;
      return v / 2147483647.5 - 1;
    },
    smoothGrain(x, y, cellSize, seed) {
      const gx = Math.floor(x / cellSize);
      const gy = Math.floor(y / cellSize);
      const bx = MathFx.smoothstep(0, 1, x / cellSize - gx);
      const by = MathFx.smoothstep(0, 1, y / cellSize - gy);
      const top = MathFx.grainHash(gx, gy, seed) * (1 - bx) + MathFx.grainHash(gx + 1, gy, seed) * bx;
      const bottom = MathFx.grainHash(gx, gy + 1, seed) * (1 - bx) + MathFx.grainHash(gx + 1, gy + 1, seed) * bx;
      return top * (1 - by) + bottom * by;
    }
  };

  const MAX_SORT_SEG = 128;
  const sortBr = new Float32Array(MAX_SORT_SEG);
  const sortR = new Uint8Array(MAX_SORT_SEG);
  const sortG = new Uint8Array(MAX_SORT_SEG);
  const sortB = new Uint8Array(MAX_SORT_SEG);
  const sortIdx = new Int32Array(MAX_SORT_SEG);

  function pixelSortBands(buf, w, h, strength, seed) {
    if (strength <= 0) return;
    const pow = strength / 100;
    const chance = MathFx.clamp(0.1 + 0.85 * pow, 0.1, 0.92);
    const minLen = Math.floor(8 + 12 * pow);
    const maxLen = Math.min(MAX_SORT_SEG, Math.floor(20 + 100 * pow));

    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const r = MathFx.hash2i(x, y, seed);
        if (r > chance) {
          x += 2;
          continue;
        }
        const segLen = MathFx.clamp(Math.floor(minLen + r * (maxLen - minLen)), minLen, maxLen);
        const end = Math.min(w, x + segLen);
        const len = end - x;
        if (len < 4) {
          x = end;
          continue;
        }

        for (let i = 0; i < len; i++) {
          const p = (y * w + (x + i)) * 4;
          const R = buf[p];
          const G = buf[p + 1];
          const B = buf[p + 2];
          sortR[i] = R;
          sortG[i] = G;
          sortB[i] = B;
          sortBr[i] = 0.299 * R + 0.587 * G + 0.114 * B;
          sortIdx[i] = i;
        }

        for (let i = 1; i < len; i++) {
          const curIdx = sortIdx[i];
          const curVal = sortBr[curIdx];
          let j = i - 1;
          while (j >= 0 && sortBr[sortIdx[j]] > curVal) {
            sortIdx[j + 1] = sortIdx[j];
            j--;
          }
          sortIdx[j + 1] = curIdx;
        }

        for (let i = 0; i < len; i++) {
          const src = sortIdx[i];
          const p = (y * w + (x + i)) * 4;
          buf[p] = sortR[src];
          buf[p + 1] = sortG[src];
          buf[p + 2] = sortB[src];
          buf[p + 3] = 255;
        }
        x = end + 2;
      }
    }
  }

  function applyPixelBlock(buf, w, h, cellSize) {
    if (cellSize <= 0) return;
    const size = MathFx.clamp(cellSize | 0, 2, 64);
    for (let by = 0; by < h; by += size) {
      const bh = Math.min(size, h - by);
      for (let bx = 0; bx < w; bx += size) {
        const bw = Math.min(size, w - bx);
        const cx = bx + Math.floor(bw / 2);
        const cy = by + Math.floor(bh / 2);
        const sampleIdx = (cy * w + cx) * 4;
        const r = buf[sampleIdx];
        const g = buf[sampleIdx + 1];
        const b = buf[sampleIdx + 2];

        for (let y = 0; y < bh; y++) {
          const row = (by + y) * w;
          for (let x = 0; x < bw; x++) {
            const di = (row + bx + x) * 4;
            buf[di] = r;
            buf[di + 1] = g;
            buf[di + 2] = b;
            buf[di + 3] = 255;
          }
        }
      }
    }
  }

  function applyPixelSmear(buf, w, h, strength, seed) {
    if (strength <= 0) return;
    const pow = strength / 100;
    const minLen = Math.floor(10 + 20 * pow);
    const maxLen = Math.floor(35 + 260 * pow);
    const chance = MathFx.clamp(0.18 + 0.72 * pow, 0.18, 0.9);

    for (let y = 0; y < h; y++) {
      const rowSeed = seed + y * 6571;
      let x = 0;
      while (x < w) {
        const r = MathFx.hash2i(x, y, rowSeed);
        if (r > chance) {
          x += 2;
          continue;
        }

        const streakLen = MathFx.clamp(Math.floor(minLen + r * (maxLen - minLen)), minLen, maxLen);
        const p = (y * w + x) * 4;
        const sR = buf[p];
        const sG = buf[p + 1];
        const sB = buf[p + 2];

        const endX = Math.min(w, x + streakLen);
        for (let sx = x + 1; sx < endX; sx++) {
          const di = (y * w + sx) * 4;
          const progress = (sx - x) / streakLen;
          const blend = Math.max(0.2, 1 - progress * 0.7);
          buf[di] = Math.round(sR * blend + buf[di] * (1 - blend));
          buf[di + 1] = Math.round(sG * blend + buf[di + 1] * (1 - blend));
          buf[di + 2] = Math.round(sB * blend + buf[di + 2] * (1 - blend));
          buf[di + 3] = 255;
        }
        x = endX + Math.floor(r * 4);
      }
    }
  }

  function buildControls() {
    for (const group of groupDefinitions) {
      const section = document.createElement("section");
      section.className = "panel-section";

      const titleRow = document.createElement("div");
      titleRow.className = "section-title-row";
      const title = document.createElement("span");
      title.className = "group-title";
      title.textContent = group.title;
      titleRow.appendChild(title);
      section.appendChild(titleRow);

      for (const [key, label, min, max, initial] of group.sliders) {
        const row = document.createElement("div");
        row.className = "slider-row";

        const labelDiv = document.createElement("div");
        labelDiv.className = "slider-label";

        const lbl = document.createElement("label");
        lbl.htmlFor = `slider-${key}`;
        lbl.textContent = label;

        const val = document.createElement("output");
        val.className = "value";
        val.id = `value-${key}`;
        val.htmlFor = `slider-${key}`;

        labelDiv.append(lbl, val);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = `slider-${key}`;
        slider.min = min;
        slider.max = max;
        slider.value = initial;
        slider.dataset.key = key;
        slider.setAttribute("aria-label", label);

        row.append(labelDiv, slider);
        section.appendChild(row);

        updateSliderDisplay(slider);

        slider.addEventListener("input", () => {
          values[key] = Number(slider.value);
          updateSliderDisplay(slider);
          queueRender();
        });
      }

      dom.controlsContainer.appendChild(section);
    }

    for (const preset of presets) {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "preset-pill";
      pill.textContent = preset.name;
      pill.addEventListener("click", () => applyPreset(preset));
      dom.presetPills.appendChild(pill);
    }
  }

  function updateSliderDisplay(slider) {
    const key = slider.dataset.key;
    const num = Number(slider.value);
    const out = document.getElementById(`value-${key}`);
    const formatter = sliderFormatterMap[key];
    if (out) out.textContent = formatter ? formatter(num) : String(num);

    const min = Number(slider.min);
    const max = Number(slider.max);
    const pct = ((num - min) / (max - min)) * 100;
    slider.style.setProperty("--fill", `${pct}%`);
  }

  function syncAllInputs() {
    for (const slider of dom.controlsContainer.querySelectorAll('input[type="range"]')) {
      const key = slider.dataset.key;
      if (values[key] !== undefined) {
        slider.value = values[key];
        updateSliderDisplay(slider);
      }
    }
  }

  function applyPreset(preset) {
    Object.assign(values, defaults, preset.values);
    syncAllInputs();
    showToast(preset.name);
    queueRender();
  }

  function applyChaos() {
    values.glitchSeed = MathFx.rint(0, 99999);
    values.glitchPower = MathFx.rint(30, 90);
    values.warpX = MathFx.rint(10, 60);
    values.warpY = MathFx.rint(10, 45);
    values.chunk = MathFx.rint(8, 40);
    values.tear = MathFx.rint(20, 80);
    values.smear = MathFx.rint(15, 75);
    values.sort = MathFx.rint(20, 85);
    values.block = Math.random() < 0.4 ? MathFx.rint(8, 32) : 0;
    values.rgbSplit = MathFx.rint(4, 22);
    values.glitchGrain = MathFx.rint(5, 50);
    values.glitchBlend = MathFx.rint(75, 100);
    syncAllInputs();
    showToast(`seed ${values.glitchSeed}`);
    queueRender();
  }

  function resetAll() {
    Object.assign(values, defaults);
    syncAllInputs();
    showToast("reset");
    queueRender();
  }

  function queueRender() {
    if (!sourceImage || renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      if (isComparing) {
        renderRawSource(dom.preview, previewCtx);
      } else {
        renderPipeline(sourceImage.naturalWidth, sourceImage.naturalHeight, true);
      }
    });
  }

  function renderRawSource(targetCanvas, ctx) {
    const scale = Math.min(1, 1400 / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight));
    const outW = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
    const outH = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
    targetCanvas.width = outW;
    targetCanvas.height = outH;
    ctx.drawImage(sourceImage, 0, 0, outW, outH);
    targetCanvas.style.display = "block";
    dom.emptyState.style.display = "none";
    if (dom.previewNote) dom.previewNote.textContent = "original";
  }

  function renderPipeline(origWidth, origHeight, isPreview) {
    const scale = isPreview ? Math.min(1, 1200 / Math.max(origWidth, origHeight)) : 1;
    const outWidth = Math.max(1, Math.round(origWidth * scale));
    const outHeight = Math.max(1, Math.round(origHeight * scale));

    offscreenCanvas.width = outWidth;
    offscreenCanvas.height = outHeight;
    offscreenCtx.drawImage(sourceImage, 0, 0, outWidth, outHeight);

    const imgData = offscreenCtx.getImageData(0, 0, outWidth, outHeight);
    const pixels = imgData.data;
    const w = outWidth;
    const h = outHeight;
    const count = w * h;

    const baseLum = new Float32Array(count);
    const exposure = Math.pow(2, values.exposure / 100);
    const contrast = values.contrast / 100;
    const saturation = 1 + values.saturation / 100;
    const clarity = (values.clarity / 100) * 0.7;
    const texture = (values.texture / 100) * 0.7;
    const sharpness = (values.sharpness / 100) * 0.9;
    const temperature = values.temperature / 100;
    const tint = values.tint / 100;
    const vibrance = values.vibrance / 100;
    const filmGrain = (values.grain / 100) * 32;
    const grainScale = 1 + ((values.grainSize - 1) / 99) * 7;
    const roughness = values.roughness / 100;
    const vignette = values.vignette / 100;
    const devSeed = (origWidth * 73856093 ^ origHeight * 19349663) >>> 0;

    for (let i = 0, p = 0; i < count; i++, p += 4) {
      let r = pixels[p] * exposure;
      let g = pixels[p + 1] * exposure;
      let b = pixels[p + 2] * exposure;

      const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const shadowMask = 1 - MathFx.smoothstep(0.12, 0.68, luma);
      const highlightMask = MathFx.smoothstep(0.32, 0.9, luma);
      const blackMask = 1 - MathFx.smoothstep(0.02, 0.3, luma);
      const whiteMask = MathFx.smoothstep(0.72, 1, luma);

      const tonalShift =
        values.shadows * 0.48 * shadowMask +
        values.highlights * 0.42 * highlightMask +
        values.blacks * 0.32 * blackMask +
        values.whites * 0.32 * whiteMask;

      r += tonalShift + temperature * 22 + tint * 14;
      g += tonalShift - tint * 28;
      b += tonalShift - temperature * 22 + tint * 14;

      r = (r - 127.5) * (1 + contrast) + 127.5;
      g = (g - 127.5) * (1 + contrast) + 127.5;
      b = (b - 127.5) * (1 + contrast) + 127.5;

      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const colorRange = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      const vibMult = 1 + vibrance * (1 - colorRange);
      const colSat = saturation * vibMult;

      r = lum + (r - lum) * colSat;
      g = lum + (g - lum) * colSat;
      b = lum + (b - lum) * colSat;

      pixels[p] = MathFx.clamp(r, 0, 255);
      pixels[p + 1] = MathFx.clamp(g, 0, 255);
      pixels[p + 2] = MathFx.clamp(b, 0, 255);
      baseLum[i] = 0.2126 * pixels[p] + 0.7152 * pixels[p + 1] + 0.0722 * pixels[p + 2];
    }

    if (clarity || texture || sharpness) {
      const origBuf = new Uint8ClampedArray(pixels);
      const border = texture ? 2 : 1;
      for (let y = border; y < h - border; y++) {
        for (let x = border; x < w - border; x++) {
          const i = y * w + x;
          const p = i * 4;
          const avg =
            (baseLum[i - w - 1] + baseLum[i - w] + baseLum[i - w + 1] +
              baseLum[i - 1] + baseLum[i] + baseLum[i + 1] +
              baseLum[i + w - 1] + baseLum[i + w] + baseLum[i + w + 1]) / 9;
          const detail = baseLum[i] - avg;
          const texDetail = texture
            ? baseLum[i] - (baseLum[i - 2 * w] + baseLum[i + 2 * w] + baseLum[i - 2] + baseLum[i + 2] + baseLum[i]) / 5
            : 0;
          const amount = clarity + sharpness;
          for (let ch = 0; ch < 3; ch++) {
            pixels[p + ch] = origBuf[p + ch] + detail * amount + texDetail * texture;
          }
        }
      }
    }

    if (vignette || filmGrain) {
      const cx = (w - 1) / 2;
      const cy = (h - 1) / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          const p = i * 4;
          const dx = (x - cx) / maxDist;
          const dy = (y - cy) / maxDist;
          const edge = Math.min(1, (dx * dx + dy * dy) * 1.7);
          const vigFactor = 1 - vignette * edge * 0.72;
          let noise = 0;
          if (filmGrain) {
            const fine = (MathFx.grainHash(x, y, devSeed) + MathFx.grainHash(x + 7919, y + 104729, devSeed ^ 0x9e3779b9)) * 0.5;
            const coarse = MathFx.smoothGrain(x, y, grainScale, devSeed ^ 0x85ebca6b);
            const mix = roughness * 0.55;
            noise = (fine * (1 - mix) + coarse * mix) * filmGrain;
          }
          pixels[p] = MathFx.clamp(pixels[p] * vigFactor + noise, 0, 255);
          pixels[p + 1] = MathFx.clamp(pixels[p + 1] * vigFactor + noise, 0, 255);
          pixels[p + 2] = MathFx.clamp(pixels[p + 2] * vigFactor + noise, 0, 255);
        }
      }
    }

    const hasGlitch =
      values.glitchPower > 0 ||
      values.warpX > 0 ||
      values.warpY > 0 ||
      values.tear > 0 ||
      values.smear > 0 ||
      values.sort > 0 ||
      values.block > 0 ||
      values.rgbSplit > 0 ||
      values.glitchGrain > 0;

    if (hasGlitch) {
      const pow = values.glitchPower / 100;
      const seed = values.glitchSeed | 0;
      const chunk = Math.max(2, values.chunk | 0);
      const warpX = values.warpX * (0.35 + 1.25 * pow);
      const warpY = values.warpY * (0.35 + 1.25 * pow);
      const rgb = values.rgbSplit * (0.3 + 0.85 * pow);
      const glitchGrain = values.glitchGrain / 100;
      const blend = values.glitchBlend / 100;

      const baseCopy = new Uint8ClampedArray(pixels);
      let readBuf = new Uint8ClampedArray(pixels);
      let writeBuf = new Uint8ClampedArray(pixels.length);

      if (warpX > 0 || warpY > 0 || rgb > 0 || pow > 0) {
        const passes = 1 + Math.floor(pow * 2);
        for (let pass = 0; pass < passes; pass++) {
          const passSeed = seed + pass * 10007;
          for (let y = 0; y < h; y++) {
            const cy = (y / chunk) | 0;
            const yOffset = y * w;
            for (let x = 0; x < w; x++) {
              const cx = (x / chunk) | 0;
              const n1 = MathFx.hash2i(cx, cy, passSeed);
              const n2 = MathFx.hash2i(cx + 41, cy - 17, passSeed + 909);
              const dx = (n1 - 0.5) * 2 * warpX;
              const dy = (n2 - 0.5) * 2 * warpY;
              const jitter = pow * 2.5;
              const jx = (MathFx.hash2i(x, y, passSeed + 2222) - 0.5) * 2 * jitter;
              const jy = (MathFx.hash2i(x, y, passSeed + 3333) - 0.5) * 2 * jitter;

              const sx = x + dx + jx;
              const sy = y + dy + jy;

              const clSy = MathFx.clamp(sy | 0, 0, h - 1);
              const clSx = MathFx.clamp(sx | 0, 0, w - 1);
              const clR = MathFx.clamp((sx + rgb) | 0, 0, w - 1);
              const clB = MathFx.clamp((sx - rgb) | 0, 0, w - 1);

              const rowIdx = clSy * w;
              const rIdx = (rowIdx + clR) * 4;
              const gIdx = (rowIdx + clSx) * 4;
              const bIdx = (rowIdx + clB) * 4;

              const di = (yOffset + x) * 4;
              writeBuf[di] = readBuf[rIdx];
              writeBuf[di + 1] = readBuf[gIdx + 1];
              writeBuf[di + 2] = readBuf[bIdx + 2];
              writeBuf[di + 3] = 255;
            }
          }
          const tmp = readBuf;
          readBuf = writeBuf;
          writeBuf = tmp;
        }
      }

      if (values.tear > 0) {
        const tear = values.tear / 100;
        const bandHeight = Math.max(6, Math.floor(10 + (1 - pow) * 26));
        const totalBands = Math.ceil(h / bandHeight);
        const bandShifts = new Int32Array(totalBands);

        for (let b = 0; b < totalBands; b++) {
          const r = MathFx.hash2i(b, 0, seed + 777);
          if (r < 0.15 + 0.65 * tear) {
            const dir = MathFx.hash2i(b, 1, seed + 1337) < 0.5 ? -1 : 1;
            const amp = Math.floor((10 + 70 * tear) * (0.35 + 0.65 * MathFx.hash2i(b, 2, seed + 42)));
            bandShifts[b] = dir * amp;
          }
        }

        const rowBuf = new Uint8ClampedArray(w * 4);
        for (let y = 0; y < h; y++) {
          const b = Math.floor(y / bandHeight);
          const shift = bandShifts[b];
          if (shift === 0) continue;

          const rowStart = y * w * 4;
          rowBuf.set(readBuf.subarray(rowStart, rowStart + w * 4));

          for (let x = 0; x < w; x++) {
            const srcX = MathFx.clamp(x - shift, 0, w - 1);
            const di = rowStart + x * 4;
            const si = srcX * 4;
            readBuf[di] = rowBuf[si];
            readBuf[di + 1] = rowBuf[si + 1];
            readBuf[di + 2] = rowBuf[si + 2];
            readBuf[di + 3] = 255;
          }
        }
      }

      const glitchFinal = readBuf;
      if (values.block > 0) {
        applyPixelBlock(glitchFinal, w, h, values.block);
      }
      if (values.sort > 0) {
        pixelSortBands(glitchFinal, w, h, values.sort, seed + 7777);
      }
      if (values.smear > 0) {
        applyPixelSmear(glitchFinal, w, h, values.smear, seed + 3333);
      }

      for (let y = 0; y < h; y++) {
        const yOffset = y * w;
        for (let x = 0; x < w; x++) {
          const i = (yOffset + x) * 4;
          let r = baseCopy[i] + (glitchFinal[i] - baseCopy[i]) * blend;
          let g = baseCopy[i + 1] + (glitchFinal[i + 1] - baseCopy[i + 1]) * blend;
          let b = baseCopy[i + 2] + (glitchFinal[i + 2] - baseCopy[i + 2]) * blend;

          if (glitchGrain > 0) {
            const gn = (MathFx.hash2i(x, y, seed + 999) - 0.5) * 2;
            const amp = (6 + 34 * glitchGrain) * (0.35 + 0.65 * Math.max(0.1, pow));
            r += gn * amp;
            g += gn * amp;
            b += gn * amp;
          }

          pixels[i] = MathFx.clamp(r, 0, 255);
          pixels[i + 1] = MathFx.clamp(g, 0, 255);
          pixels[i + 2] = MathFx.clamp(b, 0, 255);
          pixels[i + 3] = 255;
        }
      }
    }

    if (isPreview) {
      dom.preview.width = outWidth;
      dom.preview.height = outHeight;
      previewCtx.putImageData(imgData, 0, 0);
      dom.preview.style.display = "block";
      dom.emptyState.style.display = "none";
      if (dom.previewNote) {
        dom.previewNote.textContent =
          scale < 1 ? `preview ${outWidth}×${outHeight}` : "full resolution";
      }
    }

    return imgData;
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("choose an image file");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (sourceImage && sourceImage.src.startsWith("blob:")) URL.revokeObjectURL(sourceImage.src);
      sourceImage = img;
      sourceName = file.name.replace(/\.[^.]+$/, "") || "untitled";
      dom.photoName.textContent = file.name;
      dom.photoMeta.textContent = `${img.naturalWidth.toLocaleString()} × ${img.naturalHeight.toLocaleString()}`;
      dom.exportButton.disabled = false;
      dom.compareButton.disabled = false;
      dom.copyButton.disabled = false;
      renderPipeline(img.naturalWidth, img.naturalHeight, true);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast("failed to open");
    };
    img.src = url;
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.remove("show"), 2000);
  }

  function getExportCanvas() {
    if (!sourceImage) return null;
    const result = renderPipeline(sourceImage.naturalWidth, sourceImage.naturalHeight, false);
    const expCanvas = document.createElement("canvas");
    expCanvas.width = result.width;
    expCanvas.height = result.height;
    const expCtx = expCanvas.getContext("2d");
    const format = dom.exportFormat.value;

    if (format === "image/jpeg") {
      for (let i = 0; i < result.data.length; i += 4) {
        const alpha = result.data[i + 3] / 255;
        result.data[i] = result.data[i] * alpha + 255 * (1 - alpha);
        result.data[i + 1] = result.data[i + 1] * alpha + 255 * (1 - alpha);
        result.data[i + 2] = result.data[i + 2] * alpha + 255 * (1 - alpha);
        result.data[i + 3] = 255;
      }
    }
    expCtx.putImageData(result, 0, 0);
    return expCanvas;
  }

  function exportImage() {
    if (!sourceImage) return;
    try {
      const expCanvas = getExportCanvas();
      const format = dom.exportFormat.value;
      const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
      const quality = format === "image/png" ? undefined : 0.94;

      expCanvas.toBlob(
        (blob) => {
          if (!blob) {
            showToast("export failed");
            return;
          }
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${sourceName}-empire.${ext}`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 1500);
          showToast(`exported ${ext}`);
        },
        format,
        quality
      );
    } catch (e) {
      console.error(e);
      showToast("export error");
    }
  }

  async function copyImageToClipboard() {
    if (!sourceImage) return;
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast("clipboard not supported");
        return;
      }

      const canvas = dom.preview && dom.preview.width > 0 ? dom.preview : getExportCanvas();
      const blobPromise = new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("blob generation failed"));
        }, "image/png");
      });

      const item = new ClipboardItem({ "image/png": blobPromise });
      await navigator.clipboard.write([item]);
      showToast("copied to clipboard");
    } catch (err) {
      console.warn("Direct promise clipboard write failed, trying fallback:", err);
      try {
        const canvas = dom.preview && dom.preview.width > 0 ? dom.preview : getExportCanvas();
        canvas.toBlob(async (blob) => {
          if (!blob) return showToast("copy failed");
          try {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            showToast("copied to clipboard");
          } catch (e2) {
            showToast("clipboard write blocked");
          }
        }, "image/png");
      } catch (finalErr) {
        showToast("copy failed");
      }
    }
  }

  function bindEvents() {
    dom.openButton.addEventListener("click", () => dom.fileInput.click());
    dom.emptyOpen.addEventListener("click", () => dom.fileInput.click());
    dom.fileInput.addEventListener("change", (e) => {
      loadFile(e.target.files[0]);
      e.target.value = "";
    });

    dom.chaosButton.addEventListener("click", applyChaos);
    dom.resetButton.addEventListener("click", resetAll);
    dom.exportButton.addEventListener("click", exportImage);
    dom.copyButton.addEventListener("click", copyImageToClipboard);

    const startCompare = () => {
      if (!sourceImage || isComparing) return;
      isComparing = true;
      dom.compareButton.classList.add("primary");
      queueRender();
    };

    const stopCompare = () => {
      if (!isComparing) return;
      isComparing = false;
      dom.compareButton.classList.remove("primary");
      queueRender();
    };

    dom.compareButton.addEventListener("mousedown", startCompare);
    dom.compareButton.addEventListener("mouseup", stopCompare);
    dom.compareButton.addEventListener("mouseleave", stopCompare);
    dom.compareButton.addEventListener("touchstart", (e) => {
      e.preventDefault();
      startCompare();
    });
    dom.compareButton.addEventListener("touchend", stopCompare);

    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        startCompare();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        stopCompare();
      }
    });

    for (const evt of ["dragenter", "dragover"]) {
      document.addEventListener(evt, (e) => {
        e.preventDefault();
        dom.app.classList.add("dragging");
      });
    }

    for (const evt of ["dragleave", "drop"]) {
      document.addEventListener(evt, (e) => {
        e.preventDefault();
        if (evt === "drop" && e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadFile(e.dataTransfer.files[0]);
        }
        dom.app.classList.remove("dragging");
      });
    }
  }

  function init() {
    buildControls();
    bindEvents();
  }

  init();
})();
