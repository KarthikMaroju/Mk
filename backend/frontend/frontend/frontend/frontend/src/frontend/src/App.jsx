import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import { useState, useEffect } from 'react'

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Routes>
      <Route path="/" element={<Login toggleTheme={toggleTheme} theme={theme} />} />
      <Route path="/register" element={<Register toggleTheme={toggleTheme} theme={theme} />} />
      <Route path="/dashboard" element={<Dashboard toggleTheme={toggleTheme} theme={theme} />} />
    </Routes>
  )
}

export default App
