import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'

function StarRating({ rating }) {
  return (
    <span className="text-yellow-400 text-xl tracking-tight">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function AlbumDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [album, setAlbum] = useState(null)

  useEffect(() => {
    const data = getAlbumById(id)
    if (!data) navigate('/')
    else setAlbum(data)
  }, [id])

  if (!album) return null

  function handleDelete() {
    if (window.confirm(`「${album.title}」を削除しますか？`)) {
      deleteAlbum(id)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={() => navigate('/')} className="text-white/60 hover:text-white text-sm transition">
          ← 戻る
        </button>
        <button
          onClick={() => navigate(`/album/${id}/edit`)}
          className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition"
        >
          編集
        </button>
      </div>

      <div className="max-w-[520px] mx-auto">
        {/* ジャケット */}
        <div className="aspect-square w-full bg-white/5">
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-8xl">
              🎵
            </div>
          )}
        </div>

        {/* 情報 */}
        <div className="px-4 py-5 flex flex-col gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight">{album.title}</h1>
            <p className="text-white/60 text-base mt-1">{album.artist}</p>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={album.rating} />
            {album.genre && (
              <span className="text-white/40 text-xs border border-white/10 rounded-full px-3 py-0.5">
                {album.genre}
              </span>
            )}
          </div>

          {album.note && (
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{album.note}</p>
          )}

          {/* 削除ボタン */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={handleDelete}
              className="w-full py-2.5 text-red-400 text-sm border border-red-400/20 rounded-xl hover:bg-red-400/5 transition"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
