import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { slide as Menu } from 'react-burger-menu';
import { FaCalendarAlt } from 'react-icons/fa';
import './Calendar.css';

const localizer = momentLocalizer(moment);

function hashToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function PageOfCalendar() {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState(() => {
        const saved = localStorage.getItem('selectedCalendars');
        return saved ? JSON.parse(saved) : [];
    });
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('events');
        return saved ? JSON.parse(saved) : [];
    });
    const [calendarColors, setCalendarColors] = useState(() => {
        const saved = localStorage.getItem('calendarColors');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        fetch("/calendar_list")
            .then(response => response.json())
            .then(data => {
                const sortedData = data.sort((a, b) => a.summary.localeCompare(b.summary));
                setCalendars(sortedData);

                const colors = {};
                sortedData.forEach(calendar => {
                    colors[calendar.id] =  hashToColor(calendar.id);
                });
                setCalendarColors(colors);
            })
            .catch(error => console.error('Error fetching calendar list:', error));
    }, []);

    useEffect(() => {
        if (selectedCalendars.length > 0) {
            Promise.allSettled(selectedCalendars.map(calendarId =>
                fetch(`/calendar/${calendarId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => data.items.filter(event => event.status !== "cancelled")) 
            )).then(results => {
                const allEvents = results
                    .filter(result => result.status === 'fulfilled')
                    .flatMap(result => result.value)
                    .map(event => ({
                        ...event,
                        title: event.summary,
                        start: new Date(event.start.date_time),
                        end: new Date(event.end.date_time),
                        color: calendarColors[event.organizer.email] || '#000000'
                    }));
                setEvents(allEvents);
            });
        } else {
            setEvents([]);
        }
    }, [selectedCalendars, calendarColors]);

    useEffect(() => {
        localStorage.setItem('selectedCalendars', JSON.stringify(selectedCalendars));
    }, [selectedCalendars]);

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('calendarColors', JSON.stringify(calendarColors));
    }, [calendarColors]);

    useEffect(() => {
        const menuWrap = document.querySelector('.bm-menu-wrap');
        const overlay = document.querySelector('.bm-overlay');
        if (menuWrap) {
            menuWrap.style.zIndex = '900';
        }
        if (overlay) {
            overlay.style.background = 'transparent';
            overlay.style.zIndex = '800';
        }
    }, []);
    const eventPropGetter = (event) => {
        const backgroundColor = event.color;
        return { style: { backgroundColor } };
    };

    const handleCheckboxChange = (calendarId) => {
        setSelectedCalendars(prevSelectedCalendars => {
            if (prevSelectedCalendars.includes(calendarId)) {
                return prevSelectedCalendars.filter(id => id !== calendarId);
            } else {
                return [...prevSelectedCalendars, calendarId];
            }
        });
    };

    return (
        <div>
            <Menu>
                <span>表示するカレンダー</span>
                {calendars.map(calendar => (
                    <div key={calendar.id}>
                        <label>
                            <input
                                type="checkbox"
                                value={calendar.id}
                                onChange={() => handleCheckboxChange(calendar.id)}
                                checked={selectedCalendars.includes(calendar.id)}
                            />
                            {calendar.summary}
                        </label>
                    </div>
                ))}
            </Menu>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '90px', marginTop: '5px', fontSize: '24px' }}>
                <FaCalendarAlt style={{ marginRight: '10px', fontSize: '24px' }} />
                <span>カレンダー</span>
            </div>
            <div style={{ margin: '40px 0' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 800 }}
                    eventPropGetter={eventPropGetter}
                />
            </div>
        </div>
    );
}

export default PageOfCalendar;