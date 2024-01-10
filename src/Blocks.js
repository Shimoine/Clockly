import Blockly from './blockly_compressed';

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

/* カレンダブロック */
Blockly.Blocks['calendar'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable("calendar"), "summary");
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable(""), "id")
            .setVisible(false);
        this.setOutput(true, "Calendar");
        this.setColour(230);
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
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['insert_event'] = {
    init: function() {
        this.appendValueInput("event")
        this.appendValueInput("calendar")
            .setCheck("Calendar")
            .appendField("を");
        this.appendDummyInput()
            .appendField("に追加");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    }
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
            .setCheck("Event");
        this.appendDummyInput()
            .appendField("について");
        this.appendStatementInput("statement")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* filter */
Blockly.Blocks['filter'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(null);
        this.appendValueInput("condition")
            .setCheck(null)
            .appendField("を");
        this.appendDummyInput()
            .appendField("で絞り込んだ予定");
        this.setInputsInline(true);
        this.setHelpUrl("");
        this.setOutput(true, null);
        this.setColour(180);
        this.setTooltip("");
    }
};

/* 加工 */
Blockly.Blocks['property'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(null);
        this.appendDummyInput()
            .appendField("の")
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property");
        this.setInputsInline(true);
        this.setOutput(true, null);
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
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['move'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck(null)
        this.appendDummyInput()
            .appendField("に移動");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(210);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* 論理 */
Blockly.Blocks['if'] = {
    init: function() {
        this.appendValueInput("condition")
            .setCheck("bool")
            .appendField("もし");
        this.appendStatementInput("statement")
            .setCheck(null)
            .appendField("ならば");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['and'] = {
    init: function() {
        this.appendValueInput("value1")
            .setCheck(null);
        this.appendValueInput("value2")
            .setCheck(null)
            .appendField("かつ");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['or'] = {
    init: function() {
        this.appendValueInput("value1")
            .setCheck(null);
        this.appendValueInput("value2")
            .setCheck(null)
            .appendField("または");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(160);
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
        this.setColour(160);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Blocks['date_match'] = {
    init: function() {
        this.appendValueInput("date")
            .appendField(new Blockly.FieldDropdown([["開始日","start"], ["終了日","end"]]), "property")
            .appendField("が");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["","=="], ["以降",">="], ["以前","<="]]), "operator")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(160);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

/* 日付関連 */
Blockly.Blocks['year'] = {
    init: function() {
        this.appendValueInput("month")
            .setCheck("month")
            .appendField(new Blockly.FieldNumber(2023, 1970, Infinity, 1), "year")
            .appendField("年");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(160);
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
        this.setColour(160);
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
        this.setColour(160);
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
        this.setColour(160);
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
    var code = 'await get_events('+calendar+')';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['insert_event'] = function(block) {
    var event = Blockly.JavaScript.valueToCode(block, 'event', Blockly.JavaScript.ORDER_ATOMIC);
    var calendar = Blockly.JavaScript.valueToCode(block, 'calendar', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.JavaScript['print'] = function(block) {
    var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'var value = ' + value + ';\nwindow.alert(Array.isArray(value) ? value.join("\\n") : value);\n';
    return code;
};

Blockly.JavaScript['map'] = function(block) {
    var events = Blockly.JavaScript.valueToCode(block, 'events', Blockly.JavaScript.ORDER_ATOMIC);
    var statement = Blockly.JavaScript.statementToCode(block, 'statement');
    var code = ''+events+'.map(async function(e) {\n'+statement+'});\n';
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
    var code = 'e.'+property+'.match(/'+text+'/)';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['year'] = function(block) {
    var month = Blockly.JavaScript.valueToCode(block, 'month', Blockly.JavaScript.ORDER_ATOMIC);
    var year = block.getFieldValue('year');
    var code = 'Y' + year + 'Y'
    if(month != '')code += month;
    else code += '';
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['month'] = function(block) {
    var date = Blockly.JavaScript.valueToCode(block, 'date', Blockly.JavaScript.ORDER_ATOMIC);
    var month = block.getFieldValue('month');
    var code = month + date;
    code = 'M' + month + 'M' + date;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['date'] = function(block) {
    var date = block.getFieldValue('date');
    var code = date;
    code = 'D' + date + 'D';
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['day'] = function(block) {
    var day = block.getFieldValue('day');
    var code = day;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
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
    var code = 'insert_event('+event+', '+calendar+')\n';
    return code;
};

Blockly.Python['display'] = function(block) {
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
