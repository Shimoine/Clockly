import { useEffect } from "react";
import React, { useState } from "react";
import * as Blockly from 'blockly';
import { Button, Modal, Row, Col } from "react-bootstrap";

import './Blocks.js';
import generateAllBlocksXml from './AllBlocksXml';

var calendar_list = [];  // TODO: state を使う

function UseBlockly(props) {
    // const [workspace, setWorkspace] = useState(null);
    //const [calendar_list, setCalendarList] = useState([]);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewData, setPreviewData] = useState({
        originalXml: '',
        completedXml: '',
        originalWorkspace: null,
        completedWorkspace: null
    });
    const xml = `
        <xml id="toolbox">
            <category name="カレンダ" colour="300" custom="CALENDAR_VARIABLE" >
            </category>

            <category name="カレンダ操作" colour="210" >
                <block type="get_events" colour="230">
                    <value name="calendar">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
                <block type="insert_event">
                    <value name="event">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">予定</field>
                        </shadow>
                    </value>
                    <value name="calendar">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
                <block type="insert_event2">
                    <value name="calendar">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
                <block type="update_event">
                    <value name="calendar1">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                    <value name="calendar2">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
                <block type="delete_event">
                    <value name="event">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">予定</field>
                        </shadow>
                    </value>
                    <value name="calendar">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
            </category>

            <category name="抽出" colour="180" >
                <label text="抽出" web-class="myLabelStyle"></label>
                <block type="filter">
                    <value name="events">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">予定</field>
                        </shadow>
                    </value>
                    <value name="condition">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件</field>
                        </shadow>
                    </value>
                </block>
                <label text="絞り込み" web-class="myLabelStyle"></label>
                <block type="if">
                    <value name="condition">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件</field>
                        </shadow>
                    </value>
                    <value name="statement">
                        <shadow type="dummy_statement" colour="230">
                            <field name="text">処理</field>
                        </shadow>
                    </value>
                </block>
                <label text="条件" web-class="myLabelStyle"></label>
                <block type="match">
                    <field name="property">summary</field>
                    <field name="text">ここに入力</field>
                </block>
                <block type="date_match">
                    <value name="dates">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">日付</field>
                        </shadow>
                    </value>
                </block>
                <block type="time_match">
                    <value name="time">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">時刻</field>
                        </shadow>
                    </value>
                </block>
                <label text="結合" web-class="myLabelStyle"></label>
                <block type="and">
                    <value name="value1">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件1</field>
                        </shadow>
                    </value>
                    <value name="value2">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件2</field>
                        </shadow>
                    </value>
                </block>
                <block type="or">
                    <value name="value1">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件1</field>
                        </shadow>
                    </value>
                    <value name="value2">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件2</field>
                        </shadow>
                    </value>
                </block>
            </category>

            <category name="加工" colour="240" >
            <label text="写像" web-class="myLabelStyle"></label>
                <block type="map_test">
                    <value name="calendar1">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                    <value name="statement">
                        <shadow type="dummy_statement" colour="230">
                            <field name="text">加工処理</field>
                        </shadow>
                    </value>
                    <value name="calendar2">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
                <block type="map_test2">
                    <value name="calendar1">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                    <value name="boolean">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">条件</field>
                        </shadow>
                    </value>
                    <value name="statement">
                        <shadow type="dummy_statement" colour="230">
                            <field name="text">加工処理</field>
                        </shadow>
                    </value>
                    <value name="calendar2">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">カレンダ</field>
                        </shadow>
                    </value>
                </block>
            <label text="加工" web-class="myLabelStyle"></label>
                <block type="replace_name">
                    <field name="property">summary</field>
                    <field name="text">ここに入力</field>
                </block>
                <block type="hide"></block>
                <block type="move">
                    <value name="date">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">日付</field>
                        </shadow>
                    </value>
                </block>
            </category>

            <category name="日付" colour="120" >
                <label text="日付" web-class="myLabelStyle"></label>
                <block type="year">
                    <value name="month">
                        <block type="month">
                            <value name="date">
                                <block type="date"></block>
                            </value>
                        </block>
                    </value>
                </block>
                <block type="specified_year"></block>
                <block type="specified_month"></block>
                <block type="specified_week"></block>
                <block type="specified_date"></block>
                <block type="day"></block>
                <label text="時刻" web-class="myLabelStyle"></label>
                <block type="time"></block>
            </category>

            <category name="集計/表示" colour="60" >
                <label text="集計" web-class="myLabelStyle"></label>
                <block type="total_hours">
                    <value name="events">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">予定</field>
                        </shadow>
                    </value>
                </block>
                <block type="total_events">
                    <value name="events">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">予定</field>
                        </shadow>
                    </value>
                </block>
                <label text="表示" web-class="myLabelStyle"></label>
                <block type="print">
                    <value name="value">
                        <shadow type="dummy_value" colour="230">
                            <field name="text">データ</field>
                        </shadow>
                    </value>
                </block>
            </category>
        </xml>
    `;
    
    const xmlParser = new DOMParser();
    const xmlDom = xmlParser.parseFromString(xml, "text/xml");

    const RegisterCalendar = (workspace) => {
        fetch( "/calendar_list")
            .then( response => response.json() )
            .then( json => {
                var calendars = [];
                calendar_list = [];
                json.map(calendar => {
                    calendars.push([calendar.summary, calendar.id]);
                    workspace.getVariableMap().createVariable(calendar.summary, "Calendar");
                    calendar_list.push([calendar.summary, calendar.id]);
                })
                calendar_list.sort((a, b) => a[0].localeCompare(b[0]));
                //setCalendarList(calendars)
            });

        workspace.registerToolboxCategoryCallback ("CALENDAR_VARIABLE", (workspace) => {
            const xmlStringList = []
            const calendarVariables = workspace.getVariableMap().getVariablesOfType ("Calendar");
            if (calendarVariables.length > 0) {
                let field = "<field name=\"FIELD_NAME\" id=\"" + calendarVariables[0].getId () + "\" variabletype=\"Calendar\"></field>";
                // ここのスコープがよくわからない．calendar_list は state では値が入らなかった．
                for (const calendar of calendar_list) {
                    field = "<field name=\"summary\" >"+calendar[0]+"</field>";
                    field+= "<field name=\"id\" >"+calendar[1]+"</field>";
                    xmlStringList.push ("<block type=\"calendar\">" + field + "</block>");
                }
            }
            const xmlElementList = xmlStringList.map ((item) => {
                return Blockly.utils.xml.textToDom (item);
            });
            return xmlElementList;
        });
    }

    // AI補完処理を実行する関数
    const handleAICompletion = async () => {
        if (!props.ruleName) {
            alert("ルール名が未定義です");
            return;
        }

        setIsAIGenerating(true); // AI生成開始

        try {
            // 現在のワークスペースのXMLを取得
            const currentXml = Blockly.Xml.workspaceToDom(props.workspace);
            // block と shadow の id 属性を削除して比較を容易にする
            currentXml.querySelectorAll("block, shadow").forEach(b => b.removeAttribute("id")); //id 属性を削除して比較を容易にする
            const currentXmlText = Blockly.Xml.domToText(currentXml);

            // サーバーから利用可能なカレンダー一覧を取得して送信
            let availableCalendars = [];
            const resp = await fetch('/calendar_list');
            if (resp.ok) {
                const list = await resp.json();
                availableCalendars = list.map(c => ({ summary: c.summary, id: c.id }));
            } else {
                availableCalendars = []; 
            }

            const requestData = {
                currentWorkspace: currentXmlText,
                xmlExample: generateAllBlocksXml(Blockly, props.workspace),
                ruleName: props.ruleName,
                availableCalendars: availableCalendars
            };

            // Gemini APIに送信
            const response = await fetch('/gemini-completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Gemini APIの呼び出しに失敗しました');
            }

            const result = await response.json();
            if (result.completedXml) {
                // 補完前後の比較プレビューを準備
                setPreviewData({
                    originalXml: currentXmlText,
                    completedXml: result.completedXml,
                    originalWorkspace: null,
                    completedWorkspace: null
                });
                setShowPreviewModal(true);
            } else {
                alert("AI補完の結果を取得できませんでした");
            }

        } catch (error) {
            console.error('AI補完エラー:', error);
            alert("AI補完中にエラーが発生しました: " + error.message);
        } finally {
            setIsAIGenerating(false);
        }
    };

    // AI補完の適用
    const applyChanges = () => {
        try {
            props.workspace.clear();
            const completedXmlDom = Blockly.utils.xml.textToDom(previewData.completedXml);
            Blockly.Xml.domToWorkspace(completedXmlDom, props.workspace);
            
            // ワークスペースの中央にブロックを配置
            const topBlocks = props.workspace.getTopBlocks();
            if (topBlocks.length > 0) {
                const firstBlock = topBlocks[0];
                props.workspace.centerOnBlock(firstBlock.id);
                
                let yOffset = 0;
                topBlocks.forEach((block, index) => {
                    if (index > 0) {
                        block.moveBy(0, yOffset);
                        yOffset += 100;
                    }
                });
            }
            
            setShowPreviewModal(false);
        } catch (error) {
            console.error('適用エラー:', error);
            alert("変更の適用中にエラーが発生しました: " + error.message);
        }
    };

    // プレビューモーダルをキャンセルする関数
    const cancelChanges = () => {
        setShowPreviewModal(false);
    };

    // プレビュー用ワークスペースを作成する関数
    const PreviewWorkspace = ({ xmlText, title }) => {
        const containerRef = React.useRef(null);
        
        React.useEffect(() => {
            if (!containerRef.current || !xmlText) return;
            
            // 既存のワークスペースをクリア
            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            
            const previewWorkspace = Blockly.inject(containerRef.current, {
                toolbox: null,
                readOnly: true,
                scrollbars: true,
                zoom: {
                    controls: true,
                    wheel: false,
                    startScale: 0.7,
                    maxScale: 1.5,
                    minScale: 0.3,
                    scaleSpeed: 1.2
                }
            });
            
            try {
                if (xmlText.trim()) {
                    const xmlDom = Blockly.utils.xml.textToDom(xmlText);
                    Blockly.Xml.domToWorkspace(xmlDom, previewWorkspace);
                    
                    const blocks = previewWorkspace.getTopBlocks();
                    if (blocks.length > 0) {
                        previewWorkspace.centerOnBlock(blocks[0].id);
                    }
                }
            } catch (error) {
                console.error('プレビューワークスペース作成エラー:', error);
            }
            
            return () => {
                previewWorkspace.dispose();
            };
        }, [xmlText]);
        
        return (
            <div>
                <h6>{title}</h6>
                <div 
                    ref={containerRef} 
                    style={{ 
                        height: '300px', 
                        width: '100%', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px' 
                    }} 
                />
            </div>
        );
    };

    useEffect(() => {
        var workspace = Blockly.inject("blocklyDiv", {
            toolbox: xmlDom.getElementById("toolbox")
        });
        props.setWorkspace(workspace);
        if (props.blockXml!=null){
            var blockXmlDom = Blockly.utils.xml.textToDom(props.blockXml);
            Blockly.Xml.domToWorkspace(blockXmlDom, workspace);
        }
        RegisterCalendar(workspace);
        workspace.resize();
        workspace.scrollCenter();
    }, []);

    return (
        <div style={{ position: "relative", height: props.h, width: props.w }}>
            <div id="blocklyDiv" style={{ height: "100%", width: "100%" }}></div>
            <Button
                variant="outline-success"
                disabled={isAIGenerating}
                style={{ 
                    position: "absolute", 
                    top: "10px", 
                    right: "10px", 
                    zIndex: 1000,
                    marginRight: '10px'
                }}
                onClick={handleAICompletion}
            >
                {isAIGenerating ? "AI生成中..." : "AI補完"}
            </Button>

            {/* AI補完プレビューモーダル */}
            <Modal show={showPreviewModal} onHide={cancelChanges} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>AI補完プレビュー</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <PreviewWorkspace 
                                xmlText={previewData.originalXml} 
                                title="補完前" 
                            />
                        </Col>
                        <Col md={6}>
                            <PreviewWorkspace 
                                xmlText={previewData.completedXml} 
                                title="補完後" 
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelChanges}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={applyChanges}>
                        変更を適用
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    ); 
}

export default UseBlockly;
