const KEY = 'Replay_albums'

export function getAlbums() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveAlbums(albums) {
  localStorage.setItem(KEY, JSON.stringify(albums))
}

export function addAlbum(album) {
  const albums = getAlbums()
  albums.unshift({ ...album, id: crypto.randomUUID() })
  saveAlbums(albums)
}

export function updateAlbum(id, data) {
  const albums = getAlbums().map(a => a.id === id ? { ...a, ...data } : a)
  saveAlbums(albums)
}

export function deleteAlbum(id) {
  saveAlbums(getAlbums().filter(a => a.id !== id))
}

export function getAlbumById(id) {
  return getAlbums().find(a => a.id === id) ?? null
}
