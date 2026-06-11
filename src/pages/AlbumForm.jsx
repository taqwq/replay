import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'
import { searchAlbums } from '../utils/itunes'
import { DotRating } from '../components/Dots'

const EMPTY = { title: '', artist: '', coverUrl: '', rating: 3, genre: 'Other', note: '' }

export default function AlbumForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [showDetails, setShowDetails] = useState(false)

  // MusicBrainz検索
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (mode === 'edit' && id) {
      const album = getAlbumById(id)
      if (album) setForm({ ...EMPTY, ...album })
    }
  }, [mode, id])

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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ヘッダー */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/85 backdrop-blur-xl">
        <div className="max-w-[520px] mx-auto flex items-center justify-between px-6 py-5">
          <button onClick={handleBack} className="text-white/45 hover:text-white text-sm transition active:scale-95">
            ← 戻る
          </button>
          <button
            onClick={handleSave}
            className="font-display bg-white text-black text-[13px] font-semibold px-[18px] py-2 rounded-full transition hover:bg-white/85 active:scale-95"
          >
            保存
          </button>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-7 pb-16 fade-up">

        {/* 検索ピル（メインの入力経路） */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2.5 bg-white/[0.06] rounded-full px-5 py-3 focus-within:bg-white/[0.09] transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={searching ? '検索中…' : 'アルバムを検索'}
              className="flex-1 bg-transparent text-white text-[13.5px] outline-none placeholder:text-white/35"
            />
          </div>
          {searchError && <p className="text-white/30 text-xs mt-2 px-2">{searchError}</p>}

          {/* 検索候補 */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#161616] border border-white/[0.07] rounded-2xl overflow-hidden z-30 shadow-2xl max-h-72 overflow-y-auto">
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition text-left fade-up"
                  style={{ animationDelay: `${Math.min(i * 35, 280)}ms` }}
                >
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="w-9 h-9 rounded-md object-cover flex-shrink-0 bg-white/10"
                    onError={e => { e.target.style.visibility = 'hidden' }}
                  />
                  <div className="min-w-0">
                    <p className="text-white/90 text-[13px] font-medium truncate">{item.title}</p>
                    <p className="text-white/40 text-xs truncate">{item.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ジャケットプレビュー */}
        <div className="flex justify-center mt-7">
          <div className="w-[200px] aspect-square rounded-[14px] overflow-hidden shadow-[0_18px_44px_-16px_rgba(0,0,0,0.9)] bg-white/[0.04] flex items-center justify-center transition-all duration-500">
            {form.coverUrl ? (
              <img src={form.coverUrl} alt="cover" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <span className="font-display text-white/10 text-[11px] tracking-[0.2em] select-none">NO COVER</span>
            )}
          </div>
        </div>

        {/* フィールド */}
        <div className="mt-8 flex flex-col gap-7">
          <UField label="Album" error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="u-input"
            />
          </UField>

          <UField label="Artist" error={errors.artist}>
            <input
              type="text"
              value={form.artist}
              onChange={e => set('artist', e.target.value)}
              className="u-input"
            />
          </UField>

          <UField label="Rating">
            <DotRating value={form.rating} onChange={v => set('rating', v)} />
          </UField>

          <UField label="Notes">
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={3}
              placeholder="聴いた感想、思い出など…"
              className="u-input resize-none"
            />
          </UField>

          {/* 折りたたみ：手入力したい人向けの詳細 */}
          <button
            onClick={() => setShowDetails(s => !s)}
            className="self-start text-white/25 hover:text-white/50 text-xs tracking-wide transition"
          >
            {showDetails ? '− 詳細を閉じる' : '+ 詳細（ジャケットURL・ジャンル）'}
          </button>

          {showDetails && (
            <div className="flex flex-col gap-7 fade-up">
              <UField label="Cover URL">
                <input
                  type="url"
                  value={form.coverUrl}
                  onChange={e => set('coverUrl', e.target.value)}
                  placeholder="https://…"
                  className="u-input"
                />
              </UField>
              <UField label="Genre">
                <select
                  value={form.genre}
                  onChange={e => set('genre', e.target.value)}
                  className="u-input"
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </UField>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .u-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          border-radius: 0;
          padding: 0 0 9px;
          color: #fff;
          font-size: 16px;
          font-family: 'Inter', system-ui, sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .u-input:focus {
          border-bottom-color: rgba(255,255,255,0.45);
        }
        .u-input::placeholder {
          color: rgba(255,255,255,0.22);
        }
        .u-input option {
          background: #161616;
        }
        select.u-input {
          appearance: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

// アンダーライン形式のフィールド（極小の大文字ラベル付き）
function UField({ label, error, children }) {
  return (
    <div>
      <label className="block text-white/[0.28] text-[10px] font-medium tracking-[0.16em] uppercase mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400/80 text-xs mt-1.5">{error}</p>}
    </div>
  )
}
