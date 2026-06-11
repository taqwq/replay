import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AlbumList from './pages/AlbumList'
import AlbumForm from './pages/AlbumForm'
import AlbumDetail from './pages/AlbumDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AlbumList />} />
        <Route path="/add" element={<AlbumForm mode="add" />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
        <Route path="/album/:id/edit" element={<AlbumForm mode="edit" />} />
      </Routes>
    </BrowserRouter>
  )
}
