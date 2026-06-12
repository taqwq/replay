import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { getAlbums } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'
import { AlbumCover, HeaderAction, PrimaryButton, TopBar } from '../components/ui'

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
  }, [album.coverUrl, album.id, onColorReady])

  // view-transition-name に使う安全な識別子（UUIDのハイフンを除去）
  const vtName = `cover-${album.id.replace(/-/g, '')}`

  return (
    <div
      ref={cardRef}
      data-album-id={album.id}
      onClick={() => goTo(navigate, `/album/${album.id}`)}
      className="group relative cursor-pointer fade-up"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {color && (
        <div
          className="pointer-events-none absolute -inset-x-3 -top-4 bottom-0 rounded-[28px] blur-[42px]"
          style={{
            background: `radial-gradient(circle at 50% 55%, rgb(${color}), transparent 68%)`,
            opacity: glowVisible ? 0.16 : 0,
            transition: 'opacity 0.7s ease',
          }}
        />
      )}

      <AlbumCover
        src={album.coverUrl}
        alt={album.title}
        viewTransitionName={vtName}
        className="rounded-[12px] transition duration-300 ease-out group-hover:scale-[1.008] group-active:scale-[0.985]"
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[12px]">
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.2) 58%, transparent 100%)' }}
        >
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold leading-[1.15] text-white">
              {album.title}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-[#b3b3b3]">{album.artist}</p>
            <div className="mt-2">
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
  const [albums] = useState(() => getAlbums())
  const [bgColor, setBgColor] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const colorMap = useRef({})
  const cardRefs = useRef({})

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
          ? `radial-gradient(ellipse 120% 48% at 50% 0%, rgba(${bgColor}, 0.052) 0%, #121212 58%)`
          : '#121212',
      }}
    >
      <TopBar
        compact={scrolled}
        left={<h1 className="font-display text-[18px] font-bold text-white">replay</h1>}
        right={<HeaderAction onClick={() => goTo(navigate, '/add')}><span className="mr-1 text-[14px]">+</span>Add</HeaderAction>}
      />

      <main className="flex flex-col gap-8 px-4 pb-20 pt-4 sm:px-5">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center gap-5 pt-20 text-center fade-up">
            <div className="aspect-square w-44 rounded-[12px] bg-[#181818] shadow-[inset_0_0_0_1px_rgba(124,124,124,0.18),0_8px_24px_rgba(0,0,0,0.5)]" />
            <div>
              <p className="text-[15px] font-medium text-white/58">最初の1枚を残す</p>
              <p className="mt-1 text-xs text-white/30">検索して、評価とメモだけ足せば完了です</p>
            </div>
            <PrimaryButton onClick={() => goTo(navigate, '/add')}>追加する</PrimaryButton>
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
      </main>
    </div>
  )
}
