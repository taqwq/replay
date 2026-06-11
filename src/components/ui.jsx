export function TopBar({ left, title, right, compact = false }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#080808]/78 backdrop-blur-2xl">
      <div className={`mx-auto flex max-w-[520px] items-center justify-between px-5 ${compact ? 'py-3' : 'py-4'}`}>
        <div className="flex min-w-0 flex-1 items-center justify-start">{left}</div>
        {title && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[12px] font-medium tracking-[0.02em] text-white/48">
            {title}
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center justify-end">{right}</div>
      </div>
    </header>
  )
}

export function GhostButton({ children, className = '', ...props }) {
  return (
    <button
      className={`min-h-9 rounded-full px-3 text-[13px] font-medium text-white/58 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`min-h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-white/86 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function IconButton({ children, label, className = '', ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/[0.09] bg-white/[0.035] text-white/68 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AlbumCover({ src, alt, className = '', imageClassName = '', viewTransitionName }) {
  return (
    <div
      className={`relative aspect-square overflow-hidden bg-white/[0.045] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.96)] ${className}`}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <span className="font-display select-none text-[11px] tracking-[0.24em] text-white/[0.11]">NO COVER</span>
        </div>
      )}
    </div>
  )
}

export function Field({ label, error, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.32]">{label}</label>
        {hint && <span className="text-[11px] text-white/24">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#ff6b6b]">{error}</p>}
    </div>
  )
}

export function ConfirmDialog({ open, title, description, confirmLabel = '削除', cancelLabel = 'キャンセル', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[340px] rounded-[18px] border border-white/[0.09] bg-[#141414] p-4 shadow-2xl fade-up">
        <h2 className="text-[15px] font-semibold text-white/92">{title}</h2>
        <p className="mt-2 text-[13px] leading-6 text-white/52">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
          <button
            onClick={onConfirm}
            className="min-h-9 rounded-full bg-[#ff5c5c] px-4 text-[13px] font-semibold text-black transition hover:bg-[#ff7373] active:scale-[0.96]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
