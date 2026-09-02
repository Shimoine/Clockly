/**
 * Blockly で定義されている全ブロックを XML 形式で出力する
 * 複数選択肢フィールドは options 属性として埋め込む
 * 各ブロックの直前に comment コメントを挿入
 * 改行・余分な空白を含まない安定出力版
 */
export function generateAllBlocksXml(Blockly, workspace) {
    const blockTypes = Object.keys(Blockly.Blocks || {}).sort();

    const skipBlocks = [
        'variables_get_dynamic', 'variables_set_dynamic', 'variables_get', 'variables_set',
        'text_join', 'text_charAt', 'text_prompt', 'math_number_property', 'math_on_list',
        'controls_for', 'controls_forEach', 'controls_flow_statements', 'controls_if',
        'logic_compare', 'logic_ternary', 'procedures_defnoreturn', 'procedures_defreturn',
        'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn',
        'lists_create_with', 'lists_repeat', 'lists_indexOf', 'lists_getIndex',
        'lists_setIndex', 'lists_getSublist', 'lists_split', 'lists_sort', 'text'
    ];

    const skipPrefixes = [
        'variables_', 'procedures_', 'controls_', 'logic_', 'math_', 'text_', 'lists_', 'colour_'
    ];

    const escapeXml = (str) =>
        String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

    // 改行・タブ・連続空白の除去
    const normalize = (s) =>
        String(s || '')
            .replace(/\s+/g, ' ')
            .trim();

    let xml = '<!--全ブロック一覧--><xml id="all_blocks">';
    const problematicBlocks = new Set();

    for (const type of blockTypes) {
        if (!type || typeof type !== 'string') continue;
        if (skipBlocks.includes(type)) continue;
        if (skipPrefixes.some(p => type.startsWith(p))) continue;
        if (problematicBlocks.has(type)) continue;

        let comment = '';

        try {
            const def = Blockly.Blocks[type];
            if (!def || typeof def.init !== 'function') continue;

            const initSrc = def.init.toString();
            const problematicKeywords = [
                'QUOTE_IMAGE', 'quoteField_', 'newQuote_',
                'QUOTE_IMAGE_LEFT_DATAURI', 'QUOTE_IMAGE_RIGHT_DATAURI',
                'mixin', 'quoteField'
            ];

            if (problematicKeywords.some(kw => initSrc.includes(kw))) {
                problematicBlocks.add(type);
                if (typeof def.tooltip === 'string') comment = def.tooltip;
                continue;
            }

            let block;
            try {
                block = workspace.newBlock(type);
            } catch {
                problematicBlocks.add(type);
                if (typeof def.tooltip === 'string') comment = def.tooltip;
                continue;
            }

            // tooltip取得
            if (block.tooltip) {
                comment = typeof block.tooltip === 'function'
                    ? block.tooltip()
                    : block.tooltip;
            }

            const fields = [];
            const values = [];

            for (const input of block.inputList || []) {
                if ([Blockly.INPUT_VALUE, Blockly.NEXT_STATEMENT].includes(input.type)) {
                    values.push(`<value name="${escapeXml(input.name || '')}"></value>`);
                }

                for (const field of input.fieldRow || []) {
                    const fname = field.name;
                    if (!fname) continue;

                    // ドロップダウン
                    if (field instanceof Blockly.FieldDropdown) {
                        const options = field.getOptions();
                        const optionStr = options
                            .map(opt => normalize(String(opt[1])))
                            .join('|');

                        let current = '';
                        if (typeof field.getValue === 'function') {
                            current = normalize(field.getValue());
                        }

                        fields.push(
                            `<field name="${escapeXml(fname)}" options="${escapeXml(optionStr)}">${escapeXml(current)}</field>`
                        );
                    }
                    // 通常フィールド
                    else {
                        let fval = '';
                        if (typeof field.getValue === 'function') fval = field.getValue();
                        else if (typeof field.getText === 'function') fval = field.getText();

                        fields.push(
                            `<field name="${escapeXml(fname)}">${escapeXml(normalize(fval))}</field>`
                        );
                    }
                }
            }

            // コメント出力（改行なし）
            const safeComment = escapeXml(
                normalize(comment).replace(/--/g, '- -')
            );

            if (safeComment) {
                xml += `<!--${safeComment}-->`;
            }

            xml += `<block type="${escapeXml(type)}">`;
            xml += fields.join('');
            xml += values.join('');
            xml += `</block>`;

            block.dispose();
        } catch {
            problematicBlocks.add(type);
            continue;
        }
    }

    xml += '</xml>';
    return xml;
}

export default generateAllBlocksXml;