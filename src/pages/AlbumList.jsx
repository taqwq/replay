import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getAlbums } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'

// 1枚のアルバムカード：ジャケット＋下にキャプション＋背後にアンビエントグロー
function AlbumCard({ album, index, onClick }) {
  const [color, setColor] = useState(null)

  useEffect(() => {
    let alive = true
    extractColor(album.coverUrl).then(c => { if (alive) setColor(c) })
    return () => { alive = false }
  }, [album.coverUrl])

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer group fade-up"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {/* アンビエントグロー（ジャケットの色が背後に滲む） */}
      {color && (
        <div
          className="absolute -inset-x-1 -top-2 bottom-6 rounded-[36px] blur-[38px] opacity-35 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle, rgb(${color}), transparent 70%)` }}
        />
      )}

      {/* ジャケット */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-[0_16px_44px_-16px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out group-hover:scale-[1.012] group-active:scale-[0.99] bg-white/5">
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
            <span className="font-display text-white/10 text-xl tracking-widest select-none">NO COVER</span>
          </div>
        )}
      </div>

      {/* キャプション（ギャラリーの作品札のように静かに） */}
      <div className="relative flex items-baseline justify-between pt-3 px-1">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="font-display text-white/90 text-[15px] font-medium whitespace-nowrap">{album.title}</span>
          <span className="text-white/35 text-xs truncate">{album.artist}</span>
        </div>
        <div className="flex-shrink-0 translate-y-[-1px]">
          <Dots rating={album.rating} />
        </div>
      </div>
    </div>
  )
}

export default function AlbumList() {
  const navigate = useNavigate()
  const [albums, setAlbums] = useState([])

  useEffect(() => {
    setAlbums(getAlbums())
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="max-w-[520px] mx-auto flex items-center justify-between px-6 py-5">
          <h1 className="font-display text-white font-bold text-[22px] tracking-tight">replay</h1>
          <button
            onClick={() => navigate('/add')}
            aria-label="アルバムを追加"
            className="w-9 h-9 rounded-full border border-white/15 text-white/80 text-lg font-light flex items-center justify-center transition duration-200 hover:border-white/40 hover:text-white active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      {/* フィード */}
      <div className="max-w-[520px] mx-auto px-6 pt-2 pb-16 flex flex-col gap-10">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center mt-36 gap-2 fade-up">
            <p className="font-display text-white/40 text-base">まだ何もありません</p>
            <p className="text-white/25 text-xs">右上の + から最初の1枚を</p>
          </div>
        ) : (
          albums.map((album, i) => (
            <AlbumCard
              key={album.id}
              album={album}
              index={i}
              onClick={() => navigate(`/album/${album.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}
