import { useState } from 'react'

export function TopBar({ left, title, right, compact = false }) {
  return (
    <header className="sticky top-0 z-30 bg-[#121212]/72 backdrop-blur-2xl">
      <div className={`mx-auto flex items-center justify-between px-4 transition-[padding] duration-200 ${compact ? 'py-2.5' : 'py-3'}`}>
        <div className="flex min-w-0 flex-1 items-center justify-start">{left}</div>
        {title && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold text-white/38">
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
      className={`min-h-9 rounded-full px-3 text-[12px] font-semibold text-[#b3b3b3] transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`min-h-9 rounded-full bg-white px-4 text-[12px] font-bold text-black shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition hover:bg-[#eeeeee] active:scale-[0.96] disabled:pointer-events-none disabled:bg-[#2a2a2a] disabled:text-white/32 disabled:shadow-none ${className}`}
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
      className={`grid h-8 w-8 place-items-center rounded-full text-[#b3b3b3] transition hover:bg-white/[0.06] hover:text-white active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function BackButton({ label = '戻る', ...props }) {
  return (
    <IconButton label={label} {...props}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </IconButton>
  )
}

export function HeaderAction({ children, className = '', ...props }) {
  return (
    <button
      className={`min-h-8 rounded-full px-3 text-[12px] font-bold text-[#d8d8d8] transition hover:bg-white/[0.06] hover:text-white active:scale-[0.96] disabled:pointer-events-none disabled:text-white/28 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function AlbumCover({ src, alt, className = '', imageClassName = '', viewTransitionName }) {
  const [failedImage, setFailedImage] = useState({ src: null, failed: false })
  const showImage = src && !(failedImage.src === src && failedImage.failed)

  return (
    <div
      className={`relative aspect-square overflow-hidden bg-[#181818] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.96)] ${className}`}
      style={viewTransitionName ? { viewTransitionName } : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imageClassName}`}
          loading="lazy"
          onError={() => setFailedImage({ src, failed: true })}
        />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <span className="select-none text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.13]">No Cover</span>
        </div>
      )}
    </div>
  )
}

export function Field({ label, error, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b3b3b3]/55">{label}</label>
        {hint && <span className="text-[11px] text-[#b3b3b3]/38">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-[#f3727f]">{error}</p>}
    </div>
  )
}

export function FieldGroup({ children, className = '' }) {
  return (
    <section className={`flex flex-col gap-5 ${className}`}>
      {children}
    </section>
  )
}

export function Spinner({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/18 border-t-[#b3b3b3] ${className}`}
    />
  )
}

export function ConfirmDialog({ open, title, description, confirmLabel = '削除', cancelLabel = 'キャンセル', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[340px] rounded-[12px] bg-[#181818] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.07] fade-up">
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
