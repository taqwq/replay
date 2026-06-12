import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { getAlbums } from '../storage'
import { extractColor } from '../utils/color'
import { Stars } from '../components/Stars'
import { AlbumCover, HeaderAction, PrimaryButton, TopBar } from '../components/ui'

// View Transitions 対応ナビゲーション
function goTo(navigate, path) {
  if (document.startViewTransition) {
    document.startViewTransition(() => { flushSync(() => navigate(path)) })
  } else {
    navigate(path)
  }
}

// スリーブ提示：無加工の直角ジャケット＋下に分離キャプション
function AlbumCard({ album, index, cardRef, onColorReady }) {
  const navigate = useNavigate()
  const [color, setColor] = useState(null)
  const [glowOn, setGlowOn] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    let alive = true
    extractColor(album.coverUrl).then(c => {
      if (!alive) return
      setColor(c)
      onColorReady(album.id, c)
      setTimeout(() => { if (alive) setGlowOn(true) }, 80)
    })
    return () => { alive = false }
  }, [album.coverUrl, album.id, onColorReady])

  const vtName = `cover-${album.id.replace(/-/g, '')}`

  // glow: スリーブ縁1px + 黒影 + 抽出色の発光（box-shadow方式、per-card色なのでインライン）
  const glow = color && glowOn
    ? `0 0 0 1px rgba(255,255,255,0.06), 0 12px 60px rgba(0,0,0,0.85), 0 0 80px rgba(${color}, 0.25)`
    : '0 0 0 1px rgba(255,255,255,0.06), 0 12px 60px rgba(0,0,0,0.85)'

  return (
    <div
      ref={cardRef}
      onClick={() => goTo(navigate, `/album/${album.id}`)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="cursor-pointer fade-up"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <AlbumCover
        src={album.coverUrl}
        alt={album.title}
        viewTransitionName={vtName}
        className="w-full transition-transform duration-200 ease-out active:scale-[0.99]"
        style={{
          boxShadow: glow,
          outline: hovering && color ? `1px solid rgba(${color}, 0.4)` : 'none',
          transform: hovering ? 'scale(1.004)' : 'none',
          transition: 'box-shadow 600ms var(--ease-smooth), outline 200ms, transform 200ms var(--ease-smooth)',
        }}
      />

      {/* キャプション：レコード棚の値札のように下に分離 */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="min-w-0 truncate text-[15px] font-semibold leading-5 tracking-[-0.01em] text-[#F4F4F5]">
            {album.title}
          </p>
          <div className="ml-4 flex-shrink-0">
            <Stars rating={album.rating} size={12} />
          </div>
        </div>
        <p className="mt-1 truncate text-[13px] font-medium leading-[18px] text-[#86868B]">
          {album.artist}
        </p>
      </div>
    </div>
  )
}

export default function AlbumList() {
  const navigate = useNavigate()
  const [albums] = useState(() => getAlbums())
  const [bgColor, setBgColor] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const colorMap = useRef({})
  const cardRefs = useRef({})

  const handleColorReady = useCallback((id, color) => {
    colorMap.current[id] = color
  }, [])

  // スクロール：中央に最も近いカードの色を天井からごく薄く滲ませる（6%上限）
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
    setTimeout(onScroll, 200)
    return () => window.removeEventListener('scroll', onScroll)
  }, [albums])

  return (
    <div
      className="min-h-screen transition-[background] duration-700"
      style={{
        background: bgColor
          ? `radial-gradient(ellipse 120% 40% at 50% 0%, rgba(${bgColor}, 0.06) 0%, #060607 60%)`
          : '#060607',
      }}
    >
      <TopBar
        compact={scrolled}
        left={
          <h1 className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#86868B]">
            Replay
          </h1>
        }
        right={
          <HeaderAction onClick={() => goTo(navigate, '/add')}>
            <span className="mr-1 text-[14px] leading-none">+</span>Add
          </HeaderAction>
        }
      />

      <main className="px-4 pb-16 pt-8">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center pt-16 text-center fade-up">
            {/* 空のスリーブ：無彩色・無発光。アルバムが入った瞬間に色が生まれる */}
            <div
              className="aspect-square w-48 bg-[#0E0E10]"
              style={{ border: '1px solid var(--border)' }}
            />
            <p className="mt-8 text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-[#F4F4F5]">
              最初の1枚を棚に置く
            </p>
            <p className="mt-2 text-[13px] font-medium leading-[18px] text-[#86868B]">
              検索して、評価とメモを残すだけ
            </p>
            <div className="mt-6">
              <PrimaryButton onClick={() => goTo(navigate, '/add')}>アルバムを追加</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {albums.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                index={i}
                cardRef={el => { cardRefs.current[album.id] = el }}
                onColorReady={handleColorReady}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
