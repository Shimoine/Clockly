import { useEffect } from "react";
//import Blockly, { ToolboxCategory } from "blockly";
import React, { useState } from "react";
import Blockly from './blockly_compressed';
import './blocks_compressed.js';
import './javascript_compressed.js';
import './python_compressed.js';
import './myblock.js';
import './Blocks.js';

var calendar_list = [];  // TODO: state を使う

function UseBlockly(props) {
    //const [calendar_list, setCalendarList] = useState([]);
    const xml = `
        <xml id="toolbox">
            <category name="カレンダ" colour="160" custom="CALENDAR_VARIABLE" >
            </category>
            <category name="入出力" colour="160" >
                <block type="get_events"></block>
                <block type="filter"></block>
                <block type="insert_event"></block>
                <block type="print"></block>
            </category>
            <category name="編集" colour="160" >
                <block type="map"></block>
                <block type="property"></block>
                <block type="replace"></block>
                <block type="move"></block>
            </category>
            <category name="論理" colour="160" >
                <block type="if"></block>
                <block type="and"></block>
                <block type="or"></block>
                <block type="match"></block>
                <block type="date_match"></block>
            </category>
            <category name="日付" colour="160" >
                <block type="year">
                    <value name="month">
                        <block type="month">
                            <value name="date">
                                <block type="date"></block>
                            </value>
                        </block>
                    </value>
                </block>
                <block type="day"></block>
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
                json.map(calendar => {
                    calendars.push([calendar.summary, calendar.id]);
                    workspace.createVariable(calendar.summary, "Calendar");
                    calendar_list.push([calendar.summary, calendar.id]);
                })
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
    }, []);

    
    return (
        <div>
            <div id="blocklyDiv" style={{height: props.h, width: props.w}}></div>
        </div>
    );
}

export default UseBlockly;
