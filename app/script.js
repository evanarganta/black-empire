(() => {
      "use strict";
      const definitions = [
        { title: "Light", sliders: [
          ["exposure", "Exposure", -100, 100, 0],
          ["contrast", "Contrast", -100, 100, 0],
          ["highlights", "Highlights", -100, 100, 0],
          ["shadows", "Shadows", -100, 100, 0],
          ["whites", "Whites", -100, 100, 0],
          ["blacks", "Blacks", -100, 100, 0]
        ]},
        { title: "Color", sliders: [
          ["saturation", "Saturation", -100, 100, 0],
          ["temperature", "Temperature", -100, 100, 0]
        ]},
        { title: "Detail", sliders: [
          ["clarity", "Clarity", -100, 100, 0],
          ["sharpness", "Sharpness", 0, 100, 0]
        ]},
        { title: "Grain & finish", sliders: [
          ["grain", "Grain", 0, 100, 0],
          ["grainSize", "Grain size", 1, 100, 25],
          ["roughness", "Grain roughness", 0, 100, 50],
          ["vignette", "Vignette", -100, 100, 0]
        ]}
      ];
      const defaults = Object.fromEntries(definitions.flatMap(group => group.sliders.map(([key, , , , value]) => [key, value])));
      const values = { ...defaults };
      const elements = {};
      for (const id of ["app", "file-input", "open-button", "empty-open", "export-button", "export-format", "reset-button", "preview", "empty-state", "photo-name", "photo-meta", "preview-note", "drop-zone", "slider-groups", "toast"]) {
        const element = document.getElementById(id);
        elements[id] = element;
        elements[id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = element;
      }
      const previewContext = elements.preview.getContext("2d", { willReadFrequently: true });
      const sourceCanvas = document.createElement("canvas");
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      let sourceImage = null;
      let sourceName = "";
      let renderQueued = false;
      let toastTimer;

      for (const group of definitions) {
        const section = document.createElement("section");
        section.className = "group";
        const heading = document.createElement("h3");
        heading.className = "group-title";
        heading.textContent = group.title;
        section.append(heading);
        elements["slider-groups"].append(section);
        for (const [key, label, min, max, initial] of group.sliders) {
          const row = document.createElement("div");
          row.className = "slider-row";
          const labelLine = document.createElement("div");
          labelLine.className = "slider-label";
          const labelElement = document.createElement("label");
          labelElement.htmlFor = `slider-${key}`;
          labelElement.textContent = label;
          const valueElement = document.createElement("output");
          valueElement.className = "value";
          valueElement.id = `value-${key}`;
          valueElement.htmlFor = `slider-${key}`;
          const slider = document.createElement("input");
          slider.type = "range";
          slider.id = `slider-${key}`;
          slider.min = min;
          slider.max = max;
          slider.value = initial;
          slider.dataset.key = key;
          slider.setAttribute("aria-label", label);
          labelLine.append(labelElement, valueElement);
          row.append(labelLine, slider);
          if (key === "grainSize") {
            const note = document.createElement("p");
            note.className = "quality-note";
            row.append(note);
          }
          section.append(row);
          updateSlider(slider);
          slider.addEventListener("input", () => {
            values[key] = Number(slider.value);
            updateSlider(slider);
            queueRender();
          });
        }
      }

      function updateSlider(slider) {
        const key = slider.dataset.key;
        const number = Number(slider.value);
        const out = document.getElementById(`value-${key}`);
        out.value = number > 0 && slider.min < 0 ? `+${number}` : String(number);
        out.textContent = out.value;
        const range = Number(slider.max) - Number(slider.min);
        slider.style.setProperty("--fill", `${((number - Number(slider.min)) / range) * 100}%`);
      }

      function queueRender() {
        if (!sourceImage || renderQueued) return;
        renderQueued = true;
        requestAnimationFrame(() => {
          renderQueued = false;
          render(sourceImage.width, sourceImage.height, true);
        });
      }

      function smoothstep(edge0, edge1, value) {
        const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
      }

      function grainHash(x, y, seed) {
        let value = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ seed) >>> 0;
        value = Math.imul(value ^ (value >>> 13), 1274126177);
        value = (value ^ (value >>> 16)) >>> 0;
        return value / 2147483647.5 - 1;
      }

      function smoothGrain(x, y, cellSize, seed) {
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        const blendX = smoothstep(0, 1, x / cellSize - gridX);
        const blendY = smoothstep(0, 1, y / cellSize - gridY);
        const top = grainHash(gridX, gridY, seed) * (1 - blendX)
          + grainHash(gridX + 1, gridY, seed) * blendX;
        const bottom = grainHash(gridX, gridY + 1, seed) * (1 - blendX)
          + grainHash(gridX + 1, gridY + 1, seed) * blendX;
        return top * (1 - blendY) + bottom * blendY;
      }

      function render(width, height, isPreview) {
        const scale = isPreview ? Math.min(1, 1500 / Math.max(width, height)) : 1;
        const outWidth = Math.max(1, Math.round(width * scale));
        const outHeight = Math.max(1, Math.round(height * scale));
        sourceCanvas.width = outWidth;
        sourceCanvas.height = outHeight;
        sourceContext.drawImage(sourceImage, 0, 0, outWidth, outHeight);
        const image = sourceContext.getImageData(0, 0, outWidth, outHeight);
        const pixels = image.data;
        const w = outWidth;
        const h = outHeight;
        const count = w * h;
        const baseLum = new Float32Array(count);
        const exposure = Math.pow(2, values.exposure / 100);
        const contrast = values.contrast / 100;
        const saturation = 1 + values.saturation / 100;
        const clarity = values.clarity / 100 * 0.7;
        const sharpness = values.sharpness / 100 * 0.9;
        const temperature = values.temperature / 100;
        const grainStrength = values.grain / 100 * 32;
        const grainScale = 1 + (values.grainSize - 1) / 99 * 7;
        const roughness = values.roughness / 100;
        const vignette = values.vignette / 100;
        const seed = (width * 73856093 ^ height * 19349663) >>> 0;

        for (let i = 0, p = 0; i < count; i++, p += 4) {
          let r = pixels[p] * exposure;
          let g = pixels[p + 1] * exposure;
          let b = pixels[p + 2] * exposure;
          const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          const shadowMask = 1 - smoothstep(0.12, 0.68, luma);
          const highlightMask = smoothstep(0.32, 0.9, luma);
          const blackMask = 1 - smoothstep(0.02, 0.3, luma);
          const whiteMask = smoothstep(0.72, 1, luma);
          const tonalShift = values.shadows * 0.48 * shadowMask
            + values.highlights * 0.42 * highlightMask
            + values.blacks * 0.32 * blackMask
            + values.whites * 0.32 * whiteMask;
          r += tonalShift + temperature * 22;
          g += tonalShift;
          b += tonalShift - temperature * 22;
          r = (r - 127.5) * (1 + contrast) + 127.5;
          g = (g - 127.5) * (1 + contrast) + 127.5;
          b = (b - 127.5) * (1 + contrast) + 127.5;
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          r = luminance + (r - luminance) * saturation;
          g = luminance + (g - luminance) * saturation;
          b = luminance + (b - luminance) * saturation;
          pixels[p] = Math.max(0, Math.min(255, r));
          pixels[p + 1] = Math.max(0, Math.min(255, g));
          pixels[p + 2] = Math.max(0, Math.min(255, b));
          baseLum[i] = 0.2126 * pixels[p] + 0.7152 * pixels[p + 1] + 0.0722 * pixels[p + 2];
        }

        if (clarity || sharpness) {
          const original = new Uint8ClampedArray(pixels);
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const i = y * w + x;
              const p = i * 4;
              const average = (baseLum[i - w - 1] + baseLum[i - w] + baseLum[i - w + 1]
                + baseLum[i - 1] + baseLum[i] + baseLum[i + 1]
                + baseLum[i + w - 1] + baseLum[i + w] + baseLum[i + w + 1]) / 9;
              const detail = baseLum[i] - average;
              const amount = clarity + sharpness;
              for (let channel = 0; channel < 3; channel++) {
                pixels[p + channel] = original[p + channel] + detail * amount;
              }
            }
          }
        }

        if (vignette || grainStrength) {
          const centerX = (w - 1) / 2;
          const centerY = (h - 1) / 2;
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY) || 1;
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const i = y * w + x;
              const p = i * 4;
              const dx = (x - centerX) / maxDistance;
              const dy = (y - centerY) / maxDistance;
              const edge = Math.min(1, (dx * dx + dy * dy) * 1.7);
              const vignetteFactor = 1 - vignette * edge * 0.72;
              let noise = 0;
              if (grainStrength) {
                const fine = (grainHash(x, y, seed) + grainHash(x + 7919, y + 104729, seed ^ 0x9e3779b9)) * 0.5;
                const coarse = smoothGrain(x, y, grainScale, seed ^ 0x85ebca6b);
                const organicMix = roughness * 0.55;
                noise = (fine * (1 - organicMix) + coarse * organicMix) * grainStrength;
              }
              pixels[p] = Math.max(0, Math.min(255, pixels[p] * vignetteFactor + noise));
              pixels[p + 1] = Math.max(0, Math.min(255, pixels[p + 1] * vignetteFactor + noise));
              pixels[p + 2] = Math.max(0, Math.min(255, pixels[p + 2] * vignetteFactor + noise));
            }
          }
        }

        if (isPreview) {
          elements.preview.width = outWidth;
          elements.preview.height = outHeight;
          previewContext.putImageData(image, 0, 0);
          elements.preview.style.display = "block";
          elements.emptyState.style.display = "none";
          if (elements.previewNote) {
            elements.previewNote.textContent = scale < 1 ? "Preview scaled · export saves full resolution" : "Full-resolution preview";
          }
        }
        return image;
      }

      function loadFile(file) {
        if (!file || !file.type.startsWith("image/")) {
          showToast("Please choose a valid image file.");
          return;
        }
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          if (sourceImage && sourceImage.src.startsWith("blob:")) URL.revokeObjectURL(sourceImage.src);
          sourceImage = image;
          sourceName = file.name.replace(/\.[^.]+$/, "") || "Untitled edit";
          elements.photoName.textContent = file.name;
          elements.photoMeta.textContent = `${image.naturalWidth.toLocaleString()} × ${image.naturalHeight.toLocaleString()}`;
          elements.exportButton.disabled = false;
          render(image.naturalWidth, image.naturalHeight, true);
          URL.revokeObjectURL(url);
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          showToast("This image could not be opened.");
        };
        image.src = url;
      }

      function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
      }

      elements.openButton.addEventListener("click", () => elements.fileInput.click());
      elements.emptyOpen.addEventListener("click", () => elements.fileInput.click());
      elements.fileInput.addEventListener("change", event => {
        loadFile(event.target.files[0]);
        event.target.value = "";
      });
      elements.resetButton.addEventListener("click", () => {
        Object.assign(values, defaults);
        for (const slider of elements["slider-groups"].querySelectorAll('input[type="range"]')) {
          slider.value = defaults[slider.dataset.key];
          updateSlider(slider);
        }
        queueRender();
      });
      elements.exportButton.addEventListener("click", () => {
        if (!sourceImage) return;
        try {
          const result = render(sourceImage.naturalWidth, sourceImage.naturalHeight, false);
          const exportCanvas = document.createElement("canvas");
          exportCanvas.width = result.width;
          exportCanvas.height = result.height;
          const format = elements.exportFormat.value;
          if (format === "image/jpeg") {
            for (let i = 0; i < result.data.length; i += 4) {
              const alpha = result.data[i + 3] / 255;
              result.data[i] = result.data[i] * alpha + 255 * (1 - alpha);
              result.data[i + 1] = result.data[i + 1] * alpha + 255 * (1 - alpha);
              result.data[i + 2] = result.data[i + 2] * alpha + 255 * (1 - alpha);
              result.data[i + 3] = 255;
            }
          }
          exportCanvas.getContext("2d").putImageData(result, 0, 0);
          exportCanvas.toBlob(blob => {
            if (!blob) {
              showToast("Export failed. Please try another image.");
              return;
            }
            if (blob.type !== format) {
              showToast(`${elements.exportFormat.selectedOptions[0].textContent} export is not supported by this browser.`);
              return;
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            const extension = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
            link.download = `${sourceName}-edited.${extension}`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          }, format, format === "image/png" ? undefined : 0.92);
        } catch (error) {
          console.error("Image export failed:", error);
          showToast("Export failed. Try a smaller image or reset some adjustments.");
        }
      });
      for (const eventName of ["dragenter", "dragover"]) {
        document.addEventListener(eventName, event => {
          event.preventDefault();
          elements.app.classList.add("dragging");
        });
      }
      for (const eventName of ["dragleave", "drop"]) {
        document.addEventListener(eventName, event => {
          event.preventDefault();
          if (eventName === "drop") loadFile(event.dataTransfer.files[0]);
          elements.app.classList.remove("dragging");
        });
      }
    })();
