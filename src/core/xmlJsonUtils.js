import * as Blockly from "blockly";

/**
 * XML/JSON タブ表示用のユーティリティ。
 * 元々 PageOfMakeRule.js の handleTabSelect 内にベタ書きされていた
 * 整形ロジック（id/x/y の除去、インデント整形）をここに切り出した。
 */

// XML要素ツリーから id, x, y 属性を再帰的に削除する
export const removeIdsAndPositions = (xmlElement) => {
  if (xmlElement.nodeType === 1) {
    xmlElement.removeAttribute("id");
    xmlElement.removeAttribute("x");
    xmlElement.removeAttribute("y");
    for (const child of xmlElement.children) {
      removeIdsAndPositions(child);
    }
  }
};

// JSON(ワークスペース保存形式)から id, x, y, variables, languageVersion を再帰的に削除する
export const removeIdsAndPositionsFromJson = (jsonObj) => {
  if (typeof jsonObj === "object" && jsonObj !== null) {
    delete jsonObj.id;
    delete jsonObj.x;
    delete jsonObj.y;
    delete jsonObj.variables;
    delete jsonObj.languageVersion;

    if (Array.isArray(jsonObj)) {
      jsonObj.forEach((item) => removeIdsAndPositionsFromJson(item));
    } else {
      Object.keys(jsonObj).forEach((key) => {
        if (typeof jsonObj[key] === "object") {
          removeIdsAndPositionsFromJson(jsonObj[key]);
        }
      });
    }
  }
};

const formatNode = (node, level) => {
  const indent = "  ".repeat(level);
  let result = "";

  if (node.nodeType === 3) {
    // テキストノード
    const text = node.textContent.trim();
    return text ? text : "";
  }

  if (node.nodeType === 1) {
    // 要素ノード
    result += indent + "<" + node.nodeName;

    for (const attr of node.attributes) {
      result += ` ${attr.name}="${attr.value}"`;
    }

    if (node.childNodes.length === 0) {
      result += "/>\n";
    } else {
      const isInlineElement =
        node.nodeName === "field" || node.nodeName === "shadow";
      const hasOnlyTextChild =
        node.childNodes.length === 1 && node.childNodes[0].nodeType === 3;

      if (isInlineElement && hasOnlyTextChild) {
        result += ">" + node.textContent + "</" + node.nodeName + ">\n";
      } else {
        result += ">\n";
        for (const child of node.childNodes) {
          const childText = formatNode(child, level + 1);
          if (childText) result += childText;
        }
        result += indent + "</" + node.nodeName + ">\n";
      }
    }
  }

  return result;
};

// XML文字列をインデント付きで整形する
export const formatXml = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  return formatNode(xmlDoc.documentElement, 0);
};

/**
 * ワークスペースから「表示用」に整形済みのXMLテキストを取得する
 * (id/x/y を削除し、インデント整形済み)
 */
export const getDisplayXml = (workspace) => {
  if (!workspace) return "";
  const xml = Blockly.Xml.workspaceToDom(workspace);
  removeIdsAndPositions(xml);
  return formatXml(Blockly.Xml.domToText(xml));
};

/**
 * ワークスペースから「表示用」に整形済みのJSONテキストを取得する
 * (id/x/y/variables/languageVersion を削除)
 */
export const getDisplayJson = (workspace) => {
  if (!workspace) return "";
  const state = Blockly.serialization.workspaces.save(workspace);
  removeIdsAndPositionsFromJson(state);
  return JSON.stringify(state, null, 2);
};