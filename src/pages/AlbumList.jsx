import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { getAlbums } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'

// View Transitions 対応ナビゲーション
function goTo(navigate, path) {
  if (document.startViewTransition) {
    document.startViewTransition(() => { flushSync(() => navigate(path)) })
  } else {
    navigate(path)
  }
}

// B案カード：タイトル・アーティスト・ドットをジャケット内下部に配置
function AlbumCard({ album, index, cardRef, onColorReady }) {
  const navigate = useNavigate()
  const [color, setColor] = useState(null)
  const [glowVisible, setGlowVisible] = useState(false)

  useEffect(() => {
    let alive = true
    extractColor(album.coverUrl).then(c => {
      if (!alive) return
      setColor(c)
      onColorReady(album.id, c)
      // 少し遅らせてトランジションを効かせる
      setTimeout(() => { if (alive) setGlowVisible(true) }, 80)
    })
    return () => { alive = false }
  }, [album.coverUrl])

  // view-transition-name に使う安全な識別子（UUIDのハイフンを除去）
  const vtName = `cover-${album.id.replace(/-/g, '')}`

  return (
    <div
      ref={cardRef}
      data-album-id={album.id}
      onClick={() => goTo(navigate, `/album/${album.id}`)}
      className="relative cursor-pointer group fade-up"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {/* アンビエントグロー（色抽出後にふわっと点灯） */}
      {color && (
        <div
          className="absolute -inset-x-2 -top-3 bottom-0 rounded-[36px] blur-[40px] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 55%, rgb(${color}), transparent 68%)`,
            opacity: glowVisible ? 0.38 : 0,
            transition: 'opacity 0.7s ease',
          }}
        />
      )}

      {/* ジャケット本体 */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-[0_20px_50px_-18px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out group-hover:scale-[1.012] group-active:scale-[0.985] bg-white/5"
        style={{ viewTransitionName: vtName }}
      >
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-white/10 text-sm tracking-widest select-none">NO COVER</span>
          </div>
        )}

        {/* ジャケット内下部：薄いスクリム＋テキスト */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-white font-semibold text-[16px] leading-[1.15] tracking-[-0.01em] truncate">
                {album.title}
              </p>
              <p className="text-white/65 text-[11.5px] mt-0.5 truncate">{album.artist}</p>
            </div>
            <div className="flex-shrink-0 pb-0.5">
              <Dots rating={album.rating} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AlbumList() {
  const navigate = useNavigate()
  const [albums, setAlbums] = useState([])
  const [bgColor, setBgColor] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const colorMap = useRef({})
  const cardRefs = useRef({})

  useEffect(() => { setAlbums(getAlbums()) }, [])

  const handleColorReady = useCallback((id, color) => {
    colorMap.current[id] = color
  }, [])

  // スクロール：中央に最も近いカードの色をページ背景に反映
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)

      const mid = window.innerHeight / 2
      let bestId = null, bestDist = Infinity
      Object.entries(cardRefs.current).forEach(([id, el]) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const dist = Math.abs((r.top + r.bottom) / 2 - mid)
        if (dist < bestDist) { bestDist = dist; bestId = id }
      })
      if (bestId && colorMap.current[bestId]) {
        setBgColor(colorMap.current[bestId])
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // 初回実行（画面トップのアルバムの色を即反映）
    setTimeout(onScroll, 200)
    return () => window.removeEventListener('scroll', onScroll)
  }, [albums])

  return (
    <div
      className="min-h-screen transition-[background] duration-700"
      style={{
        background: bgColor
          ? `radial-gradient(ellipse 120% 50% at 50% 0%, rgba(${bgColor}, 0.07) 0%, #0a0a0a 55%)`
          : '#0a0a0a',
      }}
    >
      {/* ヘッダー：スクロールで縮む */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/90' : 'bg-transparent'}`}>
        <div className="max-w-[520px] mx-auto flex items-center justify-between px-6 transition-all duration-300"
          style={{ paddingTop: scrolled ? 12 : 20, paddingBottom: scrolled ? 12 : 20 }}
        >
          <h1
            className="font-display text-white font-bold tracking-tight transition-all duration-300"
            style={{ fontSize: scrolled ? 18 : 22 }}
          >
            replay
          </h1>
          <button
            onClick={() => goTo(navigate, '/add')}
            aria-label="アルバムを追加"
            className="w-8 h-8 rounded-full border border-white/15 text-white/70 text-lg font-light flex items-center justify-center transition duration-200 hover:border-white/40 hover:text-white active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      {/* フィード */}
      <div className="max-w-[520px] mx-auto px-6 pt-1 pb-20 flex flex-col gap-10">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center mt-24 gap-6 fade-up">
            {/* ジャケットの幽霊 */}
            <div className="w-44 aspect-square rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="font-display text-white/40 text-base">まだ何もありません</p>
              <p className="text-white/25 text-xs">右上の + から最初の1枚を</p>
            </div>
          </div>
        ) : (
          albums.map((album, i) => (
            <AlbumCard
              key={album.id}
              album={album}
              index={i}
              cardRef={el => { cardRefs.current[album.id] = el }}
              onColorReady={handleColorReady}
            />
          ))
        )}
      </div>
    </div>
  )
}
