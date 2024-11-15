import { useEffect } from "react";
import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import './Toggle.css';
import './Setting.css';

function GoogleAuth() {
    fetch( "http://localhost:4567/authorize")
        .then( response => response.json() )
        .then( json =>  {
            window.location.href = json
        });
}

function CustomToggle({ checked, onChange }) {
    return (
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    );
}   

function Calendar(props) {
    const [isChecked, setIsChecked] = useState(props.calendar[2]);
    const writable = (event) => {
        const newChecked = event.target.checked;
        setIsChecked(newChecked);
        fetch("/writable", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: props.calendar[1], status: event.target.checked})
        })
    }

    return (
        <div className="calendar-item">
            <CustomToggle checked={isChecked} onChange={writable} />
            <span className="calendar-name">{props.calendar[0]}</span>
        </div>
    );
}

function PageOfSettings() {
    const [calendar_list, setCalendarList] = useState([]);
    useEffect(() => {
        fetch( "/calendar_list")
            .then( response => response.json() )
            .then( json => {
                var calendars = [];
                json
                .sort((a, b) => a.summary.localeCompare(b.summary))
                .map(calendar => {
                    calendars.push([calendar.summary, calendar.id, calendar.writable]);
                })
                setCalendarList(calendars);
            })
        }, []);

    return (
        <div>
            <h1 className="spacing">設定</h1>
            <div className="settings-container">
                <div className="auth-section">
                    <h4>カレンダ認証:
                    &nbsp;
                    <Button variant="outline-success" onClick={GoogleAuth}>
                        Google Calendar を認証
                    </Button>
                    </h4>
                </div>
                <div className="calendar-section">
                    <h4>カレンダの編集権限の設定</h4>
                    {calendar_list.map((calendar) => (
                        <Calendar calendar={calendar} key={calendar[1]}/>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default PageOfSettings;
