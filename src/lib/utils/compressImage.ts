/**
 * Komprimiert ein Bild-File im Browser via Canvas API.
 * - Skaliert auf maxWidth (Breite) bzw. maxHeight (Höhe) – jeweils die engere Grenze
 * - Exportiert als WebP (bessere Kompression als JPEG, ~95% Browser-Support)
 * - Überspringt GIFs (Animation würde verloren gehen)
 * - Gibt das Original zurück wenn das Bild nach Kompression größer wäre
 *
 * Empfohlene maxWidth-Werte je Kontext:
 *   avatar / profilbild : 400
 *   feed / community    : 1200  (600px CSS × 2× retina)
 *   galerie / builder   : 1200
 *   bike-listing        : 1600  (800px CSS × 2× retina)
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  quality = 0.82,
  maxHeight = 0,   // 0 = unbegrenzt
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  return new Promise(resolve => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Skaliere so, dass weder Breite noch Höhe überschritten wird
      const scaleW = width  > maxWidth               ? maxWidth  / width  : 1
      const scaleH = maxHeight > 0 && height > maxHeight ? maxHeight / height : 1
      const scale  = Math.min(scaleW, scaleH)

      if (scale < 1) {
        width  = Math.round(width  * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(blob => {
        if (!blob || blob.size >= file.size) {
          resolve(file)
          return
        }
        const compressed = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, '.webp'),
          { type: 'image/webp' },
        )
        resolve(compressed)
      }, 'image/webp', quality)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}
