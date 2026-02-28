import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const Dashboard = ({ toggleTheme, theme }) => {
  const [data, setData] = useState([])
  const [analytics, setAnalytics] = useState({ total: 0, average: 0, highest: 0, lowest: 0 })
  const [year, setYear] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const role = localStorage.getItem('role')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }
    fetchData()
    const interval = setInterval(fetchData, 5000) // Polling for real-time
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const resData = await axios.get('http://localhost:5000/data')
      setData(resData.data)
      const resAnalytics = await axios.get('http://localhost:5000/analytics')
      setAnalytics(resAnalytics.data)
    } catch (err) {
      toast.error('Error fetching data')
    }
  }

  const handleAddOrEdit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/data/${editingId}`, { year, amount })
        toast.success('Data updated')
        setEditingId(null)
      } else {
        await axios.post('http://localhost:5000/data', { year, amount })
        toast.success('Data added')
      }
      setYear('')
      setAmount('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setYear(item.year)
    setAmount(item.amount)
    setEditingId(item.id)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`http://localhost:5000/data/${id}`)
        toast.success('Data deleted')
        fetchData()
      } catch (err) {
        toast.error('Error deleting data')
      }
    }
  }

  const handleExport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rainfall_data.csv')
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      toast.error('Error exporting')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const chartData = {
    labels: data.map(d => d.year),
    datasets: [
      {
        label: 'Rainfall Amount',
        data: data.map(d => d.amount),
        backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      },
    ],
  }

  return (
    <div className="min-h-screen p-4 bg-light-bg dark:bg-dark-bg">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Rainfall Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="bg-light-accent dark:bg-dark-accent text-white px-2 py-1 rounded">{role.toUpperCase()}</span>
          <button onClick={toggleTheme} className="text-sm">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button onClick={handleLogout} className="text-sm text-red-500">Logout</button>
        </div>
      </nav>

      {role === 'admin' && (
        <form onSubmit={handleAddOrEdit} className="glass p-4 rounded mb-8">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Rainfall Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="p-2 rounded bg-white/50 dark:bg-gray-800/50 border"
              required
            />
            <input
              type="number"
              placeholder="Amount (mm)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-2 rounded bg-white/50 dark:bg-gray-800/50 border"
              required
            />
            <button type="submit" className="bg-light-accent dark:bg-dark-accent text-white p-2 rounded" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass p-4 rounded text-center">
          <h4 className="font-semibold">Total Rainfall</h4>
          <p>{analytics.total.toFixed(2)} mm</p>
        </div>
        <div className="glass p-4 rounded text-center">
          <h4 className="font-semibold">Average</h4>
          <p>{analytics.average.toFixed(2)} mm</p>
        </div>
        <div className="glass p-4 rounded text-center">
          <h4 className="font-semibold">Highest</h4>
          <p>{analytics.highest} mm</p>
        </div>
        <div className="glass p-4 rounded text-center">
          <h4 className="font-semibold">Lowest</h4>
          <p>{analytics.lowest} mm</p>
        </div>
      </div>

      <div className="glass p-4 rounded mb-8">
        <h3 className="text-lg font-semibold mb-4">Data Table</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Year</th>
              <th className="border p-2">Amount (mm)</th>
              {role === 'admin' && <th className="border p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td className="border p-2">{item.year}</td>
                <td className="border p-2">{item.amount}</td>
                {role === 'admin' && (
                  <td className="border p-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleExport} className="mt-4 bg-light-accent dark:bg-dark-accent text-white p-2 rounded">
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Bar Chart</h3>
          <Bar data={chartData} />
        </div>
        <div className="glass p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Line Chart</h3>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
