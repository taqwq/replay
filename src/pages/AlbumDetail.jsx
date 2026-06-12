import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { getAlbumById, deleteAlbum } from '../storage'
import { extractColor } from '../utils/color'
import { Dots } from '../components/Dots'
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
    <div className="relative min-h-screen overflow-hidden bg-[#121212]">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[65vh]"
        style={{
          background: color
            ? `linear-gradient(to bottom, rgba(${color}, 0.32) 0%, rgba(${color}, 0.1) 48%, transparent 100%)`
            : 'transparent',
          opacity: colorVisible ? 1 : 0,
          transition: 'opacity 0.7s ease',
        }}
      />

      <TopBar
        left={<BackButton onClick={() => goTo(navigate, '/')} />}
        right={<HeaderAction onClick={() => goTo(navigate, `/album/${id}/edit`)}>Edit</HeaderAction>}
      />

      <main className="relative z-10 fade-up">
        <div className="px-5 pt-4 sm:px-6">
          <AlbumCover
            src={album.coverUrl}
            alt={album.title}
            viewTransitionName={vtName}
            className="w-full rounded-[12px]"
          />
        </div>

        <div className="flex flex-col px-5 pb-14 pt-6 sm:px-6">
          <h1 className="text-[28px] font-bold leading-[1.08] text-white">
            {album.title}
          </h1>
          <p className="mt-2 text-[15px] text-[#b3b3b3]">{album.artist}</p>

          <div className="mt-5 flex items-center gap-3">
            <Dots rating={album.rating} size={7} />
            {album.genre && (
              <span className="rounded-full bg-[#1f1f1f] px-2.5 py-1 text-[11px] font-medium text-[#b3b3b3]/58">
                {album.genre}
              </span>
            )}
          </div>

          {album.note && (
            <p className="mt-7 whitespace-pre-wrap text-[14px] leading-6 text-[#b3b3b3]">
              {album.note}
            </p>
          )}

          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-12 self-start text-[11px] font-semibold text-white/22 transition hover:text-[#f3727f]"
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
