// import { useEffect, useState } from 'react';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, useLocation } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import UseBlockly from './UseBlockly'
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';
import { handleTabSelect as handleTabSelectUtil } from './tabHandlers';
import ChatSidebar from './ChatSidebar'
import 'react-tabs/style/react-tabs.css';

function PageOfMakeRule(props) {
    const [name, setName] = useState('');
    const [blockXml, setBlockXml] = useState(null);
    const [jsCode, setJsCode] = useState('');
    const [rbCode, setRbCode] = useState('');
    const [workspace, setWorkspace] = useState(null);
    const [currentXmlText, setCurrentXmlText] = useState('');
    const [jsonCode, setJsonCode] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [library, setLibrary] = useState({id: [], name: [], xml: [] });
    const location = useLocation();
    const [chatOpen, setChatOpen] = useState(false);

    useEffect(() => {
            fetch("/get_library")
                .then(response => response.json())
                .then(data => setLibrary(data))
                .catch(error => console.error('Error fetching library:', error));
        }, []);

    const createRule = () => {
        var code = javascriptGenerator.workspaceToCode(workspace);
        var calendar_id_list = code.split('/*{*/').slice(1).map(e => {
            return e.split('/*}*/')[0].split("'")[1];
        });
        var xml = {
            id: location.state?.id,
            name: name,
            blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)),
            jsCode: javascriptGenerator.workspaceToCode(workspace),
            rbCode: pythonGenerator.workspaceToCode(workspace),
            calendar_id_list: calendar_id_list,
            enable_auto: false
        };
        try{
            fetch("/update_program", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(xml)
            })
        }catch(e){
            console.log(e)
        }
    }

    const handleNameChange = (event) => {
        setName(event.target.value);
    }
    const importLibrary = (xml) => {
        // Blockly タブに移動
        setSelectedTab(0);
        // ワークスペース上のブロックを取得
        const currentXml = Blockly.Xml.workspaceToDom(workspace);
        let currentXmlText = Blockly.Xml.domToText(currentXml);
            // ワークスペース上のブロックのXMLと結合
            currentXmlText = currentXmlText.replace('</xml>', '');
            const combinedXml = `${currentXmlText}${xml}</xml>`;
            setBlockXml(combinedXml);
        };
    
        // Library へエクスポート
        const exportLibrary = () => {
            const library_name = prompt("ライブラリの名前を入力してください:");
            
            var xml = {
                id: crypto.randomUUID(),
                name: library_name,
                blockXml: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)).replace('<xml xmlns="https://developers.google.com/blockly/xml">', '').replace('</xml>', '')
            };
            console.log("Sending data:", JSON.stringify(xml)); // デバッグ用ログ
            fetch("/create_library", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(xml)
            })
            .then(response => {
                if (response.ok) {
                    alert("ライブラリに追加しました。");
                    setLibrary({ id: [...library.id,xml.id], name: [...library.name, xml.name], xml: [...library.xml, xml.blockXml] });
                } else {
                    alert("ライブラリへの追加に失敗しました。");
                }
            })
        }
    
        // Library から削除
        const removeLibrary = (id) => {
            if (window.confirm("本当に削除してよろしいですか？")) {
                fetch("/delete_library", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(id)
                })
                .then(response => {
                    if (response.ok) {
                        alert("削除が完了しました。");
                        setLibrary(prevLibrary => ({
                            id: prevLibrary.id.filter(libraryId => libraryId !== id),
                            name: prevLibrary.name.filter((_, index) => prevLibrary.id[index] !== id),
                            xml: prevLibrary.xml.filter((_, index) => prevLibrary.id[index] !== id)
                        }));
                    } else {
                        alert("削除に失敗しました。");
                    }
                })
            }
        }

    const PreviewBlock = ({ blockXml }) => {
        const containerRef = React.useRef(null);
    
        React.useEffect(() => {
            if (!containerRef.current) return;
    
            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
    
            const preview_workspace = Blockly.inject(containerRef.current, {
                toolbox: null,
                readOnly: true,
                scrollbars: true,
            });
    
            try {
                const blockXmlDom = Blockly.utils.xml.textToDom(blockXml);
                Blockly.Xml.domToWorkspace(blockXmlDom, preview_workspace);

                const blocks = preview_workspace.getTopBlocks();
                if (blocks.length > 0) {
                    const block = blocks[0]; // 最初のブロックを中央に配置
                    preview_workspace.centerOnBlock(block.id); // ブロックを中央に配置
                }
            } catch (error) {
                console.error('Error loading block XML:', error);
            }
    
            return () => {
                preview_workspace.dispose();
            };
        }, [blockXml]);
    
        return <div ref={containerRef} style={{ height: '300px', width: '700px', marginBottom: '10px' }} />;
    };

    const handleTabSelect = (index) => {
        setSelectedTab(index);
        handleTabSelectUtil(index, workspace, blockXml, {
            setBlockXml,
            setJsCode,
            setRbCode,
            setCurrentXmlText,
            setJsonCode
        });
    };

    useEffect(() => {
        setName(location.state?.name);
        setBlockXml(location.state?.block);
        if (workspace && blockXml) {
            const dom = Blockly.utils.xml.textToDom(blockXml);
            Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
            workspace.resize();
            workspace.scrollCenter();
        }
    }, [location.state?.block, workspace]);

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 auto', marginRight: chatOpen ? '640px' : '0px', transition: 'margin-right 240ms ease-in-out' }}>
                    <h1 style={{ margin: 0 }}>ルールの作成</h1>
                    <div style={{ marginTop: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1, marginRight: '12px' }}>
                            ルール名: <Form.Control value={name} placeholder={location.state?.name || ''} onChange={handleNameChange} />
                        </div>
                    </div>
                    <Tabs selectedIndex={selectedTab} onSelect={handleTabSelect}>
                        <TabList>
                            <Tab>Blockly</Tab>
                            <Tab>JavaScript</Tab>
                            <Tab>Ruby</Tab>
                            <Tab>XML</Tab>
                            <Tab>JSON</Tab>
                            <Tab>Library</Tab>
                        </TabList>
                        <TabPanel>
                            <UseBlockly h={500} w={1200} workspace={workspace} setWorkspace={setWorkspace} blockXml={blockXml} setBlockXml={setBlockXml} ruleName={name} />
                        </TabPanel>
                        <TabPanel>
                            <pre><code>{jsCode}</code></pre>
                        </TabPanel>
                        <TabPanel>
                            <pre><code>{rbCode}</code></pre>
                        </TabPanel>
                        <TabPanel>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}><code>{currentXmlText}</code></pre>
                        </TabPanel>
                        <TabPanel>
                            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}><code>{jsonCode}</code></pre>
                        </TabPanel>
                        <TabPanel>
                            <pre>
                                <code>
                                    <h3>ライブラリ一覧</h3>
                                    {library.xml.map((xml, index) => (
                                        <div key={index} style={{ border: '1px solid lightgray', padding: '10px', borderRadius: '10px', marginBottom: '10px'}}>
                                            <h4>{library.name[index]}</h4>
                                            {xml && <PreviewBlock blockXml={`<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`} />}
                                            <Button variant="outline-success" onClick={() => importLibrary(xml)} style={{ marginRight: '10px' }}>Import</Button>
                                            <Button variant="danger" onClick={() => removeLibrary(library.id[index])}>×</Button>
                                        </div>
                                    ))}
                                </code>
                            </pre>
                        </TabPanel>
                    </Tabs>
                    <div style={{ marginTop: '12px' }}>
                        <Link to="/list">
                            <Button variant="outline-success" onClick={createRule} style={{ marginRight: '10px' }}>
                                ルールを変更
                            </Button>
                        </Link>
                        <Button variant="outline-success" onClick={exportLibrary}>
                            ライブラリに追加
                        </Button>
                    </div>
                </div>
            </div>
            <ChatSidebar workspace={workspace} ruleName={name} open={chatOpen} onOpenChange={setChatOpen} />
            <p/>
        </div>
    );
}
export default PageOfMakeRule;
