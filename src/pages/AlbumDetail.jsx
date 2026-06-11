import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'
import { AlbumCover, ConfirmDialog, GhostButton, PrimaryButton, TopBar } from '../components/ui'

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
  const [color, setColor] = useState(null)
  const [colorVisible, setColorVisible] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!album) navigate('/')
  }, [album, navigate])

  useEffect(() => {
    if (!album) return
    let alive = true
    extractColor(album.coverUrl).then(c => {
      if (!alive) return
      setColor(c)
      setTimeout(() => { if (alive) setColorVisible(true) }, 80)
    })
    return () => { alive = false }
  }, [album])

  if (!album) return null

  const vtName = `cover-${album.id.replace(/-/g, '')}`

  function handleDeleteConfirm() {
    deleteAlbum(id)
    navigate('/')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080808]">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[65vh]"
        style={{
          background: color
            ? `linear-gradient(to bottom, rgba(${color}, 0.42) 0%, rgba(${color}, 0.13) 48%, transparent 100%)`
            : 'transparent',
          opacity: colorVisible ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      <TopBar
        left={<GhostButton onClick={() => goTo(navigate, '/')}>戻る</GhostButton>}
        right={<PrimaryButton onClick={() => goTo(navigate, `/album/${id}/edit`)}>編集</PrimaryButton>}
      />

      <main className="relative z-10 mx-auto max-w-[520px] fade-up">
        <div className="px-7 pt-4 sm:px-8">
          <AlbumCover
            src={album.coverUrl}
            alt={album.title}
            viewTransitionName={vtName}
            className="w-full rounded-[18px]"
          />
        </div>

        <div className="flex flex-col px-6 pb-14 pt-7 sm:px-7">
          <h1 className="text-[30px] font-bold leading-[1.04] tracking-[-0.03em] text-white">
            {album.title}
          </h1>
          <p className="mt-2 text-[15px] text-white/58">{album.artist}</p>

          <div className="mt-5 flex items-center gap-3">
            <Dots rating={album.rating} size={7} />
            {album.genre && (
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[11px] font-medium text-white/42">
                {album.genre}
              </span>
            )}
          </div>

          {album.note ? (
            <p className="mt-7 whitespace-pre-wrap text-[14px] leading-7 text-white/58">
              {album.note}
            </p>
          ) : (
            <p className="mt-7 text-[13px] text-white/28">メモはまだありません。</p>
          )}

          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-14 self-center rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/22 transition hover:bg-white/[0.04] hover:text-[#ff6b6b]"
          >
            削除
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
