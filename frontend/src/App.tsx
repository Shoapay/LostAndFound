import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { apiService } from './services/api'
import MainLayout from './components/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import ItemDetail from './pages/ItemDetail'
import PublishItem from './pages/PublishItem'
import MyItems from './pages/MyItems'
import MyClaims from './pages/MyClaims'
import ClaimManagement from './pages/ClaimManagement'
import Messages from './pages/Messages'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      apiService.setToken(token)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (token: string) => {
    apiService.setToken(token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    apiService.setToken(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" /> : <Register />
      } />
      <Route path="/" element={
        <MainLayout isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      }>
        <Route index element={<Home />} />
        <Route path="items/:id" element={<ItemDetail isAuthenticated={isAuthenticated} />} />
        <Route path="publish" element={
          isAuthenticated ? <PublishItem /> : <Navigate to="/login" />
        } />
        <Route path="my-items" element={
          isAuthenticated ? <MyItems /> : <Navigate to="/login" />
        } />
        <Route path="my-claims" element={
          isAuthenticated ? <MyClaims /> : <Navigate to="/login" />
        } />
        <Route path="claim-management" element={
          isAuthenticated ? <ClaimManagement /> : <Navigate to="/login" />
        } />
        <Route path="messages" element={
          isAuthenticated ? <Messages /> : <Navigate to="/login" />
        } />
      </Route>
    </Routes>
  )
}

export default App
