import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const CalendarView = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/api/appointments/');
            const formattedEvents = (res.data.results || res.data).map(appt => ({
                id: appt.id,
                title: `${appt.patient_name_display} - ${appt.reason}`,
                start: appt.date_time,
                allDay: false,
                extendedProps: {
                    doctor: appt.doctor_name,
                    status: appt.status
                },
                backgroundColor: getStatusColor(appt.status)
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching appointments for calendar:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled': return '#4f46e5'; // Indigo
            case 'completed': return '#10b981'; // Green
            case 'cancelled': return '#ef4444'; // Red
            default: return '#9ca3af'; // Gray
        }
    };

    const handleDateClick = (arg) => {
        alert('Date clicked: ' + arg.dateStr);
        // Here you would open the "New Appointment" modal
    };

    const handleEventClick = (info) => {
        alert('Appointment: ' + info.event.title + '\nDoctor: ' + info.event.extendedProps.doctor);
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <CalendarIcon className="mr-2" /> Medical Calendar
                </h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-indigo-700 shadow-sm transition">
                    <Plus size={18} />
                    <span>Schedule Appointment</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border flex-1 overflow-auto">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="auto"
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    nowIndicator={true}
                />
            </div>
        </div>
    );
};

export default CalendarView;
