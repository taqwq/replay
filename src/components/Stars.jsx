// 金属金（#C8973A）の星。塗りのみ・ストロークなし・グローなし
// 黒スリーブへの箔押しに見える慎ましさに留める

const STAR_PATH = 'M12 2.6l2.7 6.2 6.7.6-5.1 4.5 1.5 6.6L12 17l-5.8 3.5 1.5-6.6L2.6 9.4l6.7-.6L12 2.6z'

function Star({ size, filled, hovering }) {
  const fill = filled
    ? 'var(--color-star)'
    : hovering
      ? 'rgba(255,255,255,0.22)'
      : 'rgba(255,255,255,0.10)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR_PATH} fill={fill} />
    </svg>
  )
}

// 表示用：星間ギャップ4px
export function Stars({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`評価 ${rating} / 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size} filled={n <= rating} />
      ))}
    </div>
  )
}

// 入力用：星28px・タップ領域44px
export function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`評価 ${n}`}
          className="grid h-11 w-11 place-items-center transition-transform duration-150 hover:scale-105 active:scale-90"
        >
          <Star size={28} filled={n <= value} />
        </button>
      ))}
    </div>
  )
}
