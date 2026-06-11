// 評価をドットで表現する（星の「俗っぽさ」を避ける）

// 表示用：小さなドット5つ
export function Dots({ rating, size = 5 }) {
  return (
    <div className="flex items-center" style={{ gap: size }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            background: n <= rating ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.14)',
          }}
        />
      ))}
    </div>
  )
}

// 入力用：タップできる大きめのドット
export function DotRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-4 py-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`評価 ${n}`}
          className="transition-transform duration-150 active:scale-75 hover:scale-110 p-1 -m-1"
        >
          <span
            className="block rounded-full transition-colors duration-200"
            style={{
              width: 12,
              height: 12,
              background: n <= value ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.1)',
              boxShadow: n <= value ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.14)',
            }}
          />
        </button>
      ))}
    </div>
  )
}
