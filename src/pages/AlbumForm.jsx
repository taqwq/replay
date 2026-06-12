import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'
import { searchAlbums } from '../utils/itunes'
import { extractColor } from '../utils/color'
import { StarRating } from '../components/Stars'
import { AlbumCover, BackButton, Field, FieldGroup, HeaderPrimary, IconButton, Spinner, TopBar } from '../components/ui'

const EMPTY = { title: '', artist: '', coverUrl: '', rating: 3, genre: 'Other', note: '' }

export default function AlbumForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(() => {
    if (mode === 'edit' && id) return { ...EMPTY, ...getAlbumById(id) }
    return EMPTY
  })
  const [errors, setErrors] = useState({})
  const [showCoverUrl, setShowCoverUrl] = useState(false)

  // MusicBrainz検索
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef(null)
  const canSave = form.title.trim() && form.artist.trim()

  // プレビューのglowとフォーカスリングに抽出色を使う（root注入・離脱時クリア）
  useEffect(() => {
    let alive = true
    if (form.coverUrl) {
      extractColor(form.coverUrl).then(c => {
        if (alive && c) document.documentElement.style.setProperty('--extracted', `rgb(${c})`)
      })
    }
    return () => {
      alive = false
      document.documentElement.style.removeProperty('--extracted')
    }
  }, [form.coverUrl])

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
    <div className="min-h-screen bg-[#060607]">
      <TopBar
        left={<BackButton onClick={handleBack} />}
        right={<HeaderPrimary onClick={handleSave} disabled={!canSave}>Save</HeaderPrimary>}
      />

      <main className="px-4 pb-16 pt-6 fade-up">

        {/* 検索ピル：メインの入力経路 */}
        <div ref={searchRef} className="relative">
          {mode === 'edit' && (
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#52525B]">
              別のアルバムに差し替え
            </p>
          )}
          <div
            className="flex h-12 items-center gap-3 rounded-full bg-[#161619] px-4 transition focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--extracted)_60%,transparent)]"
            style={{ border: '1px solid var(--border)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525B" strokeWidth="2.4" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={searching ? '検索中...' : 'アルバムを検索'}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-[#F4F4F5] outline-none placeholder:text-[#52525B]"
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
          {searchError && <p className="mt-2 px-2 text-[13px] text-[#86868B]">{searchError}</p>}

          {/* 検索結果：surface-3の浮遊パネル。サムネも直角スリーブ */}
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-[10px] bg-[#1E1E22] p-1 shadow-[0_12px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.06]">
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="flex h-14 w-full items-center gap-3 rounded-[6px] px-2 text-left transition hover:bg-white/[0.05] fade-up"
                  style={{ animationDelay: `${Math.min(i * 30, 240)}ms` }}
                >
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 bg-white/10 object-cover"
                    onError={e => { e.target.style.visibility = 'hidden' }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[#F4F4F5]">{item.title}</p>
                    <p className="truncate text-[11px] font-medium text-[#86868B]">{item.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* プレビュー：抽出色glowで「正解」を演出 */}
        <div className="mt-8 flex justify-center">
          <AlbumCover
            src={form.coverUrl}
            alt="cover"
            className={`w-48 ${form.coverUrl ? 'cover-glow' : ''}`}
            style={!form.coverUrl ? { border: '1px solid var(--border)' } : undefined}
          />
        </div>

        <div className="mt-12 flex flex-col gap-12">
          <FieldGroup>
            <Field label="Album" error={errors.title}>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                className={`replay-input ${errors.title ? 'input-error' : ''}`}
              />
            </Field>

            <Field label="Artist" error={errors.artist}>
              <input
                type="text"
                value={form.artist}
                onChange={e => set('artist', e.target.value)}
                className={`replay-input ${errors.artist ? 'input-error' : ''}`}
              />
            </Field>

            <Field label="Rating">
              <StarRating value={form.rating} onChange={v => set('rating', v)} />
            </Field>

            <Field label="Genre">
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => {
                  const selected = form.genre === g
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set('genre', g)}
                      className={`flex h-8 items-center rounded-full px-3 text-[11px] font-medium uppercase tracking-[0.06em] transition active:scale-[0.96] ${
                        selected
                          ? 'bg-[#F4F4F5] text-[#060607]'
                          : 'bg-[#161619] text-[#86868B] hover:text-[#F4F4F5]'
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field label="Notes">
              <textarea
                value={form.note}
                onChange={e => set('note', e.target.value)}
                rows={5}
                placeholder="聴いた感想、思い出など..."
                className="replay-input resize-none leading-6"
              />
            </Field>

            <div>
              <button
                onClick={() => setShowCoverUrl(s => !s)}
                className="text-[13px] font-medium text-[#52525B] transition hover:text-[#86868B]"
              >
                {showCoverUrl ? 'Cover URLを閉じる' : 'Cover URL'}
              </button>

              {showCoverUrl && (
                <div className="mt-6 fade-up">
                  <Field label="Cover URL">
                    <input
                      type="url"
                      value={form.coverUrl}
                      onChange={e => set('coverUrl', e.target.value)}
                      placeholder="https://..."
                      className="replay-input"
                    />
                  </Field>
                </div>
              )}
            </div>
          </FieldGroup>
        </div>
      </main>
    </div>
  )
}
