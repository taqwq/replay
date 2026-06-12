import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'
import { searchAlbums } from '../utils/itunes'
import { DotRating } from '../components/Dots'
import { AlbumCover, BackButton, Field, FieldGroup, HeaderAction, IconButton, Spinner, TopBar } from '../components/ui'

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
  const canSave = form.title.trim() && form.artist.trim()

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
    <div className="min-h-screen bg-[#121212]">
      <TopBar
        left={<BackButton onClick={handleBack} />}
        right={<HeaderAction onClick={handleSave} disabled={!canSave}>Save</HeaderAction>}
      />

      <main className="px-4 pb-16 pt-5 sm:px-5 fade-up">

        <div ref={searchRef} className="relative">
          {mode === 'edit' && (
            <p className="mb-2 px-1 text-[11px] font-semibold text-[#b3b3b3]/44">別のアルバムに差し替え</p>
          )}
          <div className="flex min-h-12 items-center gap-3 rounded-full bg-[#1f1f1f] px-4 shadow-[rgb(18,18,18)_0_1px_0,rgba(124,124,124,0.28)_0_0_0_1px_inset] transition focus-within:bg-[#252525] focus-within:shadow-[rgb(18,18,18)_0_1px_0,rgba(255,255,255,0.42)_0_0_0_1px_inset]">
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
            {searching ? (
              <Spinner />
            ) : (
              <IconButton
                label="検索"
                disabled={!query.trim()}
                onClick={handleSearch}
                className="h-7 w-7 bg-white/[0.04] disabled:pointer-events-none disabled:opacity-25"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </IconButton>
            )}
          </div>
          {searchError && <p className="mt-2 px-2 text-xs text-white/34">{searchError}</p>}

          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-[12px] bg-[#181818] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.07]">
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
          <AlbumCover src={form.coverUrl} alt="cover" className="w-[196px] rounded-[12px]" />
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <FieldGroup>
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

            <Field label="Genre">
              <select
                value={form.genre}
                onChange={e => set('genre', e.target.value)}
                className="replay-input"
              >
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Notes">
              <textarea
                value={form.note}
                onChange={e => set('note', e.target.value)}
                rows={4}
                placeholder="聴いた感想、思い出など..."
                className="replay-input resize-none leading-6"
              />
            </Field>
          </FieldGroup>

          <button
            onClick={() => setShowDetails(s => !s)}
            className="self-start rounded-full px-1 text-xs font-medium text-white/32 transition hover:text-white/58"
          >
            {showDetails ? 'Cover URLを閉じる' : 'Cover URL'}
          </button>

          {showDetails && (
            <FieldGroup className="fade-up">
              <Field label="Cover URL">
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={e => set('coverUrl', e.target.value)}
                  placeholder="https://..."
                  className="replay-input"
                />
              </Field>
            </FieldGroup>
          )}
        </div>
      </main>
    </div>
  )
}
