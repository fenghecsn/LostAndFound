export const normalizeResourceUrl = (rawUrl?: string | null): string => {
  const value = String(rawUrl || '').trim()
  if (!value) return ''

  if (value.startsWith('blob:') || value.startsWith('data:')) {
    return value
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  if (value.startsWith('//')) {
    return `${window.location.protocol}${value}`
  }

  const base =
    (import.meta.env.VITE_API_BASE_URL || '').trim() ||
    (import.meta.env.VITE_DEV_PROXY_TARGET || '').trim() ||
    window.location.origin

  try {
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    return new URL(value, normalizedBase).toString()
  } catch {
    return value
  }
}
