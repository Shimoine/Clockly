import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

function createTooltip({ type, insertableValues = "", connectableValues = "", description }) {
    return [
        `ブロックの型: ${type}`,
        `挿入可能な型: ${insertableValues}`,
        `接続可能な型: ${connectableValues}`,
        `説明: ${description}`,
    ].join("\n");
}

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
        this.setTooltip(createTooltip({ type: "ダミー値", insertableValues: "なし", connectableValues: "なし", description: "値を表すプレースホルダである．ツールボックス内で入力欄の例を示すために使用する．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['dummy_statement'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldLabelSerializable(""), "text");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(createTooltip({ type: "ダミーステートメント", insertableValues: "なし", connectableValues:"任意",description: "処理を表すプレースホルダである．ツールボックス内で処理欄の例を示すために使用する．" }));
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
        this.setTooltip(createTooltip({ type: "カレンダ", insertableValues: "なし", connectableValues: "なし", description: "カレンダ名と内部 ID を表す．カレンダを指定する入力欄に接続して使用する．" }));
        this.setHelpUrl("");
    }
};

/* データ操作 */
Blockly.Blocks['get_events'] = {
    init: function() {
        this.appendValueInput("calendar")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("の複製した予定");
        this.setInputsInline(true);
        this.setOutput(true, "Event");
        this.setColour(0);
        this.setTooltip(createTooltip({ type: "予定", insertableValues: "カレンダ", connectableValues: "なし", description: "指定したカレンダから予定一覧の複製を取得する．取得した予定を加工しても，元の予定は変更されない．" }));
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
        this.setTooltip(createTooltip({ type: "カレンダ操作", insertableValues: "予定，カレンダ", connectableValues: "任意", description: "指定した予定を指定したカレンダに追加する．" }));
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
        this.setTooltip(createTooltip({ type: "カレンダ操作", insertableValues: "カレンダ", connectableValues: "任意", description: "指定したカレンダに予定を追加するための処理ブロックである．" }));
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
        this.setTooltip(createTooltip({ type: "カレンダ操作", insertableValues: "予定，カレンダ", connectableValues: "任意", description: "指定した予定を指定したカレンダに追加する．" }));
        this.setHelpUrl("");
    }
};

// Blockly.Blocks['update_event'] = {
//     init: function() {
//         this.appendValueInput("calendar1")
//             .setCheck("Calendar");
//         this.appendDummyInput("dummy")
//             .appendField("の予定を");
//         this.appendValueInput("calendar2")
//             .setCheck("Calendar");
//         this.appendDummyInput("dummy")
//             .appendField("に同期");
//         this.setInputsInline(true);
//         this.setPreviousStatement(true, "map");
//         this.setNextStatement(true, "map");
//         this.setColour(210);
//         this.setTooltip("ブロックの型: カレンダ操作\n入力可能なブロックの型: カレンダ\n説明: カレンダ1の予定をカレンダ2に同期（コピーまたは更新）します。複数カレンダ間での同期処理に利用します。");
//         this.setHelpUrl("");
//     },
// };

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
        this.setTooltip(createTooltip({ type: "カレンダ操作", insertableValues: "予定，カレンダ", connectableValues: "任意", description: "指定した予定を指定したカレンダから削除する．" }));
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
        this.setTooltip(createTooltip({ type: "表示", insertableValues: "任意", connectableValues: "任意", description: "指定した値を表示する．デバッグや実行結果の確認に使用する．" }));
        this.setHelpUrl("");
    }
};

/* map */
// Blockly.Blocks['map'] = {
//     init: function() {
//         this.appendValueInput("events")
//             .setCheck(["Calendar", "Event"]);
//         this.appendDummyInput()
//             .appendField("の各予定について");
//         this.appendStatementInput("statement")
//             .setCheck("map");
//         this.setInputsInline(true);
//         //this.setPreviousStatement(true, null);
//         //this.setNextStatement(true, null);
//         this.setColour(30);
//         this.setTooltip("ブロックの型: \n入力可能なブロックの型: \n説明: ");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             if (event.type === Blockly.Events.BLOCK_MOVE) {
//                 // ブロックが移動されたときのみ処理する
//                 var inputBlock = this.getInputTargetBlock('events');
//                 if (inputBlock && inputBlock.type === 'calendar') {
//                     // 接続されたブロックが calendar ブロックの場合
//                     this.addGetEventBlock(inputBlock);
//                 }
//             }
//         });
//     },

//     addGetEventBlock: function(calendarBlock) {
//         var getEventBlock = this.workspace.newBlock('get_events');
//         getEventBlock.initSvg();  // 新しいブロックを初期化
//         getEventBlock.render();  // ブロックを描画
//         calendarBlock.parentBlock_.getInput('events').connection.connect(getEventBlock.outputConnection); 
//         this.workspace.render();
//     }
// };


Blockly.Blocks['map'] = {
    init: function() {
        this.appendValueInput("calendar1")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("の予定を複製し");
        this.appendStatementInput("statement")
            .setCheck("map");
        this.setInputsInline(true);
        this.appendDummyInput()
            .appendField("を適用して");
        this.appendValueInput("calendar2")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("に追加");
        this.setColour(30);
        this.setTooltip(createTooltip({ type: "予定の加工", insertableValues: "カレンダ，加工処理", connectableValues: "なし", description: "カレンダ 1 の予定を複製し，各予定に加工処理を適用してカレンダ 2 に追加する．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['map2'] = {
    init: function() {
        this.appendValueInput("calendar1")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("の複製した予定を");
        this.appendValueInput("boolean")
            .setCheck(["Boolean","year", "month", "week", "date", "day"]);
        this.appendDummyInput()
            .appendField("で絞り込み");
        this.appendStatementInput("statement")
            .setCheck("map");
        this.setInputsInline(true);
        this.appendDummyInput()
            .appendField("を適用して");
        this.appendValueInput("calendar2")
            .setCheck("Calendar");
        this.appendDummyInput()
            .appendField("に追加");
        this.setColour(30);
        this.setTooltip(createTooltip({ type: "予定の加工", insertableValues: "カレンダ，条件，加工処理", connectableValues: "なし", description: "カレンダ 1 の予定を条件で絞り込み，各予定に加工処理を適用してカレンダ 2 に追加する．" }));
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            if (event.type === Blockly.Events.BLOCK_MOVE) {
                // ブロックが移動されたときのみ処理する
                var inputBlock = this.getInputTargetBlock('boolean');
                const validTypes = ['year', 'month', 'week', 'date', 'day', 'specified_year', 'specified_month', 'specified_week', 'specified_date'];
                if (inputBlock && validTypes.includes(inputBlock.type)) {
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(calendarBlock) {
        var getEventBlock = this.workspace.newBlock('date_match');
        getEventBlock.initSvg();  // 新しいブロックを初期化
        getEventBlock.render();  // ブロックを描画
        calendarBlock.parentBlock_.getInput('boolean').connection.connect(getEventBlock.outputConnection); 
        this.workspace.render();
    }
};

// Blockly.Blocks['map_output'] = {
//     init: function() {
//         this.appendValueInput("events")
//             .setCheck(["Calendar", "Event"]);
//         this.appendDummyInput()
//             .appendField("の各予定について");
//         this.appendStatementInput("statement")
//             .setCheck("map");
//         this.setInputsInline(true);
//         this.setOutput(true, "Event");
//         this.setColour(0);
//         this.setTooltip("");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             if (event.type === Blockly.Events.BLOCK_MOVE) {
//                 // ブロックが移動されたときのみ処理する
//                 var inputBlock = this.getInputTargetBlock('events');
//                 if (inputBlock && inputBlock.type === 'calendar') {
//                     // 接続されたブロックが calendar ブロックの場合
//                     this.addGetEventBlock(inputBlock);
//                 }
//             }
//         });
//     },

//     addGetEventBlock: function(calendarBlock) {
//         var getEventBlock = this.workspace.newBlock('get_events');
//         getEventBlock.initSvg();  // 新しいブロックを初期化
//         getEventBlock.render();  // ブロックを描画
//         calendarBlock.parentBlock_.getInput('events').connection.connect(getEventBlock.outputConnection); 
//         this.workspace.render();
//     }
// };

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
        this.setTooltip(createTooltip({ type: "予定", insertableValues: "予定，条件", connectableValues: "なし", description: "予定一覧を指定した条件で絞り込み，条件に一致する予定一覧を返す．" }));
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
        var getEventBlock = this.workspace.newBlock('get_events');
        getEventBlock.initSvg();  // 新しいブロックを初期化
        getEventBlock.render();  // ブロックを描画
        calendarBlock.parentBlock_.getInput('events').connection.connect(getEventBlock.outputConnection); 
        this.workspace.render();
    }
};

// Blockly.Blocks['filter2'] = {
//     init: function() {
//         this.appendValueInput("condition")
//             .setCheck("Boolean")
//         this.appendDummyInput()
//             .appendField("で絞り込んだ予定について");
//         this.appendStatementInput("statement")
//             .setCheck("map");
//         this.setInputsInline(true);
//         this.setPreviousStatement(true, null);
//         this.setNextStatement(true, null);
//         this.setHelpUrl("");
//         this.setColour(0);
//         this.setTooltip("ブロックの型: \n入力可能なブロックの型: \n説明: ");
//     }
// };

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
        this.setTooltip(createTooltip({ type: "プロパティの抽出", insertableValues: "予定", connectableValues: "プロパティ値", description: "予定一覧から選択したプロパティ（予定名，場所，説明）を取り出して返す．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['replace_name'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("を")
            .appendField(new Blockly.FieldTextInput("ここに入力"), "text")
            .appendField("に置き換える");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip(createTooltip({ type: "加工", insertableValues: "なし", connectableValues: "任意", description: "予定名/場所/説明の値を指定した文字列に置き換える．予定を加工する処理の中で使用する．" }));
        this.setHelpUrl("");
    }
};

// Blockly.Blocks['replace_date'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([["開始日", "start"], ["終了日", "end"]]), "property")
//             .appendField("を");
//         this.appendValueInput("dates")
//             .setCheck(["year", "month", "week", "date", "day"])
//         this.appendDummyInput()
//             .appendField("に置き換える");
//         this.setInputsInline(true);
//         this.setPreviousStatement(true, "map");
//         this.setNextStatement(true, "map");
//         this.setColour(240);
//         this.setTooltip("ブロックの型: 加工\n入力可能なブロックの型: 年, 月, 週, 日, 曜日\n説明: 予定の開始/終了日を指定した日付ブロックで指定された日付に置き換えます。");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             var inputBlock = this.getInputTargetBlock('dates');
//             if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
//                 if (inputBlock && (inputBlock.type === 'month' || inputBlock.type === 'date' || inputBlock.type === 'day')) {
//                     this.addGetEventBlock(inputBlock);
//                 }
//             }
//         });
//     },
//     addGetEventBlock: function(dateBlock) {
//         if(dateBlock.type === 'month') {
//         var getYearBlock = this.workspace.newBlock('specified_year');
//         getYearBlock.initSvg();  // 新しいブロックを初期化
//         getYearBlock.render();  // ブロックを描画
//         dateBlock.parentBlock_.getInput('dates').connection.connect(getYearBlock.outputConnection);  // year ブロックを先頭に接続
//         getYearBlock.getInput('dates').connection.connect(dateBlock.outputConnection); // month ブロックを接続
//         }
//         else if(dateBlock.type === 'date') {
//             var getMonthBlock = this.workspace.newBlock('specified_month');
//             getMonthBlock.initSvg();
//             getMonthBlock.render();
//             dateBlock.parentBlock_.getInput('dates').connection.connect(getMonthBlock.outputConnection);
//             getMonthBlock.getInput('dates').connection.connect(dateBlock.outputConnection);
//         }
//         else if(dateBlock.type === 'day') {
//             var getWeekBlock = this.workspace.newBlock('specified_week');
//             getWeekBlock.initSvg();
//             getWeekBlock.render();
//             dateBlock.parentBlock_.getInput('dates').connection.connect(getWeekBlock.outputConnection);
//             getWeekBlock.getInput('dates').connection.connect(dateBlock.outputConnection);
//         }
//         this.workspace.render();
//     }
// };

// Blockly.Blocks['replace_time'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([["開始時刻","start"], ["終了時刻","end"]]), "property")
//             .appendField("を")
//         this.appendValueInput("time")
//             .setCheck("time")
//         this.appendDummyInput()
//             .appendField("に置き換える");
//         this.setInputsInline(true);
//         this.setPreviousStatement(true, "map");
//         this.setNextStatement(true, "map");
//         this.setColour(240);
//         this.setTooltip("ブロックの型: 加工\n入力可能なブロックの型: 時刻\n説明: 予定の開始/終了時刻を指定した時刻ブロックの値に置き換えます。");
//         this.setHelpUrl("");
//     }
// };

// Blockly.Blocks['replace_map'] = {
//     init: function() {
//         this.appendValueInput("events")
//             .setCheck(["Calendar", "Event"]);
//         this.appendDummyInput()
//             .appendField("の")
//             .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
//             .appendField("を")
//             .appendField(new Blockly.FieldTextInput(""), "text")
//             .appendField("に置き換えた予定");
//         this.setInputsInline(true);
//         this.setOutput(true, "Event");
//         this.setColour(240);
//         this.setTooltip("ブロックの型: \n入力可能なブロックの型: \n説明: ");
//         this.setHelpUrl("");
//     }
// };

Blockly.Blocks['hide'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("を隠す");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip(createTooltip({ type: "加工", insertableValues: "なし", connectableValues: "任意", description: "予定名/場所/説明を隠す．予定名を隠した場合は「予定」に置き換える．その他は空欄にして共有する．予定を加工する処理の中で使用する．" }));
        this.setHelpUrl("");
    }
};

// Blockly.Blocks['hide_test'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
//             .appendField("を隠して");
//         this.appendValueInput("calendar")
//             .setCheck("Calendar");
//         this.appendDummyInput()
//             .appendField("に追加");
//         this.setInputsInline(true);
//         this.setPreviousStatement(true, "map");
//         this.setNextStatement(true, "map");
//         this.setColour(240);
//         this.setTooltip("ブロックの型: \n入力可能なブロックの型: \n説明: ");
//         this.setHelpUrl("");
//     }
// };

Blockly.Blocks['move_date'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck(["year", "month", "date", "day", "specified_year", "specified_month", "specified_week", "specified_date"])
        this.appendDummyInput()
            .appendField("に日付を移す");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip(createTooltip({ type: "加工", insertableValues: "年，月，日，曜日",connectableValues: "任意", description: "予定の開始日時と終了日時の日付を，指定した日付へ変更する．予定を加工する処理の中で使用する．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['move_time'] = {
    init: function() {
        this.appendValueInput("time")
            .setCheck("time")
        this.appendDummyInput()
            .appendField("に時刻を移す");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "map");
        this.setNextStatement(true, "map");
        this.setColour(240);
        this.setTooltip(createTooltip({ type: "加工", insertableValues: "時刻", connectableValues: "任意",description: "予定の開始時刻と終了時刻を，指定した時刻へ変更する．予定を加工する処理の中で使用する．" }));
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
        this.setTooltip(createTooltip({ type: "条件分岐", insertableValues: "条件，任意の処理", connectableValues: "任意", description: "条件が真である場合に，内部の処理を実行する．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['and'] = {
    init: function() {
        this.appendValueInput("value1")
            .setCheck("Boolean");
        this.appendValueInput("value2")
            .setCheck(["Boolean", "day", "date", "week", "month", "year"])
            .appendField("かつ");
        this.setInputsInline(false);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip(createTooltip({ type: "条件", insertableValues: "条件", connectableValues: "なし", description: "二つの条件を論理積で結合し，真偽値を返す．" }));
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
        this.setTooltip(createTooltip({ type: "条件", insertableValues: "条件", connectableValues: "なし", description: "二つの条件を論理和で結合し，真偽値を返す．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['match'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
            .appendField("に")
            .appendField(new Blockly.FieldTextInput("ここに入力"), "text")
            .appendField("が含まれる")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip(createTooltip({ type: "条件", insertableValues: "なし", connectableValues: "なし", description: "選択したプロパティ（予定名，場所，説明）に指定したテキストが含まれるかを部分一致で判定する．" }));
        this.setHelpUrl("");
    }
};

// Blockly.Blocks['match2'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([["予定名","summary"], ["場所","location"], ["説明","description"]]), "property")
//             .appendField("が")
//             .appendField(new Blockly.FieldTextInput(""), "text")
//             .appendField("である")
//         this.setInputsInline(true);
//         this.setOutput(true, "Boolean");
//         this.setColour(180);
//         this.setTooltip("ブロックの型: \n入力可能なブロックの型: \n説明: ");
//         this.setHelpUrl("");
//     }
// };

Blockly.Blocks['date_match'] = {
    init: function() {
        this.appendValueInput("dates")
            .setCheck([
                "year", "month", "week", "date", "day",
                "specified_year", "specified_month", "specified_week", "specified_date"
            ])
            .appendField(new Blockly.FieldDropdown([["開始日","start"], ["終了日","end"]]), "property")
            .appendField("が");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["である","=="], ["含む以降",">="], ["含む以前","<="]]), "operator")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip(createTooltip({ type: "条件", insertableValues: "年，月，週，日，曜日", connectableValues: "なし", description: "予定の開始日または終了日が，指定した日付と条件を満たすか判定する．" }));
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            var inputBlock = this.getInputTargetBlock('dates');
            var dropdown = this.getField('operator');
            if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
                if (inputBlock) {
                    var monthBlock = inputBlock.getInputTargetBlock('month');
                    var dateBlock = monthBlock ? monthBlock.getInputTargetBlock('date') : null;
                    
                    switch (inputBlock.type) {
                        case 'year':
                            if (monthBlock && dateBlock) {
                                dropdown.menuGenerator_ = [["である", "=="], ["含む以降", ">="], ["含む以前", "<="]];
                            }else {
                                dropdown.menuGenerator_ = [["である", "=="]];
                                dropdown.setValue("==");
                            }
                            break;
                        case 'specified_year':
                            if (monthBlock && dateBlock) {
                                dropdown.menuGenerator_ = [["である", "=="], ["含む以降", ">="], ["含む以前", "<="]];
                            }else {
                                dropdown.menuGenerator_ = [["である", "=="]];
                                dropdown.setValue("==");
                            }
                            break;
                        case 'specified_month':
                            if (dateBlock) {
                                dropdown.menuGenerator_ = [["である", "=="], ["含む以降", ">="], ["含む以前", "<="]];
                            }else {
                                dropdown.menuGenerator_ = [["である", "=="]];
                                dropdown.setValue("==");
                            }
                            break;
                        case 'specified_date':
                            dropdown.menuGenerator_ = [["である", "=="], ["含む以降", ">="], ["含む以前", "<="]];
                            break;
                        default:
                            dropdown.menuGenerator_ = [["である", "=="]];
                            dropdown.setValue("==");
                            break;
                    }
                }
                this.workspace.render();
                if (inputBlock && (inputBlock.type === 'month' || inputBlock.type === 'date' || inputBlock.type === 'day')) {
                    this.addGetEventBlock(inputBlock);
                }
            }
        });
    },

    addGetEventBlock: function(dateBlock) {
        if(dateBlock.type === 'month') {
        var getYearBlock = this.workspace.newBlock('specified_year');
        getYearBlock.initSvg();  // 新しいブロックを初期化
        getYearBlock.render();  // ブロックを描画
        dateBlock.parentBlock_.getInput('dates').connection.connect(getYearBlock.outputConnection);  // year ブロックを先頭に接続
        getYearBlock.getInput('dates').connection.connect(dateBlock.outputConnection); // month ブロックを接続
        }
        else if(dateBlock.type === 'date') {
            var getMonthBlock = this.workspace.newBlock('specified_month');
            getMonthBlock.initSvg();
            getMonthBlock.render();
            dateBlock.parentBlock_.getInput('dates').connection.connect(getMonthBlock.outputConnection);
            getMonthBlock.getInput('dates').connection.connect(dateBlock.outputConnection);
        }
        else if(dateBlock.type === 'day') {
            var getWeekBlock = this.workspace.newBlock('specified_week');
            getWeekBlock.initSvg();
            getWeekBlock.render();
            dateBlock.parentBlock_.getInput('dates').connection.connect(getWeekBlock.outputConnection);
            getWeekBlock.getInput('dates').connection.connect(dateBlock.outputConnection);
        }
        this.workspace.render();
    }
};

Blockly.Blocks['time_match'] = {
    init: function() {
        this.appendValueInput("time")
            .setCheck("time")
            .appendField(new Blockly.FieldDropdown([["開始時刻","start"], ["終了時刻","end"]]), "property")
            .appendField("が");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([["である","=="], ["含む以降",">="], ["含む以前","<="]]), "operator")
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour(180);
        this.setTooltip(createTooltip({ type: "条件", insertableValues: "時刻", connectableValues: "真偽値", description: "予定の開始時刻または終了時刻が，指定した時刻と条件を満たすか判定する．" }));
        this.setHelpUrl("");
    }
};

/* 日付関連 */
// Blockly.Blocks['year'] = {
//     init: function() {
//         this.appendValueInput("month")
//             .setCheck("month")
//             .appendField(new Blockly.FieldNumber(2025, 1970, Infinity, 1), "year")
//             .appendField("年");
//         this.setInputsInline(false);
//         this.setOutput(true, "year");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（年）\n入力可能なブロックの型: 月\n説明: 年を指定するブロックです。必要に応じて月ブロックを接続して日付を構成します。");
//         this.setHelpUrl("");
//     }
// };

// Blockly.Blocks['month'] = {
//     init: function() {
//         this.appendValueInput("date")
//             .setCheck(["date", "day"])
//             .appendField(new Blockly.FieldDropdown([
//                 ["1月","1"], ["2月","2"], ["3月","3"], ["4月","4"], ["5月","5"], ["6月","6"], 
//                 ["7月","7"], ["8月","8"], ["9月","9"], ["10月","10"], ["11月","11"], ["12月","12"]
//             ]), "month");
//         this.setInputsInline(false);
//         this.setOutput(true, "month");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（月）\n入力可能なブロックの型: 日, 曜日\n説明: 月を指定するブロックです。必要に応じて日や曜日ブロックを接続します。");
//         this.setHelpUrl("");
//     }
// };

// Blockly.Blocks['date'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldNumber(1, 1, 31, 1), "date")
//             .appendField("日");
//         this.setInputsInline(false);
//         this.setOutput(true, "date");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（日）\n入力可能なブロックの型: \n説明: 日（1〜31）を指定するブロックです。日付指定に使用します。");
//         this.setHelpUrl("");
//     }
// };

// Blockly.Blocks['day'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([
//                 ["日曜日","0"], ["月曜日","1"], ["火曜日","2"], ["水曜日","3"], ["木曜日","4"], ["金曜日","5"], ["土曜日","6"]
//             ]), "day");
//         this.setInputsInline(false);
//         this.setOutput(true, "day");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（曜日）\n入力可能なブロックの型: \n説明: 曜日を指定するブロックです（0=日曜〜6=土曜）。");
//         this.setHelpUrl("");
//     }
// };

// Blockly.Blocks['specified_year'] = {
//     init: function() {
//         this.appendValueInput("month")
//             .setCheck("month")
//             .appendField(new Blockly.FieldDropdown([
//                 ["今年","this_year"], ["来年","next_year"], ["去年","last_year"]
//             ]), "year");
//         this.setInputsInline(false);
//         this.setOutput(true, "year");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（年・相対）\n入力可能なブロックの型: 月\n説明: 今年／来年／去年などの相対的な年を指定するブロックです。接続により表現が変わります。");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             var monthConnection = this.getInputTargetBlock('month');
//             var dropdown = this.getField('year');
//             if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
//                 if (monthConnection) {
//                 // monthブロックが接続されている場合のドロップダウン変更
//                     dropdown.menuGenerator_ = [
//                         ["今年の","this_year"], ["来年の","next_year"], ["去年の","last_year"]
//                     ];
//                 } else {
//                 // 何も接続されていない場合のドロップダウン内容
//                     dropdown.menuGenerator_ = [
//                         ["今年","this_year"], ["来年","next_year"], ["去年","last_year"]
//                     ];
//                 }
//                 dropdown.setValue(dropdown.getValue());
//                 this.workspace.render();  // ワークスペースを再描画
//                 // Blockly.Events.enable();
//             }
//         });
//     }
// };

// Blockly.Blocks['specified_month'] = {
//     init: function() {
//         this.appendValueInput("date")
//             .setCheck(["date", "day"])
//             .appendField(new Blockly.FieldDropdown([
//                 ["今月","this_month"], ["来月","next_month"], ["先月","last_month"]
//             ]), "month");
//         this.setInputsInline(false);
//         this.setOutput(true, "month");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（月・相対）\n入力可能なブロックの型: 日, 曜日\n説明: 今月／来月／先月などの相対的な月を指定するブロックです。接続により表現が変わります。");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             var dateConnection = this.getInputTargetBlock('date');
//             var dropdown = this.getField('month');
//             if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
//                 if (dateConnection) {
//                 // dateブロックが接続されている場合のドロップダウン変更
//                     dropdown.menuGenerator_ = [
//                         ["今月の","this_month"], ["来月の","next_month"], ["先月の","last_month"]
//                     ];
//                 } else {
//                 // 何も接続されていない場合のドロップダウン内容
//                     dropdown.menuGenerator_ = [
//                         ["今月","this_month"], ["来月","next_month"], ["先月","last_month"]
//                     ];
//                 }
//                 dropdown.setValue(dropdown.getValue());
//                 this.workspace.render();  // ワークスペースを再描画
//                 // Blockly.Events.enable();
//             }
//         });
//     }
// };

// Blockly.Blocks['specified_week'] = {
//     init: function() {
//         this.appendValueInput("day")
//             .setCheck("day")
//             .appendField(new Blockly.FieldDropdown([
//                 ["今週","this_week"], ["来週","next_week"], ["先週","last_week"]
//             ]), "week");
//         this.setInputsInline(false);
//         this.setOutput(true, "week");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（週・相対）\n入力可能なブロックの型: 曜日\n説明: 今週／来週／先週などの相対的な週を指定するブロックです。接続により表現が変わります。");
//         this.setHelpUrl("");
//         this.setOnChange(function(event) {
//             var dayConnection = this.getInputTargetBlock('day');
//             var dropdown = this.getField('week');
//             if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
//                 if (dayConnection) {
//                 // monthブロックが接続されている場合のドロップダウン変更
//                     dropdown.menuGenerator_ = [
//                         ["今週の","this_week"], ["来週の","next_week"], ["先週の","last_week"]
//                     ];
//                 } else {
//                 // 何も接続されていない場合のドロップダウン内容
//                     dropdown.menuGenerator_ = [
//                         ["今週","this_week"], ["来週","next_week"], ["先週","last_week"]
//                     ];
//                 }
//                 dropdown.setValue(dropdown.getValue());
//                 this.workspace.render();  // ワークスペースを再描画
//                 // Blockly.Events.enable();
//             }
//         });
//     }
// };

// Blockly.Blocks['specified_date'] = {
//     init: function() {
//         this.appendDummyInput()
//             .appendField(new Blockly.FieldDropdown([
//                 ["今日","today"], ["明日","tomorrow"], ["昨日","yesterday"]
//             ]), "date");
//         this.setInputsInline(false);
//         this.setOutput(true, "date");
//         this.setColour(120);
//         this.setTooltip("ブロックの型: 日付（相対日）\n入力可能なブロックの型: \n説明: 今日／明日／昨日などの相対日を表すブロックです。" );
//         this.setHelpUrl("");
//     }
// };

/* 日付ブロック */
Blockly.Blocks['year'] = {
    init: function() {
        this.appendValueInput("month")
            .setCheck(["month"])
            .appendField(new Blockly.FieldNumber(2025, 1970, Infinity, 1), "year")
            .appendField("年");
        this.setInputsInline(false);
        this.setOutput(true, "year");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "年", insertableValues: "なし", connectableValues: "月", description: "西暦を表す．月を接続すると年月を表せる．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['month'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck(["date", "day"])
            .appendField(new Blockly.FieldDropdown([
                ["1月","1"], ["2月","2"], ["3月","3"], ["4月","4"], ["5月","5"], ["6月","6"],
                ["7月","7"], ["8月","8"], ["9月","9"], ["10月","10"], ["11月","11"], ["12月","12"]
            ]), "month");
        this.setInputsInline(false);
        this.setOutput(true, "month");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "月", insertableValues: "なし", connectableValues: "日，曜日", description: "月を表す．日または曜日を接続すると，月内の日付または曜日を表せる．" }));
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
        this.setTooltip(createTooltip({ type: "日", insertableValues: "なし", connectableValues: "なし", description: "月の日付を表す．" }));
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
        this.setTooltip(createTooltip({ type: "曜日",insertableValues: "なし", connectableValues: "なし", description: "曜日を表す．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['specified_year'] = {
    init: function() {
        this.appendValueInput("month")
            .setCheck(["month"])
            .appendField(new Blockly.FieldDropdown([
                ["今年","this_year"], ["来年","next_year"], ["去年","last_year"]
            ]), "year");
        this.setInputsInline(false);
        this.setOutput(true, "specified_year");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "年", insertableValues: "なし", connectableValues: "月", description: "今年，来年，または去年を表す．月を接続すると年月を表せる．" }));
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            var monthConnection = this.getInputTargetBlock('month');
            var dropdown = this.getField('year');
            if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
                if (monthConnection) {
                    dropdown.menuGenerator_ = [
                        ["今年の","this_year"], ["来年の","next_year"], ["去年の","last_year"]
                    ];
                } else {
                    dropdown.menuGenerator_ = [
                        ["今年","this_year"], ["来年","next_year"], ["去年","last_year"]
                    ];
                }
                dropdown.setValue(dropdown.getValue());
                this.workspace.render();
            }
        });
    }
};

Blockly.Blocks['specified_month'] = {
    init: function() {
        this.appendValueInput("date")
            .setCheck(["date", "day"])
            .appendField(new Blockly.FieldDropdown([
                ["今月","this_month"], ["来月","next_month"], ["先月","last_month"]
            ]), "month");
        this.setInputsInline(false);
        this.setOutput(true, "specified_month");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "月", insertableValues: "なし", connectableValues: "日，曜日", description: "今月，来月，または先月を表す．日または曜日を接続できる．" }));
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            var dateConnection = this.getInputTargetBlock('date');
            var dropdown = this.getField('month');
            if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
                if (dateConnection) {
                    dropdown.menuGenerator_ = [
                        ["今月の","this_month"], ["来月の","next_month"], ["先月の","last_month"]
                    ];
                } else {
                    dropdown.menuGenerator_ = [
                        ["今月","this_month"], ["来月","next_month"], ["先月","last_month"]
                    ];
                }
                dropdown.setValue(dropdown.getValue());
                this.workspace.render();
            }
        });
    }
};

Blockly.Blocks['specified_week'] = {
    init: function() {
        this.appendValueInput("day")
            .setCheck(["day"])
            .appendField(new Blockly.FieldDropdown([
                ["今週","this_week"], ["来週","next_week"], ["先週","last_week"]
            ]), "week");
        this.setInputsInline(false);
        this.setOutput(true, "specified_week");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "週", insertableValues: "なし", connectableValues: "曜日", description: "今週，来週，または先週を表す．曜日を接続できる．" }));
        this.setHelpUrl("");
        this.setOnChange(function(event) {
            var dayConnection = this.getInputTargetBlock('day');
            var dropdown = this.getField('week');
            if (event.type === Blockly.Events.BLOCK_MOVE || event.type === Blockly.Events.BLOCK_CHANGE) {
                if (dayConnection) {
                    dropdown.menuGenerator_ = [
                        ["今週の","this_week"], ["来週の","next_week"], ["先週の","last_week"]
                    ];
                } else {
                    dropdown.menuGenerator_ = [
                        ["今週","this_week"], ["来週","next_week"], ["先週","last_week"]
                    ];
                }
                dropdown.setValue(dropdown.getValue());
                this.workspace.render();
            }
        });
    }
};

Blockly.Blocks['specified_date'] = {
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["今日","today"], ["明日","tomorrow"], ["昨日","yesterday"]
            ]), "date");
        this.setInputsInline(false);
        this.setOutput(true, "specified_date");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "日", insertableValues: "なし", connectableValues: "なし", description: "今日，明日，または昨日を表す．" }));
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
        this.setOutput(true, "time");
        this.setColour(120);
        this.setTooltip(createTooltip({ type: "時刻", insertableValues: "なし", connectableValues: "なし", description: "時刻（時，分）を表す．予定の開始時刻または終了時刻の条件・変更に使用する．" }));
        this.setHelpUrl("");
    }
};

Blockly.Blocks['total_hours'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Event", "Calendar"]);
        this.appendDummyInput()
            .appendField("の合計時間");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(60);
        this.setTooltip(createTooltip({ type: "集計", insertableValues: "予定", connectableValues: "なし", description: "指定した予定一覧の合計時間を時間単位で返す．" }));
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
        var getEventBlock = this.workspace.newBlock('get_events');
        getEventBlock.initSvg();  // 新しいブロックを初期化
        getEventBlock.render();  // ブロックを描画
        calendarBlock.parentBlock_.getInput('events').connection.connect(getEventBlock.outputConnection); 
        this.workspace.render();
    }
};

Blockly.Blocks['total_events'] = {
    init: function() {
        this.appendValueInput("events")
            .setCheck(["Event", "Calendar"]);
        this.appendDummyInput()
            .appendField("の予定数の合計");
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour(60);
        this.setTooltip(createTooltip({ type: "集計", insertableValues: "予定", connectableValues: "なし", description: "指定した予定一覧の件数を返す．" }));
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
        var getEventBlock = this.workspace.newBlock('get_events');
        getEventBlock.initSvg();  // 新しいブロックを初期化
        getEventBlock.render();  // ブロックを描画
        calendarBlock.parentBlock_.getInput('events').connection.connect(getEventBlock.outputConnection); 
        this.workspace.render();
    }
};

// Blockly.Blocks['text'] = {
//     init: function(){
//         this.appendDummyInput()
//             .appendField("”")
//             .appendField(new Blockly.FieldTextInput("ここに入力"), "text")
//             .appendField("”")
//         this.setInputsInline(true);
//         this.setOutput(true, "Text");
//         this.setColour(60);
//         this.setTooltip("ブロックの型: 値（テキスト）\n入力可能なブロックの型: \n説明: テキストリテラルを表すブロックです。文字列を入力して使用します。");
//         this.setHelpUrl("");
//     }
// }

/* JavaScript */

javascriptGenerator.forBlock['dummy_value'] = function() {
    var code ="";
    return code;
};

javascriptGenerator.forBlock['dummy_statement'] = function() {
    var code ="";
    return code;
};

javascriptGenerator.forBlock['calendar'] = function(block) {
    var calendar_id = block.getFieldValue('id');
    var code = "'" + calendar_id + "'";
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['get_events'] = function(block) {
    var calendar = javascriptGenerator.valueToCode(block, 'calendar', javascriptGenerator.ORDER_ATOMIC);
    var code = 'await get_events('+calendar+')';
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['insert_event'] = function(block) {
    var event = javascriptGenerator.valueToCode(block, 'event', javascriptGenerator.ORDER_ATOMIC);
    var calendar = javascriptGenerator.valueToCode(block, 'calendar', javascriptGenerator.ORDER_ATOMIC);
    if(event === '') event = 'e';
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

javascriptGenerator.forBlock['insert_event2'] = function(block) {
    var event = javascriptGenerator.valueToCode(block, 'event', javascriptGenerator.ORDER_ATOMIC);
    var calendar = javascriptGenerator.valueToCode(block, 'calendar', javascriptGenerator.ORDER_ATOMIC);
    if(event === '') event = 'e';
    var code = 'await insert_event('+event+', '+calendar+')\n';
    return code;
};

javascriptGenerator.forBlock['update_event'] = function(block) {
    var calendar1 = javascriptGenerator.valueToCode(block, 'calendar1', javascriptGenerator.ORDER_NONE);
    var calendar2 = javascriptGenerator.valueToCode(block, 'calendar2', javascriptGenerator.ORDER_NONE);
    var code = 'await update_event(get_events('+calendar1+'), get_events('+calendar2+'),'+calendar2+')\n';
    return code;
};

javascriptGenerator.forBlock['delete_event'] = function(block) {
    var event = javascriptGenerator.valueToCode(block, 'event', javascriptGenerator.ORDER_ATOMIC);
    var calendar = javascriptGenerator.valueToCode(block, 'calendar', javascriptGenerator.ORDER_ATOMIC);
    if(event === '') event = 'e';
    var code = 'await delete_event('+event+', '+calendar+')\n';
    return code;
};

javascriptGenerator.forBlock['print'] = function(block) {
    var value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC);
    //var code = 'var value = ' + value + ';\nwindow.alert(Array.isArray(value) ? value.map( function(e) { if(typeof e === "object")}).join("\\n") : value);\n';
    var code = 'print(' + value + ');\n';
    return code;
};

javascriptGenerator.forBlock['test_print'] = function() {
    // var event = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    //var code = 'var value = ' + value + ';\nwindow.alert(Array.isArray(value) ? value.map( function(e) { if(typeof e === "object")}).join("\\n") : value);\n';
    var code = 'test_print(e);\n';
    return code;
};

// javascriptGenerator.forBlock['map'] = function(block) {
//     var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
//     var statement = javascriptGenerator.statementToCode(block, 'statement');
//     var code = ''+events+'.map(async function(e) {\n'+statement+'});\n';
//     return code;
// };

javascriptGenerator.forBlock['map'] = function(block) {
    var calendar1 = javascriptGenerator.valueToCode(block, 'calendar1', javascriptGenerator.ORDER_ATOMIC);
    var calendar2= javascriptGenerator.valueToCode(block, 'calendar2', javascriptGenerator.ORDER_ATOMIC);
    var statement = javascriptGenerator.statementToCode(block, 'statement');
    var code = 'var events = await get_events('+calendar1+')\nvar map_events=[];\nevents.forEach((e) => {\n'+statement+'  map_events.push(e);\n})\nawait insert_event(map_events, '+calendar2+')\n';
    return code;
};

javascriptGenerator.forBlock['map2'] = function(block) {
    var calendar1 = javascriptGenerator.valueToCode(block, 'calendar1', javascriptGenerator.ORDER_ATOMIC);
    var calendar2= javascriptGenerator.valueToCode(block, 'calendar2', javascriptGenerator.ORDER_ATOMIC);
    var condition = javascriptGenerator.valueToCode(block, 'boolean', javascriptGenerator.ORDER_ATOMIC);
    var statement = javascriptGenerator.statementToCode(block, 'statement');
    var code = 'var events = await get_events('+calendar1+')\nvar map_events=[];\nevents.forEach((e) => {\n if('+condition+'){\n '+statement+'   map_events.push(e);\n }\n})\nawait insert_event(map_events, '+calendar2+')\n';
    return code;
};

javascriptGenerator.forBlock['map_output_test'] = function(block) {
    var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    var statement = javascriptGenerator.statementToCode(block, 'statement');
    var code = ''+events+'.map(async function(e) {\n' + statement + '\nreturn e;});\n';
    return code;
};


javascriptGenerator.forBlock['filter'] = function(block) {
    var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    var condition = javascriptGenerator.valueToCode(block, 'condition', javascriptGenerator.ORDER_ATOMIC);
    var code = '( function(events){\n  var filtered_events=[];\n  events.forEach((e) => {if('+condition+')filtered_events.push(e);})\n  return filtered_events;\n})('+events+')';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['property'] = function(block) {
    var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    var property = block.getFieldValue('property');
    var code = events + '.map(function(e) {return e.'+property + '})';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['replace_name'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+'="'+text+'";\n';
    return code;
};

javascriptGenerator.forBlock['replace_date'] = function(block) {
    var property = block.getFieldValue('property');
    var dates = block.getFieldValue('dates');
    
    var code = 'e.'+property+'= normalize_date(' + dates + ').start;\n';
    return code;
};

javascriptGenerator.forBlock['replace_time'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('time');
    var code = 'e.'+property+'='+text+';\n';
    return code;
};

javascriptGenerator.forBlock['hide'] = function(block) {
    var property = block.getFieldValue('property');
    var code;
    if(property === 'summary') {
        code = 'e.'+property+'="予定";\n';
    }else {
        code = 'e.'+property+'="";\n';
    }
    return code;
};

javascriptGenerator.forBlock['hide_test'] = function(block) {
    var property = block.getFieldValue('property');
    var calendar = javascriptGenerator.valueToCode(block, 'calendar', javascriptGenerator.ORDER_ATOMIC);
    var code;
    if(property === 'summary') {
        code = 'e.'+property+'="予定";\n';
    }else {
        code = 'e.'+property+'="";\n';
    }
    code += 'await insert_event(e,'+ calendar +');\n';
    return code;
};

javascriptGenerator.forBlock['move_date'] = function(block) {
    var date = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC);
    var code = 'move(e.start.date, normalize_date("' + date + '"));'
    return code;
};

javascriptGenerator.forBlock['move_time'] = function(block) {
    var time = javascriptGenerator.valueToCode(block, 'time', javascriptGenerator.ORDER_ATOMIC);
    var code = 'move(e.start.time, ' + time + ');'
    return code;
};

javascriptGenerator.forBlock['if'] = function(block) {
    var condition = javascriptGenerator.valueToCode(block, 'condition', javascriptGenerator.ORDER_ATOMIC);
    var statement = javascriptGenerator.statementToCode(block, 'statement');
    var code = 'if( ' + condition + ' ){\n' + statement + '}\n';
    return code;
};

javascriptGenerator.forBlock['and'] = function(block) {
    var value1 = javascriptGenerator.valueToCode(block, 'value1', javascriptGenerator.ORDER_ATOMIC);
    var value2 = javascriptGenerator.valueToCode(block, 'value2', javascriptGenerator.ORDER_ATOMIC);
    var code = ''+value1+' && '+value2+'';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['or'] = function(block) {
    var value1 = javascriptGenerator.valueToCode(block, 'value1', javascriptGenerator.ORDER_ATOMIC);
    var value2 = javascriptGenerator.valueToCode(block, 'value2', javascriptGenerator.ORDER_ATOMIC);
    var code = ''+value1+' || '+value2+'';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['match'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+' && e.'+property+'.match(/'+text+'/)';
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['match2'] = function(block) {
    var property = block.getFieldValue('property');
    var text = block.getFieldValue('text');
    var code = 'e.'+property+' == "'+text+'"';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['time_match'] = function(block) {
    var property = block.getFieldValue('property');
    var operator = block.getFieldValue('operator');
    var time = javascriptGenerator.valueToCode(block, 'time', javascriptGenerator.ORDER_ATOMIC);
    var code = 'time_match(e.'+property+', "'+time+'", "'+operator+'")';
    return [code, javascriptGenerator.ORDER_NONE];
}

javascriptGenerator.forBlock['date_match'] = function(block) {
    var property = block.getFieldValue('property');
    var operator = block.getFieldValue('operator');
    var dates = javascriptGenerator.valueToCode(block, 'dates', javascriptGenerator.ORDER_ATOMIC);
    var code = 'date_match(e.' + property + ', normalize_date(' + dates + '), "' + operator + '")';
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

// javascriptGenerator.forBlock['year'] = function(block) {
//     var year = block.getFieldValue('year');
//     var month = javascriptGenerator.valueToCode(block, 'month', javascriptGenerator.ORDER_ATOMIC) || null;
//     var code = 'Y' +year;
//     if(month) {
//         code = code + month;
//     }
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// };

// javascriptGenerator.forBlock['month'] = function(block) {
//     var month = block.getFieldValue('month');
//     var date = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC) || null;
//     var day = javascriptGenerator.valueToCode(block, 'day', javascriptGenerator.ORDER_ATOMIC) || null;
//     var code = 'M' + (month.length === 1 ? '0' + month : month);
//     if(date) {
//         code = code + date;
//     }else if(day) {
//         code = code + day;
//     }
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// };

// javascriptGenerator.forBlock['date'] = function(block) {
//     var date = block.getFieldValue('date').toString();
//     var code = 'D' + (date.length === 1 ? '0' + date : date);
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// };

// javascriptGenerator.forBlock['day'] = function(block) {
//     var day = block.getFieldValue('day');
//     var code = 'DAY' + day;
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// };

// javascriptGenerator.forBlock['specified_year'] = function(block) {
//     var year = block.getFieldValue('year');
//     var month = javascriptGenerator.valueToCode(block, 'month', javascriptGenerator.ORDER_ATOMIC) || null;
//     var code = 'Y' + year;
//     if(month) {
//         code = code + month;
//     }
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// }

// javascriptGenerator.forBlock['specified_month'] = function(block) {
//     var month = block.getFieldValue('month');
//     var date = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC) || '';
//     var code = 'M' + month;
//     if(date) {
//         code = code + date;
//     }
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// }

// javascriptGenerator.forBlock['specified_week'] = function(block) {
//     var week = block.getFieldValue('week');
//     var day = javascriptGenerator.valueToCode(block, 'day', javascriptGenerator.ORDER_ATOMIC) || null;
//     var code = 'W' + week;
//     if(day) {
//         code = code + day;
//     }
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// }

// javascriptGenerator.forBlock['specified_date'] = function(block) {
//     var date = block.getFieldValue('date');
//     var code = 'D'+ date;
//     return [code, javascriptGenerator.ORDER_ATOMIC];
// }

javascriptGenerator.forBlock['year'] = function(block) {
    var year = Number(block.getFieldValue('year'));
    var monthCode = javascriptGenerator.valueToCode(block, 'month', javascriptGenerator.ORDER_ATOMIC) || null;
    var code = monthCode
        ? `({ type: "year", year: ${year}, month: ${monthCode} })`
        : `({ type: "year", year: ${year} })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['month'] = function(block) {
    var month = Number(block.getFieldValue('month'));
    var dateCode = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC) || null;
    var props = [`type: "month"`, `month: ${month}`];
    if (dateCode) props.push(`date: ${dateCode}`);
    var code = `({ ${props.join(', ')} })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['date'] = function(block) {
    var date = Number(block.getFieldValue('date'));
    var code = `({ type: "date", day: ${date} })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['day'] = function(block) {
    var day = Number(block.getFieldValue('day'));
    var code = `({ type: "day", weekday: ${day} })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['specified_year'] = function(block) {
    var year = block.getFieldValue('year');
    var monthCode = javascriptGenerator.valueToCode(block, 'month', javascriptGenerator.ORDER_ATOMIC) || null;
    var code = monthCode
        ? `({ type: "relative_year", unit: "${year}", month: ${monthCode} })`
        : `({ type: "relative_year", unit: "${year}" })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['specified_month'] = function(block) {
    var month = block.getFieldValue('month');
    var dateCode = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC) || null;
    var code = dateCode
        ? `({ type: "relative_month", unit: "${month}", date: ${dateCode} })`
        : `({ type: "relative_month", unit: "${month}" })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['specified_week'] = function(block) {
    var week = block.getFieldValue('week');
    var dayCode = javascriptGenerator.valueToCode(block, 'day', javascriptGenerator.ORDER_ATOMIC) || null;
    var code = dayCode
        ? `({ type: "relative_week", unit: "${week}", day: ${dayCode} })`
        : `({ type: "relative_week", unit: "${week}" })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['specified_date'] = function(block) {
    var date = block.getFieldValue('date');
    var code = `({ type: "relative_date", unit: "${date}" })`;
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['time'] = function(block) {
    var hour = block.getFieldValue('hour');
    var minute = block.getFieldValue('minute');
    var code = Number(hour) * 60 + Number(minute);
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['total_hours'] = function(block) {
    var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    var code = ''+events+'.map(e => {return(parseInt(new Date(e.end.date_time) - new Date(e.start.date_time)))}).reduce((prev,curr) => {return prev+curr;})/3600000 + "時間"';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['total_events'] = function(block) {
    var events = javascriptGenerator.valueToCode(block, 'events', javascriptGenerator.ORDER_ATOMIC);
    var code = '' + events + '.length + "件"';
    return [code, javascriptGenerator.ORDER_NONE];
};

javascriptGenerator.forBlock['text'] = function(block) {
    var text = javascriptGenerator.valueToCode(block, 'text', javascriptGenerator.ORDER_ATOMIC);
    var code = text;
    return [code, javascriptGenerator.ORDER_NONE];
};
