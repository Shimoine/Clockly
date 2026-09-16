import * as Blockly from "blockly";

const TOOLTIP_CLASS = "clockly-block-tooltip";
const TOOLTIP_OFFSET = 14;
const VIEWPORT_PADDING = 12;
const HOVER_DELAY_MS = 1500;

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

function renderTooltip(tooltip, block) {
  const text = Blockly.Tooltip.getTooltipOfObject(block)?.trim();
  if (!text) return false;

  tooltip.replaceChildren();
  const { type, insertableValues, connectableValues, description } = parseTooltip(text);
  if (!type && !insertableValues && !connectableValues && !description) {
    tooltip.appendChild(createElement("p", "clockly-block-tooltip__description", text));
    return true;
  }

  const content = createElement("div", "clockly-block-tooltip__content");
  if (type) {
    const header = createElement("div", "clockly-block-tooltip__header");
    header.appendChild(createElement("span", "clockly-block-tooltip__eyebrow", "ブロックの型"));
    header.appendChild(createElement("strong", "clockly-block-tooltip__type", type));
    content.appendChild(header);
  }
  if (description) content.appendChild(createElement("p", "clockly-block-tooltip__description", description));

  appendValueSection(content, "挿入可能な型", insertableValues);
  appendValueSection(content, "接続可能な型", connectableValues);
  tooltip.appendChild(content);
  return true;
}

/** Blockly の内部ポップアップを変更せず、ホバー時だけ説明カードを表示する。 */
export function createBlocklyTooltip(container, workspace) {
  const tooltip = createElement("div", TOOLTIP_CLASS);
  tooltip.hidden = true;
  tooltip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tooltip);

  let activeBlock = null;
  let hoveredBlock = null;
  let showTimer = null;
  let lastPointerPosition = null;

  const cancelShow = () => {
    if (showTimer) window.clearTimeout(showTimer);
    showTimer = null;
  };

  const hide = () => {
    cancelShow();
    activeBlock = null;
    hoveredBlock = null;
    tooltip.hidden = true;
    tooltip.style.visibility = "hidden";
  };

  const position = (event) => {
    if (tooltip.hidden) return;

    let left = event.clientX + TOOLTIP_OFFSET;
    let top = event.clientY + TOOLTIP_OFFSET;
    const { width, height } = tooltip.getBoundingClientRect();
    left = Math.min(left, window.innerWidth - width - VIEWPORT_PADDING);
    top = Math.min(top, window.innerHeight - height - VIEWPORT_PADDING);
    tooltip.style.left = `${Math.max(VIEWPORT_PADDING, left)}px`;
    tooltip.style.top = `${Math.max(VIEWPORT_PADDING, top)}px`;
    tooltip.style.visibility = "visible";
  };

  const getBlockFromEvent = (event) => {
    const blockElement = event.target.closest?.(".blocklyBlock");
    const blockId = blockElement?.getAttribute("data-id");
    if (!blockId) return null;

    // flyout (ツールボックス) はメインとは別ワークスペースなので、SVGを
    // 起点にブロックを保持しているワークスペースを特定する。
    const blockWorkspace = [workspace, ...Blockly.common.getAllWorkspaces()]
      .find((candidate) => candidate.rendered && candidate.getParentSvg()?.contains(blockElement));
    const block = blockWorkspace?.getBlockById(blockId);
    return block && !block.isShadow() ? block : null;
  };

  const show = (event) => {
    const block = getBlockFromEvent(event);
    if (!block) {
      hide();
      return;
    }

    lastPointerPosition = { clientX: event.clientX, clientY: event.clientY };
    if (activeBlock === block) {
      position(lastPointerPosition);
      return;
    }

    if (hoveredBlock === block) return;

    cancelShow();
    activeBlock = null;
    hoveredBlock = block;
    tooltip.hidden = true;
    tooltip.style.visibility = "hidden";

    showTimer = window.setTimeout(() => {
      if (!hoveredBlock || hoveredBlock.isShadow()) return;

      activeBlock = hoveredBlock;
      tooltip.hidden = !renderTooltip(tooltip, hoveredBlock);
      position(lastPointerPosition);
      showTimer = null;
    }, HOVER_DELAY_MS);
  };

  const handlePointerOut = (event) => {
    const leavingBlock = event.target.closest?.(".blocklyBlock");
    const enteringBlock = event.relatedTarget?.closest?.(".blocklyBlock");
    if (leavingBlock !== enteringBlock) hide();
  };

  container.addEventListener("pointerover", show);
  container.addEventListener("pointermove", show);
  container.addEventListener("pointerout", handlePointerOut);

  return () => {
    cancelShow();
    container.removeEventListener("pointerover", show);
    container.removeEventListener("pointermove", show);
    container.removeEventListener("pointerout", handlePointerOut);
    tooltip.remove();
  };
}
