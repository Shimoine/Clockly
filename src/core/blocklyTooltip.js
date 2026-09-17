import * as Blockly from "blockly";

const TOOLTIP_CLASS = "clockly-block-tooltip";

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function parseTooltip(text) {
  const type = text.match(/^ブロックの型:\s*(.+)$/m)?.[1]?.trim();
  const insertableValues = text.match(/^挿入可能な(?:値|型):\s*(.*)$/m)?.[1]?.trim();
  const connectableValues = text.match(/^接続可能な(?:値|型):\s*(.*)$/m)?.[1]?.trim();
  const description = text.match(/^説明:\s*([\s\S]+)$/m)?.[1]?.trim();
  return { type, insertableValues, connectableValues, description };
}

function appendValueSection(content, label, values) {
  const section = createElement("div", "clockly-block-tooltip__values");
  section.appendChild(createElement("span", "clockly-block-tooltip__value-label", label));
  const chips = createElement("div", "clockly-block-tooltip__chips");
  const items = values?.split(/[,，]/).map((value) => value.trim()).filter(Boolean) ?? [];

  if (items.length === 0) {
    chips.appendChild(createElement("span", "clockly-block-tooltip__chip clockly-block-tooltip__chip--empty", "なし"));
  } else {
    items.forEach((value) => chips.appendChild(createElement("span", "clockly-block-tooltip__chip", value)));
  }

  section.appendChild(chips);
  content.appendChild(section);
}

function renderTooltip(tooltip, element) {
  // 編集領域の overflow:hidden でカードが切れないよう、ツールチップだけを
  // ページ直下に配置する。Blockly は描画後、この親を基準に座標を計算する。
  // setParentContainer はドロップダウンにも影響するため変更しない。
  document.body.appendChild(tooltip);
  tooltip.classList.add(TOOLTIP_CLASS);
  tooltip.replaceChildren();
  const text = Blockly.Tooltip.getTooltipOfObject(element)?.trim();
  if (!text) return;

  const content = createElement("div", "clockly-block-tooltip__content");
  tooltip.appendChild(content);
  const { type, insertableValues, connectableValues, description } = parseTooltip(text);
  if (!type && !insertableValues && !connectableValues && !description) {
    content.appendChild(createElement("p", "clockly-block-tooltip__description", text));
    return;
  }

  if (type) {
    const header = createElement("div", "clockly-block-tooltip__header");
    header.appendChild(createElement("span", "clockly-block-tooltip__eyebrow", "ブロックの型"));
    header.appendChild(createElement("strong", "clockly-block-tooltip__type", type));
    content.appendChild(header);
  }
  if (description) content.appendChild(createElement("p", "clockly-block-tooltip__description", description));

  appendValueSection(content, "挿入可能な型", insertableValues);
  appendValueSection(content, "接続可能な型", connectableValues);
}

/**
 * アプリ起動時に一度登録する。ツールボックスやプレビューも同じ描画を使い、
 * 表示位置・ホバー判定・操作中の非表示は Blockly に任せる。
 */
export function registerBlocklyTooltip() {
  Blockly.Tooltip.setCustomTooltip(renderTooltip);
}
