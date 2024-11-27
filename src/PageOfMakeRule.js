import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import Form from 'react-bootstrap/Form'
import UseBlockly from './UseBlockly'
import Blockly from './blockly_compressed';

import 'react-tabs/style/react-tabs.css';

function PageOfMakeRule(props) {
    const [name, setName] = useState('');
    const [blockXml, setBlockXml] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const location = useLocation();

    const createRule = () => {
        try{
            if (!workspace) {
                throw new Error("Workspace is not initialized.");
            }
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        var calendar_id_list = code.split('/*{*/').slice(1).map(e => {
            return e.split('/*}*/')[0].split("'")[1];
        });
        var xml = {
            id: crypto.randomUUID(),
            name: name,
            blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
            jsCode: Blockly.JavaScript.workspaceToCode(workspace),
            rbCode: Blockly.Python.workspaceToCode(workspace),
            calendar_id_list: calendar_id_list,
            enable_auto: false
        };
        fetch("/create_program", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(xml)
        })
    }catch(e){
        console.log(e);
        alert(e);
    }
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    }

    useEffect(() => {
        setBlockXml(location.state?.block);
    }, []);


    return (
        <div>
            <h1>ルールの作成</h1>

            ルール名: <Form.Control defaultValue={location.state?.name} placeholder="" onChange = {handleNameChange}/>
            <p/>
                <UseBlockly h={400} w={1200} setWorkspace={setWorkspace} blockXml={blockXml} setBlockXml={setBlockXml}/>
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
