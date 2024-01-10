//import React, { Component } from 'react';
import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import Form from 'react-bootstrap/Form'
//import Blockly from './blockly_compressed';
//import UseBlockly from './UseBlockly'
//import BigCalendar from 'react-big-calendar';
//import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import UseBlockly from './UseBlockly'
import Blockly from './blockly_compressed';

import 'react-tabs/style/react-tabs.css';

//import './PageOfMakeRule.css'

//<UseBlockly setWorkspace={i => this.setWorkspace(i)} myBlockXml={this.state.blockxml} h="320px" w="1200px"/>
//<pre><code>{this.state.jscode}</code></pre>
//<pre><code>{this.state.rbcode}</code></pre>

function PageOfMakeRule(props) {
    console.log("dijasoidfjasiodj");
    console.log(props);
    const [name, setName] = useState('');
    const [blockXml, setBlockXml] = useState(null);
    const [jsCode, setJsCode] = useState('');
    const [rbCode, setRbCode] = useState('');
    const [workspace, setWorkspace] = useState(null);
    /*const setWorkspace = (workspace) => {

    };*/

    const createRule = () => {
        tab_select();
        var xml = {
            name: name,
            blockXml: blockXml,
            jsCode: jsCode,
            rbCode: rbCode
        };
        fetch("/create_program", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(xml)
        })
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    const tab_select = () => {
        setBlockXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)))
        setJsCode(Blockly.JavaScript.workspaceToCode(workspace))
        setRbCode(Blockly.Python.workspaceToCode(workspace))
    }

    return (
        <div>
            <h1>ルールの作成</h1>

            ルール名: <Form.Control placeholder="" onChange = {handleNameChange}/>
            <p/>

            <Tabs onSelect={tab_select}>
                <TabList>
                    <Tab>Blockly</Tab>
                    <Tab>JavaScript</Tab>
                    <Tab>Ruby</Tab>
                </TabList>
                <TabPanel>
                    <UseBlockly h={400} w={1200} setWorkspace={i => setWorkspace(i)} blockXml={blockXml}/>
                </TabPanel>
                <TabPanel>
                    <pre><code>{jsCode}</code></pre>
                </TabPanel>
                <TabPanel>
                    <pre><code>{rbCode}</code></pre>
                </TabPanel>
            </Tabs>
            <p/>
            <Link to="/list">
                <Button variant="outline-success" onClick={createRule}>
                    ルールを作成
                </Button>
            </Link>
        </div>
    );
}
export default PageOfMakeRule;
