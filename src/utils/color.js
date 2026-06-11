// ジャケット画像から代表色を抽出する
// canvas に縮小描画してピクセルをサンプリングし、
// 暗すぎ・白すぎを除いた「彩度の高い」ピクセルの平均色を返す

const cache = new Map() // url -> "r,g,b" | null

export async function extractColor(url) {
  if (!url) return null
  if (cache.has(url)) return cache.get(url)

  const result = await new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // CORS 許可がないと canvas が読めない
    img.onload = () => {
      try {
        const size = 24
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, size, size)
        const { data } = ctx.getImageData(0, 0, size, size)

        let r = 0, g = 0, b = 0, n = 0
        let fr = 0, fg = 0, fb = 0, fn = 0 // フォールバック用（全ピクセル平均）

        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2]
          fr += pr; fg += pg; fb += pb; fn++

          const max = Math.max(pr, pg, pb)
          const min = Math.min(pr, pg, pb)
          const luma = 0.299 * pr + 0.587 * pg + 0.114 * pb
          const sat = max - min

          // 暗すぎ・明るすぎ・無彩色は除外
          if (luma < 40 || luma > 225 || sat < 25) continue
          r += pr; g += pg; b += pb; n++
        }

        if (n > 10) {
          resolve([Math.round(r / n), Math.round(g / n), Math.round(b / n)])
        } else if (fn > 0) {
          resolve([Math.round(fr / fn), Math.round(fg / fn), Math.round(fb / fn)])
        } else {
          resolve(null)
        }
      } catch {
        resolve(null) // CORS で読めなかった場合など
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })

  const str = result ? result.join(',') : null
  cache.set(url, str)
  return str
}
