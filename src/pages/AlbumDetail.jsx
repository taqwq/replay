import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'

function goTo(navigate, path) {
  if (document.startViewTransition) {
    document.startViewTransition(() => { flushSync(() => navigate(path)) })
  } else {
    navigate(path)
  }
}

export default function AlbumDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [color, setColor] = useState(null)
  const [colorVisible, setColorVisible] = useState(false)

  useEffect(() => {
    const data = getAlbumById(id)
    if (!data) { navigate('/'); return }
    setAlbum(data)
    let alive = true
    extractColor(data.coverUrl).then(c => {
      if (!alive) return
      setColor(c)
      setTimeout(() => { if (alive) setColorVisible(true) }, 80)
    })
    return () => { alive = false }
  }, [id])

  if (!album) return null

  const vtName = `cover-${album.id.replace(/-/g, '')}`

  function handleDelete() {
    if (window.confirm(`「${album.title}」を削除しますか？`)) {
      deleteAlbum(id)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* 上半分をアルバムの色で染める */}
      <div
        className="absolute top-0 left-0 right-0 h-[65vh] pointer-events-none"
        style={{
          background: color
            ? `linear-gradient(to bottom, rgba(${color}, 0.52) 0%, rgba(${color}, 0.16) 48%, transparent 100%)`
            : 'transparent',
          opacity: colorVisible ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      {/* ヘッダー */}
      <div className="relative z-10 max-w-[520px] mx-auto flex items-center justify-between px-6 py-5">
        <button
          onClick={() => goTo(navigate, '/')}
          className="text-white/60 hover:text-white text-sm transition active:scale-95"
        >
          ← 戻る
        </button>
        <button
          onClick={() => goTo(navigate, `/album/${id}/edit`)}
          className="font-display bg-white text-black text-[13px] font-semibold px-[18px] py-2 rounded-full transition hover:bg-white/85 active:scale-95"
        >
          編集
        </button>
      </div>

      <div className="relative z-10 max-w-[520px] mx-auto fade-up">
        {/* ジャケット */}
        <div className="px-8 pt-2">
          <div
            className="w-full aspect-square rounded-[18px] overflow-hidden shadow-[0_28px_64px_-20px_rgba(0,0,0,0.9)] bg-white/5"
            style={{ viewTransitionName: vtName }}
          >
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-white/10 text-sm tracking-widest select-none">NO COVER</span>
              </div>
            )}
          </div>
        </div>

        {/* 情報 */}
        <div className="px-7 pt-7 pb-14 flex flex-col">
          <h1 className="font-display text-white text-[28px] font-bold leading-[1.05] tracking-tight">
            {album.title}
          </h1>
          <p className="text-white/55 text-[15px] mt-2">{album.artist}</p>

          <div className="mt-5">
            <Dots rating={album.rating} size={7} />
          </div>

          {album.note && (
            <p className="mt-7 text-white/55 text-[13.5px] leading-[1.8] whitespace-pre-wrap">
              {album.note}
            </p>
          )}

          <button
            onClick={handleDelete}
            className="mt-14 self-center text-white/22 hover:text-red-400/70 text-[11px] tracking-widest uppercase transition duration-200"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
