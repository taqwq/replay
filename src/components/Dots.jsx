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
            background: n <= rating ? 'rgba(255,255,255,0.78)' : 'rgba(179,179,179,0.2)',
          }}
        />
      ))}
    </div>
  )
}

// 入力用：タップできる大きめのドット
export function DotRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`評価 ${n}`}
          className="rounded-full p-1.5 transition-transform duration-150 hover:bg-white/[0.055] hover:scale-105 active:scale-90"
        >
          <span
            className="block rounded-full transition-colors duration-200"
            style={{
              width: 11,
              height: 11,
              background: n <= value ? 'rgba(255,255,255,0.88)' : 'rgba(179,179,179,0.16)',
              boxShadow: n <= value ? '0 0 0 1px rgba(255,255,255,0.18)' : 'inset 0 0 0 1px rgba(179,179,179,0.18)',
            }}
          />
        </button>
      ))}
    </div>
  )
}
