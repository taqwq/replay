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
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {/* ジャケットをブラーして背景に敷く（Spotify風） */}
      {album.coverUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${album.coverUrl})` }}
        />
      )}
      {/* 暗くする上掛け */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-[#0a0a0a]/80 to-[#0a0a0a] pointer-events-none" />

      {/* ヘッダー */}
      <div className="relative z-10 sticky top-0 flex items-center justify-between px-4 py-3 bg-transparent">
        <button
          onClick={() => navigate('/')}
          className="text-white/60 hover:text-white text-sm transition active:scale-95"
        >
          ← 戻る
        </button>
        <button
          onClick={() => navigate(`/album/${id}/edit`)}
          className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full transition hover:bg-white/85 active:scale-95"
        >
          編集
        </button>
      </div>

      <div className="relative z-10 max-w-[520px] mx-auto">
        {/* ジャケット */}
        <div className="px-6 pt-2">
          <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10 text-8xl select-none">
                🎵
              </div>
            )}
          </div>
        </div>

        {/* 情報 */}
        <div className="px-6 pt-6 pb-10 flex flex-col gap-5">
          {/* タイトル・アーティスト */}
          <div>
            <h1 className="text-white text-2xl font-bold leading-tight tracking-tight">{album.title}</h1>
            <p className="text-white/50 text-base mt-1 font-medium">{album.artist}</p>
          </div>

          {/* 評価・ジャンル */}
          <div className="flex items-center gap-3">
            <StarRating rating={album.rating} />
            {album.genre && (
              <span className="text-white/40 text-xs border border-white/10 rounded-full px-3 py-1 font-medium">
                {album.genre}
              </span>
            )}
          </div>

          {/* 感想 */}
          {album.note && (
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{album.note}</p>
          )}

          {/* 削除ボタン */}
          <div className="pt-4 mt-2 border-t border-white/5">
            <button
              onClick={handleDelete}
              className="w-full py-3 text-red-400 text-sm font-medium border border-red-400/20 rounded-xl transition hover:bg-red-400/5 active:scale-[0.98]"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
