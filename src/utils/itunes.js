export async function searchAlbums(query) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=12&media=music`
  const res = await fetch(url)
  const data = await res.json()

  return data.results.map(item => ({
    title: item.collectionName,
    artist: item.artistName,
    // 100x100のURLを600x600に置換して高解像度を取得
    coverUrl: item.artworkUrl100?.replace('100x100', '600x600') ?? '',
    genre: item.primaryGenreName ?? 'Other',
  }))
}
