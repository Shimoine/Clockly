import { useEffect } from "react";
import React, { useState } from "react";
import Blockly from './blockly_compressed';
// import Blockly from 'blockly';

import './javascript_compressed.js';
import './python_compressed.js';
import './Blocks.js';

var calendar_list = [];  // TODO: state を使う

function UseBlockly(props) {
    // const [workspace, setWorkspace] = useState(null);
    //const [calendar_list, setCalendarList] = useState([]);
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
                <block type="match"></block>
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
                <block type="replace_name"></block>
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
                    workspace.createVariable(calendar.summary, "Calendar");
                    calendar_list.push([calendar.summary, calendar.id]);
                })
                calendar_list.sort((a, b) => a[0].localeCompare(b[0]));
                console.log(calendars);
                //setCalendarList(calendars)
            });

        workspace.registerToolboxCategoryCallback ("CALENDAR_VARIABLE", (workspace) => {
            const xmlStringList = []
            const calendarVariables = workspace.getVariablesOfType ("Calendar");
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
                return Blockly.Xml.textToDom (item);
            });
            return xmlElementList;
        });
    }

    // const registerContextMenuItem = (id, weight, ScopeType ,displayText ,callback) => {
    //     console.log(Blockly.ContextMenuRegistry.registry);
    //     const isMenuItemRegistered = Object.values(Blockly.ContextMenuRegistry.registry.registry_).some(item => item.id === id);

    //     if (!isMenuItemRegistered) {
    //         Blockly.ContextMenuRegistry.registry.register({
    //             id: id,
    //             weight: weight,
    //             scopeType: ScopeType,
    //             displayText: displayText,
    //             preconditionFn: function () {
    //                 return 'enabled';
    //             },
    //             callback: callback
    //         });
    //     }
    // };

    // const startBlockly = () => {
    //     const workspace = Blockly.inject("blocklyDiv", {
    //         toolbox: xmlDom.getElementById("toolbox"),
    //     });
    //     setWorkspace(workspace);

    //     if (props.blockXml != null) {
    //         const blockXmlDom = Blockly.Xml.textToDom(props.blockXml);
    //         Blockly.Xml.domToWorkspace(blockXmlDom, workspace);
    //     }
        
    //     RegisterCalendar(workspace);

        // registerContextMenuItem(
        //     'copy_block',
        //     200,
        //     Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        //     'コピー',
        //     (scope) => Blockly.clipboard.copy(scope.block)
        // );

        // registerContextMenuItem(
        //     'paste_block',
        //     300,
        //     Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        //     '貼り付け',
        //     () => Blockly.clipboard.paste()
        // );

        // registerContextMenuItem(
        //     'Hello',
        //     400,
        //     Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        //     'Hello',
        //     () => console.log('Hello')
        // );

        // return () => {
        //     const itemsToUnregister = ['copy_block', 'paste_block', 'Hello'];
        //     // const itemsToUnregister = ['Hello'];
        //     itemsToUnregister.forEach(id => {
        //         const item = Object.values(Blockly.ContextMenuRegistry.registry.registry_).some(item => item.id === id);
        //         if (item) {
        //             Blockly.ContextMenuRegistry.registry.unregister(item);
        //         }
        //     });
        // };
    // }

    // useEffect(() => {
    //    startBlockly();
    // }, []);

    useEffect(() => {
        var workspace = Blockly.inject("blocklyDiv", {
            toolbox: xmlDom.getElementById("toolbox")
        });
        props.setWorkspace(workspace);
        if (props.blockXml!=null){
            var blockXmlDom = Blockly.Xml.textToDom(props.blockXml);
            //workspace.clear();
            Blockly.Xml.domToWorkspace(blockXmlDom, workspace);
        }
        RegisterCalendar(workspace);
        Blockly.svgResize(workspace);
        workspace.scrollCenter();
    }, []);

    return (
        <div>
            <div id="blocklyDiv" style={{height: props.h, width: props.w}}></div>
        </div>
    );    
}

export default UseBlockly;
