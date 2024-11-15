import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Toggle from 'react-toggle'
import { BrowserRouter as Router, Route, Link, useNavigate } from 'react-router-dom';
import e from 'express';

function Rule(props) {
    const navigate = useNavigate();
    const execution = (code) => {
        console.log(code)
        const get_events = async function (calendar_id){
            var events=[];
            await fetch( "/calendar/"+calendar_id)
                .then( response => response.json() )
                .then( json =>  {
                    for(var i = 0; i < json.items.length; i++) events.push(json.items[i]);
                });
            return events;
        }

        const insert_event = async function (source_event,calendar_id){
            var events = source_event;
            if (!Array.isArray(source_event)) events = [source_event];
            await events.forEach(event => {
                var eventjson = {calendar_id: calendar_id,event: event};
                fetch("/insert_event", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventjson)
                })
            });
        }

        const update_event = async function (source_event , target_event, calendar_id){
            try {
                var source_events = source_event ? (Array.isArray(source_event) ? source_event : [source_event]) : [];
                var target_events = target_event ? (Array.isArray(target_event) ? target_event : [target_event]) : [];


                const getEventId = (event) => event.id;

                const compareEvents = (source, target) => {
                    const sourceUpdatedTime = new Date(source.updated).getTime();
                    const targetUpdatedTime = new Date(target.updated).getTime();
                    const targetCreatedTime = new Date(target.created).getTime();

                    return sourceUpdatedTime > targetUpdatedTime && sourceUpdatedTime > targetCreatedTime;
                }
                
                if (source_events.length > 0) {
                    for (let source of source_events) {
                        if (target_events.length > 0) {
                            const targetMatch = target_event.find(target => getEventId(target) === getEventId(source));
                            if (!targetMatch) {
                                await insert_event(source, calendar_id);
                                var eventjson = {calendar_id: calendar_id,event: source};
                                fetch("/insert_event", {
                                    method: "POST",
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(eventjson)
                                })
                            } else if (compareEvents(source, targetMatch)) {
                                var eventjson = {calendar_id: calendar_id, event_id: target_event.id, event: source};
                                fetch("/update_event", {
                                    method: "POST",
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(eventjson)
                                })
                            }
                        }else{
                            var eventjson = {calendar_id: calendar_id,event: source};
                            fetch("/insert_event", {
                                method: "POST",
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(eventjson)
                            })
                        }
                    }
                }

                if(target_events.length > 0){
                    for (let target of target_events) {
                        if(source_events.length > 0){
                            const sourceMatch = source_event.find(source => getEventId(source) === getEventId(target));
                            
                            if (!sourceMatch) {
                                var eventjson = {calendar_id: calendar_id,event_id: target.id};
                                fetch("/delete_event", {
                                    method: "POST",
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(eventjson)
                                })                    
                            }
                        }
                        else{
                            var eventjson = {calendar_id: calendar_id,event_id: target.id};
                            fetch("/delete_event", {
                                method: "POST",
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(eventjson)
                            })                    
                        }
                    }
                }
            }catch (e) {
                alert(e);
            }
        }

        const delete_event = async function (source_event,calendar_id){
            var events = source_event;
            if (!Array.isArray(source_event)) events = [source_event];
            await events.forEach(event => {
                var eventjson = {calendar_id: calendar_id,event_id: event.id};
                fetch("/delete_event", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventjson)
                })
            });
        }

        const print = function (value){
            if(Array.isArray(value)) value = value.map( function(e) {
                if(typeof e === "object") {
                    var date = e.start.date ? e.start.date : e.start.dateTime;
                    var summary = e.summary;
                    return "" + date + " " + summary;
                } else {
                    return e;
                }
            })
            window.alert(Array.isArray(value) ? value.join("\n") : value);
        }

        const normalize_date = function (y,m,d,w,dw){
            var dates = {};
            var year, month, date, day;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            switch(d){
                case 'today':
                    dates.start = today;
                    return dates;
                case 'tomorrow':
                    var tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    dates.start = tomorrow;
                    return dates;
                case 'yesterday':
                    var yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    dates.start = yesterday;
                    return dates;
                case 'undefined':
                    dates.type = 'month';
                    break;
                default:
                    date = d;
                    dates.type = 'date';
                    break;
            }
            switch(m){
                case 'this_month':
                    year = today.getFullYear();
                    month = today.getMonth() + 1;
                    break;
                case 'next_month':
                    if(today.getMonth() == 11){
                        year = today.getFullYear() + 1;
                        month = 1;
                    }else{
                        year = today.getFullYear();
                        month = today.getMonth() + 2;
                    }
                    break;
                case 'last_month':
                    if(today.getMonth() == 0){
                        year = today.getFullYear() - 1;
                        month = 12;
                    }else{
                        year = today.getFullYear();
                        month = today.getMonth();
                    }
                    break;
                case 'undefined':
                    dates.type = 'year';
                    break;
                default:
                    month = m;
                    break;
            }
            switch(y){
                case 'this_year':
                    year = today.getFullYear();
                    break;
                case 'next_year':
                    year = today.getFullYear() + 1;
                    break;
                case 'last_year':
                    year = today.getFullYear() - 1;
                    break;
                case 'undefined':
                    break;
                default:
                    year = y;
                    break;
            }
            switch(w){
                case 'this_week':
                    var day = today.getDay();
                    dates.type = 'week';
                    dates.start = new Date(today);
                    dates.start.setDate(today.getDate() - day);
                    dates.end = new Date(dates.start);
                    dates.end.setDate(dates.start.getDate() + 7);
                    break;
                case 'next_week':
                    var day = today.getDay();
                    dates.start = new Date(today);
                    dates.type = 'week';
                    dates.start.setDate(today.getDate() - day + 7);
                    dates.end = new Date(dates.start);
                    dates.end.setDate(dates.start.getDate() + 7);
                    break;
                case 'last_week':
                    var day = today.getDay();
                    dates.start = new Date(today);
                    dates.type = 'week';
                    dates.start.setDate(today.getDate() - day - 7);
                    dates.end = new Date(dates.start);
                    dates.end.setDate(dates.start.getDate() + 7);
                    break;
                default:
                    break;
            }
            if(dw != 'undefined'){
                dates.day = Number(dw);
            }
            switch(dates.type){
                case 'date':
                    dates.start = new Date(year, month - 1, date);
                    break;
                case 'month':
                    dates.start = new Date(year, month - 1, 1);
                    dates.end = new Date(year, month, 1);
                    break;
                case 'year':
                    dates.start = new Date(year, 0, 1);
                    dates.end = new Date(Number(year) + 1, 0, 1);
                    break;
                default:
                    break;
            }
            return dates;
        }

        const date_match = function (e, d, o) {
            var event_dates = new Date(e.date_time);
            var event_year = event_dates.getFullYear();
            var event_month = event_dates.getMonth() + 1;
            var event_date = event_dates.getDate();
            var start_dates = d.start;
            var end_dates = d.end;

            // window.alert(d.type + " " + start_dates + " " + end_dates);

            if(isNaN(end_dates)){ //end_dateが存在しないとき
                switch(o){
                    case '==':
                        return event_year == start_dates.getFullYear() && event_month == start_dates.getMonth() + 1 && event_date == start_dates.getDate();
                    case '<=':
                        start_dates.setDate(start_dates.getDate() + 1);
                        return event_dates <= start_dates;
                    case '>=':
                        return event_dates >= start_dates;
                }
            }else{
                if(isNaN(d.day)){
                    return event_dates >= start_dates && event_dates < end_dates;
                }else{
                    return event_dates >= start_dates && event_dates < end_dates && event_dates.getDay() == d.day;
                }
            }
        }
        
        const time_match = function (e, t, o) {
            var event_dates = new Date(e.date_time);
            var event_hour = event_dates.getHours();
            var event_minute = event_dates.getMinutes();
            var event_time = event_hour * 60 + event_minute;
            switch(o){
                case '==':
                    return event_time == t;
                case '<=':
                    return event_time <= t;
                case '>=':
                    return event_time >= t;
                default:
                    return false;
            }
        }

        const test_print = function (source_event){
            window.alert(source_event.id);
        }

        var fullcode = '(async () => {' + code + '})();';
        eval(fullcode);
    }

    const edit = (rule) => {
        console.log(rule.blockXml)
        navigate('/edit/' + rule.id, {
            state: {
                id: rule.id,
                name: rule.name,
                block: rule.blockXml
            }
        });
    }

    const remove = (id) => {
        fetch("/delete_program", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: id})
        })
    }

    const enable_auto = (event) => {
        var program = props.rule;
        program.enable_auto = event.target.checked;
        fetch("/update_program", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(program)
        })
    }

    const prev = (props) => {

    }

    return (
        <Col>
            <Card style={{ width: '18rem' }}><Card.Body>
                <Card.Title><a>{props.rule.name}</a></Card.Title>
                <Row>自動実行: <Col><Toggle defaultChecked={props.rule.enable_auto == 'true'} onChange={enable_auto} /></Col></Row>
                <Row>
                    <Col><Button variant="outline-success" onClick={() => execution(props.rule.jsCode)} >
                        実行
                    </Button></Col>
                    <Col><Button variant="outline-success" onClick={() => prev(props.rule)} >
                        preview
                    </Button></Col>
                    <Col><Button variant="outline-success" onClick={() => edit(props.rule)} >
                        編集
                    </Button></Col>
                    <Col><Button variant="danger" onClick={() => remove(props.rule.id)} >
                        ×
                    </Button></Col>
                </Row>
            </Card.Body></Card>
        </Col>
    );
}
export default Rule;
