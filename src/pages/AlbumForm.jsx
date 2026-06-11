import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addAlbum, updateAlbum, getAlbumById } from '../storage'
import { GENRES } from '../constants'

const EMPTY = { title: '', artist: '', coverUrl: '', rating: 5, genre: 'Pop', note: '' }

export default function AlbumForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (mode === 'edit' && id) {
      const album = getAlbumById(id)
      if (album) setForm(album)
    }
  }, [mode, id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
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
