import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'

export default function AlbumDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [color, setColor] = useState(null)

  useEffect(() => {
    const data = getAlbumById(id)
    if (!data) { navigate('/'); return }
    setAlbum(data)
    let alive = true
    extractColor(data.coverUrl).then(c => { if (alive) setColor(c) })
    return () => { alive = false }
  }, [id])

  if (!album) return null

  function handleDelete() {
    if (window.confirm(`「${album.title}」を削除しますか？`)) {
      deleteAlbum(id)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* 上半分をアルバムの色で染める（眺める没入感の核） */}
      {color && (
        <div
          className="absolute top-0 left-0 right-0 h-[62vh] pointer-events-none transition-opacity duration-700"
          style={{
            background: `linear-gradient(to bottom, rgba(${color}, 0.55) 0%, rgba(${color}, 0.18) 45%, transparent 100%)`,
          }}
        />
      )}

      {/* ヘッダー */}
      <div className="relative z-10 max-w-[520px] mx-auto flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate('/')}
          className="text-white/60 hover:text-white text-sm transition active:scale-95"
        >
          ← 戻る
        </button>
        <button
          onClick={() => navigate(`/album/${id}/edit`)}
          className="font-display bg-white text-black text-[13px] font-semibold px-[18px] py-2 rounded-full transition hover:bg-white/85 active:scale-95"
        >
          編集
        </button>
      </div>

      <div className="relative z-10 max-w-[520px] mx-auto fade-up">
        {/* ジャケット */}
        <div className="px-10 pt-3">
          <div className="w-full aspect-square rounded-[18px] overflow-hidden shadow-[0_26px_60px_-20px_rgba(0,0,0,0.85)] bg-white/5">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-display text-white/10 text-xl tracking-widest select-none">NO COVER</span>
              </div>
            )}
          </div>
        </div>

        {/* 情報 */}
        <div className="px-7 pt-7 pb-12 flex flex-col">
          <h1 className="font-display text-white text-[28px] font-bold leading-[1.05] tracking-tight">{album.title}</h1>
          <p className="text-white/55 text-[15px] mt-1.5">{album.artist}</p>

          <div className="mt-5">
            <Dots rating={album.rating} size={7} />
          </div>

          {album.note && (
            <p className="mt-6 text-white/60 text-sm leading-[1.75] whitespace-pre-wrap">{album.note}</p>
          )}

          {/* 削除 — 静かに置いておく */}
          <button
            onClick={handleDelete}
            className="mt-12 self-center text-white/25 hover:text-red-400/80 text-xs tracking-wide transition"
          >
            このアルバムを削除
          </button>
        </div>
      </div>
    </div>
  )
}
