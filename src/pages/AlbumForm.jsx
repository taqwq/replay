import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'
import { searchAlbums } from '../utils/itunes'
import { DotRating } from '../components/Dots'
import { AlbumCover, Field, GhostButton, PrimaryButton, TopBar } from '../components/ui'

const EMPTY = { title: '', artist: '', coverUrl: '', rating: 3, genre: 'Other', note: '' }

export default function AlbumForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && id) return { ...EMPTY, ...getAlbumById(id) }
    return EMPTY
  })
  const [errors, setErrors] = useState({})
  const [showDetails, setShowDetails] = useState(false)

  // MusicBrainz検索
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef(null)

  // 検索欄の外をタップしたら候補を閉じる
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setResults([])
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setSearchError('')
    setResults([])
    try {
      const items = await searchAlbums(query)
      if (items.length === 0) setSearchError('見つかりませんでした')
      else setResults(items)
    } catch {
      setSearchError('検索に失敗しました')
    } finally {
      setSearching(false)
    }
  }

  function handleSelect(item) {
    setForm(f => ({ ...f, title: item.title, artist: item.artist, coverUrl: item.coverUrl }))
    setErrors({})
    setResults([])
    setQuery('')
  }

  function handleSave() {
    const e = {}
    if (!form.title.trim()) e.title = 'アルバム名を入れてください'
    if (!form.artist.trim()) e.artist = 'アーティスト名を入れてください'
    if (Object.keys(e).length > 0) { setErrors(e); return }

    if (mode === 'edit') {
      updateAlbum(id, form)
      navigate(`/album/${id}`)
    } else {
      addAlbum(form)
      navigate('/')
    }
  }

  function handleBack() {
    if (mode === 'edit') navigate(`/album/${id}`)
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <TopBar
        title={mode === 'edit' ? '編集' : '追加'}
        left={<GhostButton onClick={handleBack}>戻る</GhostButton>}
        right={<PrimaryButton onClick={handleSave}>保存</PrimaryButton>}
      />

      <main className="mx-auto max-w-[520px] px-5 pb-16 pt-5 sm:px-7 fade-up">

        <div ref={searchRef} className="relative">
          <div className="flex min-h-12 items-center gap-3 rounded-full border border-white/[0.07] bg-white/[0.055] px-4 transition focus-within:border-white/[0.15] focus-within:bg-white/[0.08]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2.4" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={searching ? '検索中...' : 'アルバムを検索'}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/34"
            />
            <button
              onClick={handleSearch}
              className="rounded-full px-2 py-1 text-[12px] font-medium text-white/44 transition hover:bg-white/[0.07] hover:text-white"
            >
              Enter
            </button>
          </div>
          {searchError && <p className="mt-2 px-2 text-xs text-white/34">{searchError}</p>}

          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-[18px] border border-white/[0.08] bg-[#151515] p-1 shadow-2xl">
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left transition hover:bg-white/[0.055] fade-up"
                  style={{ animationDelay: `${Math.min(i * 35, 280)}ms` }}
                >
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 rounded-[7px] bg-white/10 object-cover"
                    onError={e => { e.target.style.visibility = 'hidden' }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white/90">{item.title}</p>
                    <p className="truncate text-xs text-white/42">{item.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-7 flex justify-center">
          <AlbumCover src={form.coverUrl} alt="cover" className="w-[204px] rounded-[16px]" />
        </div>

        <div className="mt-8 flex flex-col gap-7">
          <Field label="Album" error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="replay-input"
            />
          </Field>

          <Field label="Artist" error={errors.artist}>
            <input
              type="text"
              value={form.artist}
              onChange={e => set('artist', e.target.value)}
              className="replay-input"
            />
          </Field>

          <Field label="Rating">
            <DotRating value={form.rating} onChange={v => set('rating', v)} />
          </Field>

          <Field label="Notes" hint="任意">
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={4}
              placeholder="聴いた感想、思い出など..."
              className="replay-input resize-none leading-7"
            />
          </Field>

          <button
            onClick={() => setShowDetails(s => !s)}
            className="self-start rounded-full px-1 text-xs font-medium text-white/32 transition hover:text-white/58"
          >
            {showDetails ? '詳細を閉じる' : '詳細: ジャケットURL / ジャンル'}
          </button>

          {showDetails && (
            <div className="flex flex-col gap-7 fade-up">
              <Field label="Cover URL">
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={e => set('coverUrl', e.target.value)}
                  placeholder="https://..."
                  className="replay-input"
                />
              </Field>
              <Field label="Genre">
                <select
                  value={form.genre}
                  onChange={e => set('genre', e.target.value)}
                  className="replay-input"
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
