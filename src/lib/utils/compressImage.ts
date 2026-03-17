/**
 * Komprimiert ein Bild-File im Browser via Canvas API.
 * - Skaliert auf max. 1400px Breite (Seitenverhältnis bleibt erhalten)
 * - Exportiert als JPEG mit 78% Qualität
 * - Überspringt GIFs (Animation würde verloren gehen)
 * - Gibt das Original zurück wenn das Bild nach Kompression größer wäre
 */
export async function compressImage(
  file: File,
  maxWidth = 1400,
  quality = 0.78,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  return new Promise(resolve => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
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
          file.name.replace(/\.[^.]+$/, '.jpg'),
          { type: 'image/jpeg' },
        )
        resolve(compressed)
      }, 'image/jpeg', quality)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}
