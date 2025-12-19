// src/pages/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';
import './CalendarPage.css';
import Modal from '../components/common/Modal'; 

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      // FIX: Changed back to '/calendar' so authFetch handles the '/api' prefix
      const res = await authFetch('/calendar'); 
      const data = await res.json();
      setEvents(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, []);

  // --- Calendar Logic ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { daysInMonth, firstDay, year, month };
  };

  const { daysInMonth, firstDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- Date Selection ---
  const handleDayClick = (day) => {
    // Format to YYYY-MM-DD to match database
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
    setIsModalOpen(true);
    setNoteInput("");
  };

  // --- Event Actions ---
  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    // FIX: Changed back to '/calendar'
    await authFetch('/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, note: noteInput })
    });
    setNoteInput("");
    fetchEvents();
  };

  const handleDeleteNote = async (id) => {
    // FIX: Changed back to '/calendar'
    await authFetch(`/calendar/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  // Filter events for the selected day (for the modal)
  const daysEvents = events.filter(e => e.date === selectedDate);

  return (
    <div className="calendar-page">
      <div className="calendar-header-card">
        <button onClick={handlePrevMonth} className="nav-btn">◀</button>
        <h2>{monthNames[month]} {year}</h2>
        <button onClick={handleNextMonth} className="nav-btn">▶</button>
      </div>

      <div className="calendar-grid">
        {/* Days of week header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
        ))}

        {/* Empty slots for days before the 1st */}
        {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}

        {/* The actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateString);
            
            return (
                <div key={day} className="calendar-day" onClick={() => handleDayClick(day)}>
                    <div className="day-number">{day}</div>
                    
                    {/* --- UPDATED EVENT LIST SECTION --- */}
                    <div className="events-list">
                        {dayEvents.map((event, idx) => (
                            <div key={idx} className="event-item-row">
                                <span className="event-dot"></span>
                                <span className="event-text">{event.note}</span>
                            </div>
                        ))}
                    </div>
                    {/* ---------------------------------- */}
                </div>
            );
        })}
      </div>

      {/* --- MODAL FOR NOTES --- */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} title={`Notes for ${selectedDate}`}>
            <div className="calendar-modal-content">
                <div className="add-note-section">
                    <input 
                        type="text" 
                        placeholder="Add a new task or note..." 
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <button className="add-btn" onClick={handleAddNote}>Add</button>
                </div>

                <div className="notes-list">
                    {daysEvents.length === 0 ? <p className="no-notes">No notes for this day.</p> : null}
                    {daysEvents.map(event => (
                        <div key={event.id} className="note-item">
                            <span>• {event.note}</span>
                            <button className="delete-x" onClick={() => handleDeleteNote(event.id)}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
      )}
    </div>
  );
}

export default CalendarPage;