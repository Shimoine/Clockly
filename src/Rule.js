import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
//import Toggle from 'react-toggle'
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function Rule(props) {
    const execution = (code) => {
        const get_events = async function (calendar_id){
            var events=[];
            await fetch( "/calendar/"+calendar_id)
                .then( response => response.json() )
                .then( json =>  {
                    for(var i = 0; i < json.items.length; i++) events.push(json.items[i]);
                });
            return events;
        }

        const insert_event = async function (event,calendar_id){
            var eventjson = {calendar: calendar_id,events: event};
            await fetch("/insert_event", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventjson)
            })
        }
        var fullcode = '(async () => {' + code + '})();';
        eval(fullcode);
    }

    const remove = (name) => {
        fetch("/delete_program", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name})
        })
    }

    return (
        <Card style={{ width: '18rem' }}><Card.Body>
            <Card.Title><a>{props.rule.name}</a></Card.Title>
            <Row>
                <Col><Button variant="outline-success" onClick={() => execution(props.rule.code)} >
                    実行
                </Button></Col>
                <Col><Link to={"/edit/" + props.rule.name}><Button variant="outline-success" >
                    編集
                </Button></Link></Col>
                <Col><Button variant="danger" onClick={() => remove(props.rule.name)} >
                    ×
                </Button></Col>
            </Row>
        </Card.Body></Card>
    );
}
export default Rule;
