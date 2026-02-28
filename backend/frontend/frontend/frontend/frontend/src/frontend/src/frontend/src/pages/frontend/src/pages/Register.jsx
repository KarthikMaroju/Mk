import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const Register = ({ toggleTheme, theme }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/register', { username, password, role })
      toast.success('Registration successful')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering')
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700">
      <div className="glass p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for Rainfall Analytics</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-light-accent dark:bg-dark-accent text-white p-2 rounded hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Have account? <Link to="/" className="text-blue-500 hover:underline">Login</Link>
        </p>
        <div className="flex justify-end mt-4">
          <button onClick={toggleTheme} className="text-sm">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
