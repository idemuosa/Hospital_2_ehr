import { useContext, useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Users, Calendar, MessageSquare, ShieldAlert, Bell, LogOut, LayoutDashboard, Package, CreditCard, MessageCircle, Calendar as CalendarIcon, Layout, User } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function DashboardLayout() {
  const [notifications, setNotifications] = useState([])
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()

  useEffect(() => {
    // Connect to Django Channels WebSocket for notifications/real-time alerts
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const apiHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '')
      : window.location.host;
    const socket = new WebSocket(`${protocol}://${apiHost}/ws/chat/alerts/`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications(prev => [data, ...prev].slice(0, 5));
    };

    return () => socket.close();
  }, [])

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'receptionist'] },
    { name: 'My Portal', path: '/my-portal', icon: User, roles: ['patient'] },
    { name: 'Patients', path: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Consultations', path: '/consultations', icon: MessageSquare, roles: ['admin', 'doctor'] },
    { name: 'Inventory', path: '/inventory', icon: Package, roles: ['admin', 'pharmacist'] },
    { name: 'Billing', path: '/billing', icon: CreditCard, roles: ['admin', 'receptionist'] },
    { name: 'Ward Map', path: '/ward-map', icon: Layout, roles: ['admin', 'nurse', 'receptionist'] },
    { name: 'Appointments', path: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { name: 'Real-time Chat', path: '/chat', icon: MessageCircle, roles: ['admin', 'doctor', 'nurse', 'pharmacist', 'receptionist'] },
    { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
  ]

  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || 'admin'))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Hospital EHR</h1>
          <p className="text-indigo-300 text-xs">Clinical Management System</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-900 text-white' : 'text-indigo-100 hover:bg-indigo-700'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg text-indigo-100 hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">
            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>

          <div className="flex items-center space-x-6">
             <div className="relative">
                <Bell className="text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
             </div>

             <div className="flex items-center space-x-3">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{user?.role || 'User'}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                    {user?.username?.[0]}
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {notifications.length > 0 && (
            <div className="p-4">
              {notifications.map((n, i) => (
                <div key={i} className="mb-2 bg-blue-50 border-l-4 border-blue-500 p-4 text-blue-700 text-sm flex justify-between items-center shadow-sm">
                  <span><strong>Alert:</strong> {n.message || n.text}</span>
                  <button onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))} className="text-blue-400 hover:text-blue-600">×</button>
                </div>
              ))}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
