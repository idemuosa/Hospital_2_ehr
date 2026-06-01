import { useState, useEffect, useContext } from 'react'
import { Users, Calendar, MessageSquare, ShieldAlert, Bell, LogOut } from 'lucide-react'
import { io } from 'socket.io-client'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [notifications, setNotifications] = useState([])
  const { user, logout } = useContext(AuthContext)

  useEffect(() => {
    // Initialize Socket.io
    const socket = io('/', { path: '/socket.io/' })

    socket.on('receive_message', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 5))
    })

    return () => socket.close()
  }, [])

  useEffect(() => {
    fetch('/api/audit/')
      .then(res => res.json())
      .then(data => setData(Array.isArray(data) ? data : []))
      .catch(err => console.error("API error:", err))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">Hospital EHR</h1>
        <nav className="space-y-4">
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-indigo-600 p-2 rounded">
            <Users size={20} />
            <span>Patients</span>
          </div>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-indigo-600 p-2 rounded">
            <Calendar size={20} />
            <span>Appointments</span>
          </div>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-indigo-600 p-2 rounded">
            <MessageSquare size={20} />
            <span>Consultations</span>
          </div>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-indigo-600 p-2 rounded">
            <ShieldAlert size={20} />
            <span>Audit Logs</span>
          </div>
          <div
            onClick={logout}
            className="flex items-center space-x-3 cursor-pointer hover:bg-red-600 p-2 rounded mt-10"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-800">Dashboard Overview</h2>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Bell className="text-gray-500 cursor-pointer" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
             </div>
            <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
              Welcome, {user?.username}
            </div>
          </div>
        </header>

        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 text-sm">
                <strong>Notification:</strong> {n.message || n.text}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Total Patients</h3>
            <p className="text-4xl font-bold mt-2">1,284</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Todays Appointments</h3>
            <p className="text-4xl font-bold mt-2">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 font-medium">Active Consultations</h3>
            <p className="text-4xl font-bold mt-2">8</p>
          </div>
        </div>

        <section className="mt-12">
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
                {data.map((log, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">{log.user_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500 italic">No activity logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
