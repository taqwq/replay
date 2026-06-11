export async function searchAlbums(query) {
  // MusicBrainz API: 公式アルバムのみ検索（primarytype:Album でシングル・EP除外）
  // User-Agent は利用規約上必須
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(query + ' AND primarytype:Album')}&fmt=json&limit=12`,
    { headers: { 'User-Agent': 'Replay/1.0 (kuronekowkz123@gmail.com)' } }
  )
  const data = await res.json()

  return (data['release-groups'] ?? []).map(rg => ({
    title: rg.title,
    artist: rg['artist-credit']?.[0]?.name ?? '',
    // Cover Art Archive は MusicBrainz 運営のジャケット画像DB
    // <img> の src に直接使うとブラウザがリダイレクトを辿って画像を表示する
    coverUrl: `https://coverartarchive.org/release-group/${rg.id}/front`,
    genre: 'Other',
  }))
}
