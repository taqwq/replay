import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'
import { searchAlbums } from '../utils/itunes'

const EMPTY = { title: '', artist: '', coverUrl: '', rating: 5, genre: 'Pop', note: '' }

export default function AlbumForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  // iTunes検索
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (mode === 'edit' && id) {
      const album = getAlbumById(id)
      if (album) setForm(album)
    }
  }, [mode, id])

  // 検索欄の外クリックで候補を閉じる
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
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
    setForm(f => ({
      ...f,
      title: item.title,
      artist: item.artist,
      coverUrl: item.coverUrl,
      genre: mapGenre(item.genre),
    }))
    setResults([])
    setQuery('')
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'アルバム名は必須です'
    if (!form.artist.trim()) e.artist = 'アーティスト名は必須です'
    return e
  }

  function handleSave() {
    const e = validate()
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
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <button onClick={handleBack} className="text-white/60 hover:text-white text-sm transition">
          ← 戻る
        </button>
        <h2 className="text-white text-sm font-semibold">{mode === 'edit' ? '編集' : '追加'}</h2>
        <button
          onClick={handleSave}
          className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-white/90 transition"
        >
          保存
        </button>
      </div>

      <div className="max-w-[520px] mx-auto px-4 py-6 flex flex-col gap-5">

        {/* iTunes検索 */}
        <div ref={searchRef} className="relative flex flex-col gap-1.5">
          <label className="text-white/50 text-xs font-medium uppercase tracking-wider">
            アルバムを検索（iTunes）
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="アルバム名・アーティスト名で検索..."
              className="input-base flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition disabled:opacity-40 whitespace-nowrap"
            >
              {searching ? '...' : '検索'}
            </button>
          </div>
          {searchError && <p className="text-white/40 text-xs">{searchError}</p>}

          {/* 検索結果ドロップダウン */}
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl max-h-72 overflow-y-auto">
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition text-left"
                >
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="w-10 h-10 rounded object-cover flex-shrink-0 bg-white/10"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-white/50 text-xs truncate">{item.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ジャケットプレビュー */}
        <div className="aspect-square w-full rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
          {form.coverUrl ? (
            <img src={form.coverUrl} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white/20 text-6xl">🎵</span>
          )}
        </div>

        {/* ジャケットURL */}
        <Field label="ジャケットURL（任意）">
          <input
            type="url"
            value={form.coverUrl}
            onChange={e => set('coverUrl', e.target.value)}
            placeholder="https://..."
            className="input-base"
          />
        </Field>

        {/* アルバム名 */}
        <Field label="アルバム名 *" error={errors.title}>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="例：DAMN."
            className="input-base"
          />
        </Field>

        {/* アーティスト名 */}
        <Field label="アーティスト名 *" error={errors.artist}>
          <input
            type="text"
            value={form.artist}
            onChange={e => set('artist', e.target.value)}
            placeholder="例：Kendrick Lamar"
            className="input-base"
          />
        </Field>

        {/* 星評価 */}
        <Field label="評価">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => set('rating', n)}
                className={`text-2xl transition ${n <= form.rating ? 'text-yellow-400' : 'text-white/20'}`}
              >
                ★
              </button>
            ))}
          </div>
        </Field>

        {/* ジャンル */}
        <Field label="ジャンル">
          <select
            value={form.genre}
            onChange={e => set('genre', e.target.value)}
            className="input-base"
          >
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>

        {/* 感想 */}
        <Field label="感想（任意）">
          <textarea
            value={form.note}
            onChange={e => set('note', e.target.value)}
            rows={4}
            placeholder="聴いた感想、思い出など..."
            className="input-base resize-none"
          />
        </Field>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 10px 12px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        .input-base:focus {
          border-color: rgba(255,255,255,0.3);
        }
        .input-base option {
          background: #1a1a1a;
        }
      `}</style>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// iTunesのジャンル名をアプリのジャンルリストにマッピング
function mapGenre(itunesGenre) {
  const g = itunesGenre?.toLowerCase() ?? ''
  if (g.includes('pop')) return 'Pop'
  if (g.includes('rock')) return 'Rock'
  if (g.includes('hip-hop') || g.includes('hip hop') || g.includes('rap')) return 'Hip-Hop'
  if (g.includes('r&b') || g.includes('soul')) return 'R&B'
  if (g.includes('electronic') || g.includes('dance')) return 'Electronic'
  if (g.includes('jazz')) return 'Jazz'
  if (g.includes('classical')) return 'Classical'
  if (g.includes('alternative') || g.includes('indie')) return 'Alternative'
  if (g.includes('j-pop') || g.includes('japanese')) return 'J-Pop'
  if (g.includes('k-pop') || g.includes('korean')) return 'K-Pop'
  if (g.includes('anime') || g.includes('game')) return 'Anime/Game'
  return 'Other'
}
