/**
 * Utility to compress and resize images client-side before uploading or transmitting
 * as base64 to avoid huge payloads, memory exhaustion, and reverse-proxy 502/504 HTML error pages.
 */
export async function compressImageFile(
  file: File,
  maxDimension: number = 1280,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (JPEG, PNG, or WebP).'));
      return;
    }

    // Read as FileReader
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Downscale if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original string if canvas context unavailable
            resolve(reader.result as string);
            return;
          }

          // Draw image to offscreen canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG base64 with requested quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // If canvas fails (e.g. extreme memory limit), fallback to original
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
