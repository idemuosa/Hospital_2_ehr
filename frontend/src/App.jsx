import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Home from './pages/Home';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Chat from './pages/Chat';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Appointments from './pages/Appointments';
import AuditLogs from './pages/AuditLogs';
import Consultations from './pages/Consultations';
import WardMap from './pages/WardMap';
import PatientPortal from './pages/PatientPortal';
import CalendarView from './pages/CalendarView';

function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Home />} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="patients/:id" element={<PatientDetails />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="appointments" element={<Appointments />} />
                        <Route path="calendar" element={<CalendarView />} />
                        <Route path="ward-map" element={<WardMap />} />
                        <Route path="my-portal" element={<PatientPortal />} />
                        <Route path="consultations" element={<Consultations />} />
                        <Route path="audit" element={<AuditLogs />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
