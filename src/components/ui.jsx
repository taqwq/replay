import { useState } from 'react'

export function TopBar({ left, title, right, compact = false, transparent = false }) {
  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-[20px] ${transparent ? '' : ''}`}
      style={{
        background: transparent
          ? 'color-mix(in srgb, var(--color-bg) 60%, transparent)'
          : 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
      }}
    >
      <div className={`relative mx-auto flex items-center justify-between px-4 transition-[padding] duration-200 ${compact ? 'py-2' : 'py-3'}`}>
        <div className="flex min-w-0 flex-1 items-center justify-start">{left}</div>
        {title && (
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-[#86868B]">
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
      className={`flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-[#86868B] transition hover:bg-white/[0.05] hover:text-[#F4F4F5] active:scale-[0.96] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ヘッダー内のghostアクション（Edit / + Addなど）
export function HeaderAction({ children, className = '', ...props }) {
  return (
    <button
      className={`flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-[#86868B] transition hover:bg-white/[0.05] hover:text-[#F4F4F5] active:scale-[0.96] disabled:pointer-events-none disabled:text-[#52525B] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ヘッダー内の骨色塗りアクション（Save専用）
export function HeaderPrimary({ children, className = '', ...props }) {
  return (
    <button
      className={`flex h-8 items-center rounded-full bg-[#F4F4F5] px-4 text-[13px] font-semibold text-[#060607] transition hover:bg-white active:scale-[0.96] disabled:pointer-events-none disabled:bg-[#161619] disabled:text-[#52525B] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`flex h-11 items-center rounded-full bg-[#F4F4F5] px-6 text-[14px] font-semibold text-[#060607] shadow-[0_2px_16px_rgba(0,0,0,0.6)] transition hover:bg-white active:scale-[0.96] disabled:pointer-events-none disabled:bg-[#161619] disabled:text-[#52525B] disabled:shadow-none ${className}`}
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
      className={`grid h-8 w-8 place-items-center rounded-full text-[#86868B] transition hover:bg-white/[0.05] hover:text-[#F4F4F5] active:scale-95 ${className}`}
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

// ジャケット：レコードスリーブの直角（radius 0）。縁1pxのみ、glowは呼び出し側
export function AlbumCover({ src, alt, className = '', imageClassName = '', viewTransitionName, style }) {
  const [failedImage, setFailedImage] = useState({ src: null, failed: false })
  const showImage = src && !(failedImage.src === src && failedImage.failed)

  return (
    <div
      className={`relative aspect-square overflow-hidden bg-[#0E0E10] ${className}`}
      style={{
        borderRadius: 0,
        ...(viewTransitionName ? { viewTransitionName } : {}),
        ...style,
      }}
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
          <span className="select-none text-[11px] font-medium uppercase tracking-[0.06em] text-[#52525B]">No Cover</span>
        </div>
      )}
    </div>
  )
}

export function Field({ label, error, hint, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#52525B]">{label}</label>
        {hint && <span className="text-[11px] text-[#52525B]">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-2 text-[13px] text-[#E05454]">{error}</p>}
    </div>
  )
}

export function FieldGroup({ children, className = '' }) {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      {children}
    </section>
  )
}

export function Spinner({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/10 border-t-[#86868B] ${className}`}
    />
  )
}

export function ConfirmDialog({ open, title, description, confirmLabel = '削除', cancelLabel = 'キャンセル', onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/62 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[340px] rounded-[10px] bg-[#1E1E22] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.06] fade-up">
        <h2 className="text-[15px] font-semibold text-[#F4F4F5]">{title}</h2>
        <p className="mt-2 text-[13px] leading-[18px] text-[#86868B]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
          <button
            onClick={onConfirm}
            className="flex h-9 items-center rounded-full bg-[#E05454] px-4 text-[13px] font-semibold text-[#060607] transition hover:bg-[#e86c6c] active:scale-[0.96]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
