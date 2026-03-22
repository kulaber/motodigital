/**
 * Extrahiert ein Thumbnail-Frame aus einer Video-Datei via Canvas API.
 * - Springt zu 1 Sekunde (oder 0 bei kürzeren Videos)
 * - Skaliert auf max. 800px Breite
 * - Exportiert als JPEG mit 80% Qualität
 */
export function generateVideoThumbnail(
  file: File,
  maxWidth = 800,
  quality = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const objectUrl = URL.createObjectURL(file)

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      // Seek to 1s or 25% of duration, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.25)
    }

    video.onseeked = () => {
      let { videoWidth: width, videoHeight: height } = video
      if (width === 0 || height === 0) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Video has no dimensions'))
        return
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Canvas context unavailable'))
        return
      }

      ctx.drawImage(video, 0, 0, width, height)
      URL.revokeObjectURL(objectUrl)

      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Failed to create thumbnail blob'))
            return
          }
          const thumbName = file.name.replace(/\.[^.]+$/, '_thumb.jpg')
          resolve(new File([blob], thumbName, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality,
      )
    }

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load video'))
    }

    video.src = objectUrl
  })
}
