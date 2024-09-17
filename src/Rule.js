import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Toggle from 'react-toggle'
import { BrowserRouter as Router, Route, Link, useNavigate } from 'react-router-dom';

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

        const date_match = function (e, d, o) {
            var event_date = new Date(e.date_time);
            var dates = d.split("-");
            var year = dates[0], month = dates[1], date = dates[2];
            if(month == '00'){
                if(date == '00'){
                    month = '01';
                    date = '01';
                    dates = new Date(year + '-' + month + '-' + date).getFullYear();
                    event_date = event_date.getFullYear();
                    switch(o){
                        case '==' :
                            return event_date == dates;
                        case '<=' :
                            return event_date <= dates;
                        case '>=' :
                            return event_date >= dates;
                    }
                }
                else{
                    month = '01';
                    dates = new Date(year + '-' + month + '-' + date).getMonth();
                    event_date = event_date.getMonth();
                    switch(o){
                        case '==' :
                            return event_date == dates;
                        case '<=' :
                            return event_date <= dates;
                        case '>=' :
                            return event_date >= dates;
                    }
                }
            }
            else{
                dates = new Date(year + '-' + month + '-' + date)
                switch(o){
                    case '==' :
                        return event_date == dates;
                    case '<=' :
                        return event_date <= dates;
                    case '>=' :
                        return event_date >= dates;
                }
            }
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

    const test = (props) => {
        alert("test2")
        alert(props.rule.jsCode)
    }

    return (
        <Card style={{ width: '18rem' }}><Card.Body>
            <Card.Title><a>{props.rule.name}</a></Card.Title>
            <Row>自動実行: <Col><Toggle defaultChecked={props.rule.enable_auto == 'true'} onChange={enable_auto} /></Col></Row>
            <Row>
                <Col><Button variant="outline-success" onClick={() => execution(props.rule.jsCode)} >
                    実行
                </Button></Col>
                <Col><Button variant="outline-success" onClick={() => test(props)} >
                    test
                </Button></Col>
                <Col><Button variant="outline-success" onClick={() => edit(props.rule)} >
                    編集
                </Button></Col>
                <Col><Button variant="danger" onClick={() => remove(props.rule.id)} >
                    ×
                </Button></Col>
            </Row>
        </Card.Body></Card>
    );
}
export default Rule;
