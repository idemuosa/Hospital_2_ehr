import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Package, AlertTriangle } from 'lucide-react'

export default function Home() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({
    total_patients: 0,
    todays_appointments: 0,
    active_inpatients: 0,
    revenue_trend: [],
    patient_trend: [],
    patient_forecast: [],
    inventory_forecast: []
  })

  useEffect(() => {
    if (user?.role === 'patient') {
        navigate('/my-portal');
        return;
    }
    const fetchData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          axios.get('/api/audit/'),
          axios.get('/api/dashboard/stats/')
        ])
        setLogs(logsRes.data.results || logsRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error("API error:", err)
      }
    }
    fetchData()
  }, [user, navigate])

  return (
    <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Total Patients</h3>
            <p className="text-4xl font-bold mt-2">{stats.total_patients}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Todays Appointments</h3>
            <p className="text-4xl font-bold mt-2">{stats.todays_appointments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Active Inpatients</h3>
            <p className="text-4xl font-bold mt-2">{stats.active_inpatients}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenue_trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Admissions Forecast</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.patient_forecast}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Line type="dashed" dataKey="predicted_count" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center">
                <Package className="mr-2 text-indigo-600" size={20} /> Stock Burn Rates
            </h3>
            <div className="flex-1 space-y-4 overflow-auto">
                {stats.inventory_forecast.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-gray-800">{item.name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.days_remaining < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {item.days_remaining} days left
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full">
                            <div
                                className={`h-full rounded-full ${item.days_remaining < 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, (item.days_remaining / 30) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
                {stats.inventory_forecast.length === 0 && <p className="text-center text-gray-400 italic text-sm mt-10">No stock data available</p>}
            </div>
          </div>
        </div>

        <section>
          <h3 className="text-xl font-semibold mb-4">Recent Audit Activity</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 5).map((log, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{log.user_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    </div>
  )
}
