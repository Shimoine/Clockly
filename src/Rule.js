import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
//import Toggle from 'react-toggle'
import Button from 'react-bootstrap/Button';
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

    return (
        <Card style={{ width: '18rem' }}><Card.Body>
            <Card.Title><a>{props.rule.name}</a></Card.Title>
            <Row>
                <Col><Button variant="outline-success" onClick={() => execution(props.rule.code)} >
                    実行
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
