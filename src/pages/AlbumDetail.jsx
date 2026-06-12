import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'
import { extractColor } from '../utils/color'
import { Stars } from '../components/Stars'
import { AlbumCover, BackButton, ConfirmDialog, HeaderAction, TopBar } from '../components/ui'

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
  const [album] = useState(() => getAlbumById(id))
  const [heroVisible, setHeroVisible] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!album) navigate('/')
  }, [album, navigate])

  // --extracted をrootに注入。離脱時にクリーンアップ（フォールバック#888に戻る）
  useEffect(() => {
    if (!album) return
    let alive = true
    extractColor(album.coverUrl).then(c => {
      if (!alive || !c) return
      document.documentElement.style.setProperty('--extracted', `rgb(${c})`)
      setTimeout(() => { if (alive) setHeroVisible(true) }, 80)
    })
    return () => {
      alive = false
      document.documentElement.style.removeProperty('--extracted')
    }
  }, [album])

  if (!album) return null

  const vtName = `cover-${album.id.replace(/-/g, '')}`

  function handleDeleteConfirm() {
    deleteAlbum(id)
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060607]">
      {/* ヒーロー：抽出色が天井から溶けて漆黒に到達する */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[60vh]"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--extracted) 20%, #060607) 0%, #060607 55%)',
          opacity: heroVisible ? 1 : 0,
          transition: 'opacity 600ms var(--ease-smooth)',
        }}
      />

      <TopBar
        transparent
        left={<BackButton onClick={() => goTo(navigate, '/')} />}
        right={<HeaderAction onClick={() => goTo(navigate, `/album/${id}/edit`)}>Edit</HeaderAction>}
      />

      <main className="relative z-10 fade-up">
        {/* ジャケット：一覧と同幅＝View Transitionが純粋な滑走になる */}
        <div className="px-4 pt-4">
          <AlbumCover
            src={album.coverUrl}
            alt={album.title}
            viewTransitionName={vtName}
            className="w-full cover-glow"
          />
        </div>

        <div className="flex flex-col px-4 pb-16 pt-8">
          <h1 className="text-[36px] font-bold leading-[42px] tracking-[-0.03em] text-[#F4F4F5] [overflow-wrap:anywhere]">
            {album.title}
          </h1>
          <p className="mt-2 text-[13px] font-medium leading-[18px] text-[#86868B]">
            {album.artist}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Stars rating={album.rating} size={16} />
            {album.genre && (
              <span className="rounded-full bg-[#161619] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#86868B]">
                {album.genre}
              </span>
            )}
          </div>

          {album.note && (
            <div className="mt-12">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#52525B]">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[#F4F4F5]">
                {album.note}
              </p>
            </div>
          )}

          {/* 破壊的操作は探した人だけが見つける */}
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-16 self-start py-3 text-[13px] font-medium text-[#52525B] transition hover:text-[#E05454]"
          >
            Delete
          </button>
        </div>
      </main>

      <ConfirmDialog
        open={confirmingDelete}
        title="この記録を削除しますか？"
        description={`「${album.title}」の評価とメモがこの端末から削除されます。`}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
