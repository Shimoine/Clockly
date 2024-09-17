import Blockly from './blockly_compressed';
//import * as Blockly from "blockly";

/* 現在使えるブロック
get_events: 予定の取得
insert_event: 予定の追加
print: ブラウザのウィンドウアラートに表示
map: 予定のmap操作
filter: 予定の絞り込み
property: 予定（予定集合）のプロパティを抽出
replace: プロパティの置換
move: 日付の変更
if: 条件分岐
and: 論理積
or: 論理和      TODO:プルダウンにして論理積と統合すべきかも
match: プロパティを文字列でマッチ判定
date_match: 日付の条件式
year: 年
month: 月
date: 日
day: 曜日
*/

/* ブロックXML */

Blockly.Blocks['dummy_value'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable(""), "text");
        this.setOutput(true, null);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};
/* カレンダブロック */
Blockly.Blocks['calendar'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable("calendar"), "summary");
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable(""), "id")
            .setVisible(false);
        this.setOutput(true, "Calendar");
        this.setColour(300);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* データ操作 */
Blockly.Blocks['get_events'] = {
    init: function() {
        this.appendValueInput("calendar")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("の予定");
        this.setInputsInline(true);
        this.setOutput(true, "Event");
        this.setColour(0);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['insert_event1'] = {
    init: function() {
        this.appendValueInput("event")
            .setCheck("Event");
        this.appendValueInput("calendar")
            .setCheck("Calendar")
            .appendField("を");
        this.appendDummyInput("dummy")
            .appendField("に追加");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['insert_event2'] = {
    init: function() {
        this.appendValueInput("calendar")
            .setCheck("Calendar")
        this.appendDummyInput("dummy")
            .appendField("に追加");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Block.prototype.getMatchingConnection = function(otherBlock, conn) {
    var connections = this.getConnections_(true);
    var otherConnections = otherBlock.getConnections_(true);
    // if (connections.length !== otherConnections.length) {
    //   throw Error("Connection lists did not match in length.");
    // }
    for (var i = 0; i < otherConnections.length; i++) {
        if (otherConnections[i] === conn) {
            return connections[i];
        }
    }
    return null;
};

Blockly.Blocks['insert_event'] = {
    ismap: false,

    validate: function(newValue) {
        //this.getSourceBlock().updateConnections(newValue);
        console.log("validate")
        this.updateShape();
        return newValue;
    },

    init: function() {
        this.appendValueInput("event")
            .setCheck("Event");
        this.appendValueInput("calendar")
            .setCheck("Calendar")
            .appendField("を");
        this.appendDummyInput("dummy")
            .appendField("に追加");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    },

    onchange: function(e) {
        console.log(e.type)
        //if (this.workspace.isDragging()) return;
        if (e.type !== "move") return;
        this.updateShape();
    },

    updateShape: function() {
        if (this.getSurroundLoop()?.type == 'map' && this.ismap == false) {
            this.ismap = true;
            this.removeInput('event', true);
            this.removeInput('calendar', true);
            this.removeInput('dummy', true);
            this.appendValueInput("calendar")
                .setCheck("Calendar")
            this.appendDummyInput("dummy")
                .appendField("に追加");
        } else if(this.getSurroundLoop()?.type != 'map' && this.ismap == true){
            this.ismap = false;
            this.removeInput('event', true);
            this.removeInput('calendar', true);
            this.removeInput('dummy', true);
            this.appendValueInput("event")
                .setCheck("Event");
            this.appendValueInput("calendar")
                .setCheck("Calendar")
                .appendField("を");
            this.appendDummyInput("dummy")
                .appendField("に追加");
        }
    },

    getSurroundLoop: function () {
        let block = this.getSurroundParent();
        do {
            if (block?.type == 'map') return block;
            block = block?.getSurroundParent();
        } while (block);
        return null;
    }
};

Blockly.Blocks['update_event'] = {
    init: function() {
        //this.appendValueInput("event")
        //    .setCheck("Event");
        this.appendDummyInput("dummy")
            .appendField("予定を更新");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    },
};

Blockly.Blocks['delete_event'] = {
    init: function() {
        this.appendValueInput("event")
            .setCheck("Event");
        this.appendValueInput("calendar")
            .setCheck("Calendar")
            .appendField("を");
        this.appendDummyInput("dummy")
            .appendField("から削除");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    },
};

Blockly.Blocks['print'] = {
    init: function() {
        this.appendValueInput("value")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("を表示");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* map */
Blockly.Blocks['map'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Calendar", "Event"]);
        this.appendDummyInput()
            .appendField("の各予定について");
        this.appendStatementInput("statement")
            .setCheck("map");
        this.setInputsInline(true);
        //this.setPreviousStatement(true, null);
        //this.setNextStatement(true, null);
        this.setColour(30);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('events');
                if (inputBlock && inputBlock.type === 'calendar') {
                    // 接続されたブロックが calendar ブロックの場合
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(calendarBlock) {
        // 新しいブロックを作成
        var getEventBlock = this.workspace.newBlock('get_events');
        // 接続
        getEventBlock.inputList[0].connection.connect(calendarBlock.outputConnection);
        this.getInput('events').connection.connect(getEventBlock.outputConnection);
        // 'filter' ブロックの input を 'event' タイプに変更
        //this.getInput('events').setCheck('event');
        // 新しいブロックをワークスペースに追加
        //this.workspace.cleanDirty();
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
};
Blockly.Blocks['map_output'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Calendar", "Event"]);
        this.appendDummyInput()
            .appendField("の各予定について");
        this.appendStatementInput("statement")
            .setCheck("map");
        this.setInputsInline(true);
        this.setOutput(true, "Event");
        this.setColour(0);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('events');
                if (inputBlock && inputBlock.type === 'calendar') {
                    // 接続されたブロックが calendar ブロックの場合
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(calendarBlock) {
        // 新しいブロックを作成
        var getEventBlock = this.workspace.newBlock('get_events');
        // 接続
        getEventBlock.inputList[0].connection.connect(calendarBlock.outputConnection);
        this.getInput('events').connection.connect(getEventBlock.outputConnection);
        // 'filter' ブロックの input を 'event' タイプに変更
        //this.getInput('events').setCheck('event');
        // 新しいブロックをワークスペースに追加
        //this.workspace.cleanDirty();
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
};


/* filter */
Blockly.Blocks['filter'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Calendar", "Event"]);
        this.appendValueInput("condition")
            .setCheck("Boolean")
            .appendField("を");
        this.appendDummyInput()
            .appendField("で絞り込んだ予定");
        this.setInputsInline(true);
        this.setHelpUrl("");
        this.setOutput(true, "Event");
        this.setColour(0);
        this.setTooltip("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('events');
                if (inputBlock && inputBlock.type === 'calendar') {
                    // 接続されたブロックが calendar ブロックの場合
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(calendarBlock) {
        // 新しいブロックを作成
        var getEventBlock = this.workspace.newBlock('get_events');
        // 接続
        getEventBlock.inputList[0].connection.connect(calendarBlock.outputConnection);
        this.getInput('events').connection.connect(getEventBlock.outputConnection);
        // 'filter' ブロックの input を 'event' タイプに変更
        //this.getInput('events').setCheck('event');
        // 新しいブロックをワークスペースに追加
        //this.workspace.cleanDirty();
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
};

Blockly.Blocks['filter2'] = {
    init: function() {
        this.appendValueInput("condition")
            .setCheck("Boolean")
        this.appendDummyInput()
            .appendField("で絞り込んだ予定について");
        this.appendStatementInput("statement")
            .setCheck("map");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setHelpUrl("");
        this.setColour(0);
        this.setTooltip("");
    }
};

/* 加工 */
Blockly.Blocks['property'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck("Event");
        this.appendDummyInput()
            .appendField("の")
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property");
        this.setInputsInline(true);
        this.setOutput(true, "property");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['replace'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("を")
            .appendField(new Blockly.FieldTextInput(""), "text")
            .appendField("に置き換える");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['replace_map'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Calendar", "Event"]);
        this.appendDummyInput()
            .appendField("の")
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("を")
            .appendField(new Blockly.FieldTextInput(""), "text")
            .appendField("に置き換えた予定");
        this.setInputsInline(true);
        this.setOutput(true, "Event");
        this.setColour(240);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['hide'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("を隠す");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['move'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck(["year", "month", "date", "day"])
        this.appendDummyInput()
            .appendField("に日時を移す");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* 論理 */
Blockly.Blocks['if'] = {
    init: function() {
        this.appendValueInput("condition")
            .setCheck("Boolean")
            .appendField("もし");
        this.appendStatementInput("statement")
            .setCheck(null)
            .appendField("ならば");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['and'] = {
    init: function() {
        this.appendValueInput("value1")
            .setCheck("Boolean");
        this.appendValueInput("value2")
            .setCheck(["Boolean", "day"])
            .appendField("かつ");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('value2');
                if (inputBlock && inputBlock.type === 'day') {
                    // 接続されたブロックが calendar ブロックの場合
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(calendarBlock) {
        // 新しいブロックを作成
        var getEventBlock = this.workspace.newBlock('date_match');
        // 接続
        getEventBlock.inputList[0].connection.connect(calendarBlock.outputConnection);
        this.getInput('value2').connection.connect(getEventBlock.outputConnection);
        // 'filter' ブロックの input を 'event' タイプに変更
        //this.getInput('events').setCheck('event');
        // 新しいブロックをワークスペースに追加
        //this.workspace.cleanDirty();
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
};

Blockly.Blocks['or'] = {
    init: function() {
        this.appendValueInput("value1")
            .setCheck("Boolean");
        this.appendValueInput("value2")
            .setCheck("Boolean")
            .appendField("または");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['match'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("に")
            .appendField(new Blockly.FieldTextInput(""), "text")
            .appendField("が含まれる")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['match2'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("が")
            .appendField(new Blockly.FieldTextInput(""), "text")
            .appendField("である")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['date_match'] = {
    init: function() {
        this.appendValueInput("dates")
            .setCheck(["year", "month", "date", "day"])
            .appendField(new Blockly.FieldDropdown([["開始日","start"], ["終了日","end"]]), "property")
            .appendField("が");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["である","=="], ["以降",">="], ["以前","<="]]), "operator")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('dates');
                if (inputBlock && (inputBlock.type === 'month' || inputBlock.type === 'date')) {
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(dateBlock) {
        // 新しいブロックを作成
        var getYearBlock = this.workspace.newBlock('year');
        var getMonthBlock = this.workspace.newBlock('month');
        if(dateBlock.type == 'month') {
        // 接続
        getYearBlock.initSvg();  // 新しいブロックを初期化
        getYearBlock.render();  // ブロックを描画
        dateBlock.parentBlock_.getInput('dates').connection.connect(getYearBlock.outputConnection);  // year ブロックを先頭に接続
        getYearBlock.getInput('dates').connection.connect(dateBlock.outputConnection); // month ブロックを接続
        }
        else if(dateBlock.type == 'date') {
            getMonthBlock.initSvg();
            getMonthBlock.render();
            dateBlock.parentBlock_.getInput('dates').connection.connect(getMonthBlock.outputConnection);
            getMonthBlock.getInput('dates').connection.connect(dateBlock.outputConnection);
        }
        
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xml, this.workspace);
    }
};

Blockly.Blocks['time_match'] = {
    validate: function(newValue) {
        this.getSourceBlock().updateConnections(newValue);
        return newValue;
    },

    init: function() {
        this.appendValueInput("time")
            .setCheck("time")
            .appendField(new Blockly.FieldDropdown([["開始時刻","start"], ["終了時刻","end"]]), "property")
            .appendField("が");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["である","=="], ["以降",">="], ["以前","<="], ["~","~"]],this.validate), "item")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("");
    },

    updateConnections: function(newValue) {
        this.removeInput('end', true);  
        if(newValue == '~') {
            this.appendValueInput('end')
                .setCheck("time");
        }
    }
};

/* 日付関連 */
Blockly.Blocks['year'] = {
    init: function() {
        this.appendValueInput("month")
            .setCheck("month")
            .appendField(new Blockly.FieldNumber(2024, 1970, Infinity, 1), "year")
            .appendField("年");
        this.setInputsInline(false);
        this.setOutput(true, "year");
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['month'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck("date")
            .appendField(new Blockly.FieldDropdown([
                ["1月","1"], ["2月","2"], ["3月","3"], ["4月","4"], ["5月","5"], ["6月","6"], 
                ["7月","7"], ["8月","8"], ["9月","9"], ["10月","10"], ["11月","11"], ["12月","12"]
            ]), "month");
        this.setInputsInline(false);
        this.setOutput(true, "month");
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['date'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(1, 1, 31, 1), "date")
            .appendField("日");
        this.setInputsInline(false);
        this.setOutput(true, "date");
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['day'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["日曜日","0"], ["月曜日","1"], ["火曜日","2"], ["水曜日","3"], ["木曜日","4"], ["金曜日","5"], ["土曜日","6"]
            ]), "day");
        this.setInputsInline(false);
        this.setOutput(true, "day");
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['time'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(0, 0, 23, 1), "hour")
            .appendField("時")
            .appendField(new Blockly.FieldNumber(0, 0, 59, 1), "minute")
            .appendField("分");
        this.setInputsInline(false);
        this.setOutput(true, "date");
        this.setColour(120);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['total_hours'] = {
    init: function() {
        this.appendValueInput("event")
            .setCheck("Event");
        this.appendDummyInput()
            .appendField("の合計時間");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(60);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['count'] = {
    init: function() {
        this.appendValueInput("calendar")
            .setCheck("Event");
        this.appendDummyInput()
            .appendField("の予定数合計");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(60);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};


/* JavaScript */

Blockly.JavaScript['calendar'] = function(block) {
    var calendar_id = block.getFieldValue('id');
    var code = "'" + calendar_id + "'";
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['get_events'] = function(block) {
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'await get_events(/*{*/'+calendar+'/*}*/)';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['insert_event'] = function(block) {
    var event = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.JavaScript['insert_event1'] = function(block) {
    var event = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.JavaScript['insert_event2'] = function(block) {
    var event = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.JavaScript['delete_event'] = function(block) {
    var event = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'await delete_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.JavaScript['print'] = function(block) {
    var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
    //var code = 'var value = ' + value + ';\nwindow.alert(Array.isArray(value) ? value.map( function(e) { if(typeof e === "object")}).join("\\n") : value);\n';
    var code = 'print(' + value + ');\n';
    return code;
};

Blockly.JavaScript['map'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'events', Blockly.JavaScript.ORDER_ATOMIC);
    var statement = Blockly.JavaScript.statementToCode(block, 'statement');
    var code = ''+events+'.map(async function(e) {\n'+statement+'});\n';
    return code;
};

Blockly.JavaScript['map_output'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'events', Blockly.JavaScript.ORDER_ATOMIC);
    var statement = Blockly.JavaScript.statementToCode(block, 'statement');
    var code = ''+events+'.map(async function(e) {\n' + statement + '\nreturn e;});\n';
    return code;
};

Blockly.JavaScript['filter'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'events', Blockly.JavaScript.ORDER_ATOMIC);
    var condition = Blockly.JavaScript.valueToCode(block, 'condition', Blockly.JavaScript.ORDER_ATOMIC);
    var code = '( function(events){\n  var filtered_events=[];\n  events.forEach((e) => {if('+condition+')filtered_events.push(e);})\n  return filtered_events;\n})('+events+')';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['property'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'events', Blockly.JavaScript.ORDER_ATOMIC);
    var property = block.getFieldValue('property');
    var code = events + '.map(function(e) {return e.'+property + '})';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['replace'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'="'+text+'";\n';
    return code;
};

Blockly.JavaScript['move'] = function(block) {
    var date = Blockly.JavaScript.valueToCode(block, 'date', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'move(e.start.date, ' + date + ');'
    return code;
};

Blockly.JavaScript['if'] = function(block) {
    var condition = Blockly.JavaScript.valueToCode(block, 'condition', Blockly.JavaScript.ORDER_ATOMIC);
    var statement = Blockly.JavaScript.statementToCode(block, 'statement');
    var code = 'if ' + condition + ' {\n' + statement + '}\n';
    return code;
};

Blockly.JavaScript['and'] = function(block) {
    var value1 = Blockly.JavaScript.valueToCode(block, 'value1', Blockly.JavaScript.ORDER_ATOMIC);
    var value2 = Blockly.JavaScript.valueToCode(block, 'value2', Blockly.JavaScript.ORDER_ATOMIC);
    var code = ''+value1+' && '+value2+'';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['or'] = function(block) {
    var value1 = Blockly.JavaScript.valueToCode(block, 'value1', Blockly.JavaScript.ORDER_ATOMIC);
    var value2 = Blockly.JavaScript.valueToCode(block, 'value2', Blockly.JavaScript.ORDER_ATOMIC);
    var code = ''+value1+' || '+value2+'';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['match'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'?.match(/'+text+'/)';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['match2'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+' == "'+text+'"';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['date_match'] = function(block) {
    var property = block.getFieldValue('property');
    var operator = block.getFieldValue('operator');
    var dates = Blockly.JavaScript.valueToCode(block, 'dates', Blockly.JavaScript.ORDER_ATOMIC)
    var code = 'date_match(e.'+property+', ' + '"' +dates+ '"' + ', "' + operator + '")';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['year'] = function(block) {
    var year = block.getFieldValue('year');
    var month = Blockly.JavaScript.valueToCode(block, 'month', Blockly.JavaScript.ORDER_ATOMIC) || '00-00';
    var code = year + '-' + month;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['month'] = function(block) {
    var today = new Date();
    var year = today.getFullYear();
    var month = block.getFieldValue('month');
    var date = Blockly.JavaScript.valueToCode(block, 'date', Blockly.JavaScript.ORDER_ATOMIC) || '00';
    var code = (month.length == 1 ? '0' + month : month) + '-' + date;
    if(block.getParent() && block.getParent().type != 'year') {
        code = year + '-' + code;
    }
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['date'] = function(block) {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    if(month < 10){
        month = '0' + month;
    }
    var date = block.getFieldValue('date').toString();
    var code = date.length == 1 ? '0' + date : date;

    if(block.getParent() && block.getParent().type != 'month') {
        code = year + '-' + month + '-' + code;
    }
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['day'] = function(block) {
    var day = block.getFieldValue('day');
    var code = day;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['total_hours'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var code = ''+events+'.map(e => {return(parseInt(new Date(e.end.date_time) - new Date(e.start.date_time)))}).reduce((prev,curr) => {return prev+curr;})/3600000 + "時間"';
    return [code, Blockly.JavaScript.ORDER_NONE];
};


/* Python(Ruby) */

Blockly.Python['calendar'] = function(block) {
    var calendar_id = block.getFieldValue('id');
    var code = "'" + calendar_id + "'";
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['get_events'] = function(block) {
    var calendar = Blockly.Python.valueToCode(block, 'calendar', Blockly.Python.ORDER_ATOMIC);
    var code = 'get_events('+calendar+')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['insert_event'] = function(block) {
    var event = Blockly.Python.valueToCode(block, 'event', Blockly.Python.ORDER_ATOMIC);
    var calendar = Blockly.Python.valueToCode(block, 'calendar', Blockly.Python.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.Python['insert_event1'] = function(block) {
    var event = Blockly.Python.valueToCode(block, 'event', Blockly.Python.ORDER_ATOMIC);
    var calendar = Blockly.Python.valueToCode(block, 'calendar', Blockly.Python.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.Python['insert_event2'] = function(block) {
    var event = Blockly.Python.valueToCode(block, 'event', Blockly.Python.ORDER_ATOMIC);
    var calendar = Blockly.Python.valueToCode(block, 'calendar', Blockly.Python.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.Python['delete_event'] = function(block) {
    var event = Blockly.Python.valueToCode(block, 'event', Blockly.Python.ORDER_ATOMIC);
    var calendar = Blockly.Python.valueToCode(block, 'calendar', Blockly.Python.ORDER_ATOMIC);
    if(event == '') event = 'e';
    var code = 'insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.Python['print'] = function(block) {
    var value = Blockly.Python.valueToCode(block, 'value', Blockly.Python.ORDER_ATOMIC);
    var code = 'puts '+ value +'\n';
    return code;
};

Blockly.Python['map'] = function(block) {
    var events = Blockly.Python.valueToCode(block, 'events', Blockly.Python.ORDER_ATOMIC);
    var statement = Blockly.Python.statementToCode(block, 'statement');
    var code = events+ '.each do |e|\n'+statement+'end\n';
    return code;
};

Blockly.Python['map_output'] = function(block) {
    var events = Blockly.Python.valueToCode(block, 'events', Blockly.Python.ORDER_ATOMIC);
    var statement = Blockly.Python.statementToCode(block, 'statement');
    var code = events+ '.each do |e|\n'+statement+'end\n';
    return code;
};

Blockly.Python['filter'] = function(block) {
    var events = Blockly.Python.valueToCode(block, 'events', Blockly.Python.ORDER_ATOMIC);
    var condition = Blockly.Python.valueToCode(block, 'condition', Blockly.Python.ORDER_ATOMIC);
    var code = ''+events+'.filter {|e| '+condition+'}';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['property'] = function(block) {
    var events = Blockly.Python.valueToCode(block, 'events', Blockly.Python.ORDER_ATOMIC);
    var property = block.getFieldValue('property');
    var code = events + '.' + property;
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['replace'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'="'+text+'"\n';
    return code;
};

Blockly.Python['move'] = function(block) {
    var date = Blockly.Python.valueToCode(block, 'date', Blockly.Python.ORDER_ATOMIC);
    var code = 'move(e.start.date, ' + date + ')'
    return code;
};

Blockly.Python['if'] = function(block) {
    var condition = Blockly.Python.valueToCode(block, 'condition', Blockly.Python.ORDER_ATOMIC);
    var statement = Blockly.Python.statementToCode(block, 'statement');
    var code = 'if ' + condition + ' \n' + statement + 'end\n';
    return code;
};

Blockly.Python['and'] = function(block) {
    var value1 = Blockly.Python.valueToCode(block, 'value1', Blockly.Python.ORDER_ATOMIC);
    var value2 = Blockly.Python.valueToCode(block, 'value2', Blockly.Python.ORDER_ATOMIC);
    var code = ''+value1+' && '+value2+'';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['or'] = function(block) {
    var value1 = Blockly.Python.valueToCode(block, 'value1', Blockly.Python.ORDER_ATOMIC);
    var value2 = Blockly.Python.valueToCode(block, 'value2', Blockly.Python.ORDER_ATOMIC);
    var code = ''+value1+' || '+value2+'';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['match'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'.match(/'+text+'/)';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['match2'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'.match(/'+text+'/)';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['date_match'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'.match(/'+text+'/)';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['year'] = function(block) {
    var month = Blockly.Python.valueToCode(block, 'month', Blockly.Python.ORDER_ATOMIC);
    var year = block.getFieldValue('year');
    if(month != '')month = '-' + month;
    var code = year + month;
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['month'] = function(block) {
    var date = Blockly.Python.valueToCode(block, 'date', Blockly.Python.ORDER_ATOMIC);
    var month = block.getFieldValue('month');
    if(date != '')date = '-' + date;
    var code = month + date;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['date'] = function(block) {
    var date = block.getFieldValue('date');
    var code = date;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['day'] = function(block) {
    var day = block.getFieldValue('day');
    var code = day;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['total_hours'] = function(block) {
    var events = Blockly.Python.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var code = ''+events+'.map{|e| (new Date(e.end.date_time) - new Date(e.start.date_time)).to_i}.sum';
    return [code, Blockly.Python.ORDER_NONE];
};
/**/