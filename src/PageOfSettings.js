import { useEffect } from "react";
import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Toggle from 'react-toggle'

function GoogleAuth() {
    fetch( "http://localhost:4567/authorize")
        .then( response => response.json() )
        .then( json =>  {
            window.location.href = json
        });
}

function Calendar(props) {
    const writable = (event) => {
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
        <div>
            {props.calendar[0]}
            <Toggle defaultChecked={props.calendar[2]} onChange={writable} />
        </div>
    )
}

function PageOfSettings() {
    const [calendar_list, setCalendarList] = useState([]);
    useEffect(() => {
        fetch( "/calendar_list")
            .then( response => response.json() )
            .then( json => {
                var calendars = [];
                json.map(calendar => {
                    calendars.push([calendar.summary, calendar.id, calendar.writable]);
                })
                setCalendarList(calendars);
            })
        }, []);

    return (
        <div>
            <h1>設定</h1>
            <h4>認証</h4>
            <Button variant="outline-success" onClick={GoogleAuth}>
                Google Calendar を認証
            </Button>
            <p/>
            <h4>書き換え可能なカレンダ一覧</h4>
            {calendar_list.map((calendar) => (
                <Calendar calendar={calendar}/>
            ))}
        </div>
    );
}
export default PageOfSettings;
