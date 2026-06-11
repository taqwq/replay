import { useNavigate } from 'react-router-dom'
import { getAlbums } from '../storage'
import { useState, useEffect } from 'react'

function StarRating({ rating }) {
  return (
    <span className="text-yellow-400 text-sm tracking-tight">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
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
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-white font-bold text-lg tracking-tight">Replay</h1>
        <button
          onClick={() => navigate('/add')}
          className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition"
        >
          + Add
        </button>
      </div>

      {/* コンテンツ */}
      <div className="max-w-[520px] mx-auto px-4 py-4 flex flex-col gap-3">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-32 gap-3 text-white/30">
            <span className="text-5xl">🎵</span>
            <p className="text-sm">まだアルバムがありません</p>
            <p className="text-xs">「+ Add」から最初の1枚を記録しよう</p>
          </div>
        ) : (
          albums.map(album => (
            <div
              key={album.id}
              onClick={() => navigate(`/album/${album.id}`)}
              className="relative rounded-xl overflow-hidden cursor-pointer aspect-square bg-white/5"
            >
              {/* ジャケット */}
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-6xl">
                  🎵
                </div>
              )}

              {/* 下部グラデーションオーバーレイ */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-white font-bold text-xl leading-tight truncate">{album.title}</p>
                <p className="text-white/70 text-sm truncate">{album.artist}</p>
                <div className="mt-1">
                  <StarRating rating={album.rating} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
