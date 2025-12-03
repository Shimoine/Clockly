import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

/**
 * タブ選択時の処理を実行
 * @param {number} index - 選択されたタブのインデックス
 * @param {Object} workspace - Blocklyワークスペース
 * @param {string} blockXml - 既存のブロックXML
 * @param {Object} setters - 各state setterのオブジェクト
 */
export const handleTabSelect = (index, workspace, blockXml, setters) => {
    const { setBlockXml, setJsCode, setRbCode, setCurrentXmlText, setJsonCode } = setters;

    switch (index) {
        case 0: // Blocklyタブ
            if (workspace) {
                setBlockXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)));
            }
            break;

        case 1: // JavaScriptタブ
            if (workspace) {
                setJsCode(javascriptGenerator.workspaceToCode(workspace));
            }
            break;

        case 2: // Rubyタブ
            if (workspace) {
                setRbCode(pythonGenerator.workspaceToCode(workspace));
            }
            break;

        case 3: // XMLタブ
            const xmlText = workspace 
                ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace)) 
                : (blockXml || '');
            setCurrentXmlText(xmlText);
            break;

        case 4: // JSONタブ
            if (workspace) {
                const state = Blockly.serialization.workspaces.save(workspace);
                const hasBlocks = state.blocks && state.blocks.blocks && state.blocks.blocks.length > 0;
                
                if (!hasBlocks) {
                    setJsonCode(JSON.stringify({ 
                        message: "ブロックが配置されていません",
                        variables: state.variables || []
                    }, null, 2));
                } else {
                    setJsonCode(JSON.stringify(state, null, 2));
                }
            }
            break;

        default:
            break;
    }
};
