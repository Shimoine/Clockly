import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Toggle from 'react-toggle'
import React, { useState } from 'react';
import { useEffect } from "react";
import * as Blockly from 'blockly';
import { BrowserRouter as Router, Route, Link, useNavigate } from 'react-router-dom';
//import e from 'express';

function CustomToggle({ checked, onChange }) {
    return (
        <label className="switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="slider"></span>
        </label>
    );
}   

function Rule(props) {
    const { rule, onRemove } = props;
    const [previewXml, setPreviewXml] = useState('');
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
                if(event.status != "cancelled"){
                    var eventjson = {calendar_id: calendar_id,event: event};
                    fetch("/insert_event", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventjson)
                    })
                }
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
                            const targetMatch = target_events.find(target => getEventId(target) === getEventId(source));
                            alert(targetMatch);
                            alert(compareEvents(source, targetMatch));
                            alert(targetMatch.status);
                            if (!targetMatch) {
                                var eventjson = {calendar_id: calendar_id,event: source};
                                fetch("/insert_event", {
                                    method: "POST",
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(eventjson)
                                })
                            } else{
                                if(targetMatch.status == "cancelled" || compareEvents(source, targetMatch)){
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
                            const sourceMatch = source_events.find(source => getEventId(source) === getEventId(target));
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

        const normalize_date = function(dates){
            var y = (dates.match(/Y([a-z_]+|\d{4})/) || [])[1];
            var m = (dates.match(/M([a-z_]+|\d{2})/) || [])[1];
            var d = (dates.match(/D([a-z_]+|\d{2})/) || [])[1];
            var w = (dates.match(/W([a-z_]+|\d{1})/) || [])[1];
            var dw = (dates.match(/DAY([a-z_]+|\d{1})/) || [])[1];
            var shaping_dates = {};
            var year, month, date, day;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            switch(d){
                case 'today':
                    shaping_dates.start = today;
                    return shaping_dates;
                case 'tomorrow':
                    var tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);
                    shaping_dates.start = tomorrow;
                    return shaping_dates;
                case 'yesterday':
                    var yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    shaping_dates.start = yesterday;
                    return dates;
                case undefined:
                    shaping_dates.type = 'month';
                    break;
                default:
                    date = d;
                    shaping_dates.type = 'date';
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
                case undefined:
                    shaping_dates.type = 'year';
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
                case undefined:
                    break;
                default:
                    year = y;
                    break;
            }
            switch(w){
                case 'this_week':
                    var day = today.getDay();
                    shaping_dates.type = 'week';
                    shaping_dates.start = new Date(today);
                    shaping_dates.start.setDate(today.getDate() - day);
                    shaping_dates.end = new Date(shaping_dates.start);
                    shaping_dates.end.setDate(shaping_dates.start.getDate() + 7);
                    break;
                case 'next_week':
                    var day = today.getDay();
                    shaping_dates.start = new Date(today);
                    shaping_dates.type = 'week';
                    shaping_dates.start.setDate(today.getDate() - day + 7);
                    shaping_dates.end = new Date(shaping_dates.start);
                    shaping_dates.end.setDate(shaping_dates.start.getDate() + 7);
                    break;
                case 'last_week':
                    var day = today.getDay();
                    shaping_dates.start = new Date(today);
                    shaping_dates.type = 'week';
                    shaping_dates.start.setDate(today.getDate() - day - 7);
                    shaping_dates.end = new Date(shaping_dates.start);
                    shaping_dates.end.setDate(shaping_dates.start.getDate() + 7);
                    break;
                default:
                    break;
            }
            if(dw != 'undefined'){
                shaping_dates.day = Number(dw);
            }
            switch(shaping_dates.type){
                case 'date':
                    shaping_dates.start = new Date(year, month - 1, date);
                    break;
                case 'month':
                    shaping_dates.start = new Date(year, month - 1, 1);
                    shaping_dates.end = new Date(year, month, 1);
                    break;
                case 'year':
                    shaping_dates.start = new Date(year, 0, 1);
                    shaping_dates.end = new Date(Number(year) + 1, 0, 1);
                    break;
                default:
                    break;
            }

            return shaping_dates;
        }
        
        const date_match = function (e, d, o) {
            var event_dates = new Date(e.date_time);
            var event_year = event_dates.getFullYear();
            var event_month = event_dates.getMonth() + 1;
            var event_date = event_dates.getDate();
            var start_dates = d.start;
            var end_dates = d.end;

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

        const move = function(old_date, new_date){
            var event_date = new Date(old_date);
            console.log(event_date)
        }

        var fullcode = '(async () => {' + code + '})();';
        try{
            eval(fullcode);
            alert("実行が完了しました");
        }catch (e) {
            console.error(e);
            alert(e);
        }
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
        if (window.confirm("本当に削除してよろしいですか？")) {
            fetch("/delete_program", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id})
            })
            .then(response => {
                if (response.ok) {
                    alert("削除が完了しました。");
                } else {
                    alert("削除に失敗しました。");
                }
            })
        }
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

    useEffect(() => {
        setPreviewXml(rule.blockXml);
    }, [rule])

    return (
        <Row style={{ display: 'flex', alignItems: 'stretch', paddingLeft: '5px', width: '100%' }}>
            {/* 左側: ルール詳細 */}
            <Col xs="auto" style={{ display: 'flex', flexDirection: 'column', paddingLeft: '10px' }}>
                <Card style={{ width: '18rem', flex: 1 }}>
                    <Card.Body>
                        <Card.Title>
                            <span>ルール名: </span><a>{rule.name}</a>
                        </Card.Title>
                        <Row>自動実行: <Col>
                        <Toggle defaultChecked={rule.enable_auto == 'true'} onChange={enable_auto} /></Col></Row>
                        <Row>
                            <Col><Button variant="outline-success" onClick={() => execution(rule.jsCode)} >
                                実行
                            </Button></Col>
                            <Col><Button variant="outline-success" onClick={() => edit(rule)} >
                                編集
                            </Button></Col>
                            <Col><Button variant="danger" onClick={() => onRemove(rule.id)} >
                                ×
                            </Button></Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
    
            {/* 右側: 共通のプレビューエリア */}
            <Col style={{ display: 'flex', flexDirection: 'column', paddingLeft: '5px', flex: 0.6 }}>
                <div
                    id="preview-container"
                    style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '5px',
                        flex: 1, // プレビューエリアの高さをカードと同じにする
                    }}
                >
                    <h5>プレビュー</h5>
                    {previewXml && <PreviewBlock blockXml={previewXml} />}
                </div>
            </Col>
        </Row>
    );
    
    
};

const PreviewBlock = ({ blockXml }) => {
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        if (!containerRef.current) return;

        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }

        const workspace = Blockly.inject(containerRef.current, {
            toolbox: null,
            readOnly: true,
            scrollbars: true,
        });

        try {
            const blockXmlDom = Blockly.utils.xml.textToDom(blockXml);
            Blockly.Xml.domToWorkspace(blockXmlDom, workspace);

            const blocks = workspace.getTopBlocks();
            if (blocks.length > 0) {
                const block = blocks[0]; // 最初のブロックを中央に配置
                workspace.centerOnBlock(block.id); // ブロックを中央に配置
            }
        } catch (error) {
            console.error('Error loading block XML:', error);
        }

        return () => {
            workspace.dispose();
        };
    }, [blockXml]);

    return <div ref={containerRef} style={{ height: '300px' }} />;
};

export default Rule;
