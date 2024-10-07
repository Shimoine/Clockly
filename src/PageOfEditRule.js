import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import Form from 'react-bootstrap/Form'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import UseBlockly from './UseBlockly'
import Blockly from './blockly_compressed';

import 'react-tabs/style/react-tabs.css';

function PageOfMakeRule(props) {
    const [name, setName] = useState('');
    const [blockXml, setBlockXml] = useState(null);
    const [jsCode, setJsCode] = useState('');
    const [rbCode, setRbCode] = useState('');
    const [workspace, setWorkspace] = useState(null);
    const location = useLocation();

    const createRule = () => {
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        var calendar_id_list = code.split('/*{*/').slice(1).map(e => {
            return e.split('/*}*/')[0].split("'")[1];
        });
        var xml = {
            id: location.state?.id,
            name: name,
            blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
            jsCode: Blockly.JavaScript.workspaceToCode(workspace),
            rbCode: Blockly.Python.workspaceToCode(workspace),
            calendar_id_list: calendar_id_list,
            enable_auto: false
        };
        fetch("/update_program", {
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

    useEffect(() => {
        setName(location.state?.name);
        setBlockXml(location.state?.block);
        if (workspace && blockXml) {
            const dom = Blockly.Xml.textToDom(blockXml);
            Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
        }
    }, [location.state?.block, workspace]);

    return (
        <div>
            <h1>ルールの作成</h1>

            ルール名: <Form.Control defaultValue={location.state?.name} placeholder="" onChange = {handleNameChange}/>
            <p/>

            <Tabs onSelect={tab_select}>
                <TabList>
                    <Tab>Blockly</Tab>
                    <Tab>JavaScript</Tab>
                    <Tab>Ruby</Tab>
                </TabList>
                <TabPanel>
                    <UseBlockly h={400} w={1200} setWorkspace={i => setWorkspace(i)} blockXml={location.state?.block}/>
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
                    ルールを変更
                </Button>
            </Link>
        </div>
    );
}
export default PageOfMakeRule;
