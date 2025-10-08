/**
 * Blockly で定義されている全ブロックを XML 形式で出力する
 * 各ブロックの直前に tooltip コメントを挿入
 * 
 * @param {Object} Blockly - Blockly のグローバルオブジェクト
 * @param {Object} workspace - Blockly.Workspace インスタンス
 * @returns {string} XML 文字列
 */
export function generateAllBlocksXml(Blockly, workspace) {
	const blockTypes = Object.keys(Blockly.Blocks || {}).sort();

	// 出力対象外のブロック
	const skipBlocks = [
		'variables_get_dynamic', 'variables_set_dynamic', 'variables_get', 'variables_set',
		'text_join', 'text_charAt', 'text_prompt', 'math_number_property', 'math_on_list',
		'controls_for', 'controls_forEach', 'controls_flow_statements', 'controls_if',
		'logic_compare', 'logic_ternary', 'procedures_defnoreturn', 'procedures_defreturn',
		'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn',
		'lists_create_with', 'lists_repeat', 'lists_indexOf', 'lists_getIndex',
		'lists_setIndex', 'lists_getSublist', 'lists_split', 'lists_sort', 'text'
	];

	// プレフィックスで除外するブロック
	const skipPrefixes = [
		'variables_', 'procedures_', 'controls_', 'logic_', 'math_', 'text_', 'lists_', 'colour_'
	];

	// XMLエスケープヘルパー
	const escapeXml = (str) =>
		String(str || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;');

	let xml = '<!-- 全ブロック一覧（各ブロックのXMLの上の行に解説コメント付き） -->\n<xml id="all_blocks">';
	const problematicBlocks = new Set();

	for (const type of blockTypes) {
		// 無効・スキップ対象の型は除外
		if (!type || typeof type !== 'string') continue;
		if (skipBlocks.includes(type)) continue;
		if (skipPrefixes.some(p => type.startsWith(p))) continue;
		if (problematicBlocks.has(type)) continue;

		let tooltip = '';
		const blockXmlParts = { fields: [], values: [] };

		try {
			const def = Blockly.Blocks[type];
			if (!def || typeof def.init !== 'function') continue;

			// 問題を起こす初期化関数を検出してスキップ
			const initSrc = def.init.toString();
			const problematicKeywords = [
				'QUOTE_IMAGE', 'quoteField_', 'newQuote_',
				'QUOTE_IMAGE_LEFT_DATAURI', 'QUOTE_IMAGE_RIGHT_DATAURI',
				'mixin', 'quoteField'
			];
			if (problematicKeywords.some(kw => initSrc.includes(kw))) {
				problematicBlocks.add(type);
				if (typeof def.tooltip === 'string') tooltip = def.tooltip;
				continue;
			}

			// ブロックを生成
			let block;
			try {
				block = workspace.newBlock(type);
			} catch {
				problematicBlocks.add(type);
				if (typeof def.tooltip === 'string') tooltip = def.tooltip;
				continue;
			}

			// tooltip取得
			if (block.tooltip) {
				tooltip = typeof block.tooltip === 'function' ? block.tooltip() : block.tooltip;
			}

			// blockToDom によるフィールド取得
			let fieldEls = [];
			try {
				if (Blockly.Xml?.blockToDom) {
					const dom = Blockly.Xml.blockToDom(block);
					fieldEls = Array.from(dom?.getElementsByTagName('field') || []);
				}
			} catch {}

			const addedFieldNames = new Set();

			// blockToDom で取得できたフィールド
			for (const el of fieldEls) {
				const fname = el.getAttribute('name');
				const fval = String(el.textContent || '').trim();
				if (fname) {
					blockXmlParts.fields.push(`<field name="${escapeXml(fname)}">${escapeXml(fval)}</field>`);
					addedFieldNames.add(fname);
				}
			}

			// blockToDomで取れなかった場合は inputList と fields_ から抽出
			if (blockXmlParts.fields.length === 0) {
				for (const input of block.inputList || []) {
					for (const field of input.fieldRow || []) {
						const fname = field.name;
						if (!fname || addedFieldNames.has(fname)) continue;
						let fval = '';
						if (typeof field.getValue === 'function') fval = field.getValue();
						else if (typeof field.getText === 'function') fval = field.getText();
						fval = String(fval || '').trim();
						blockXmlParts.fields.push(`<field name="${escapeXml(fname)}">${escapeXml(fval)}</field>`);
						addedFieldNames.add(fname);
					}
				}

				for (const fname of Object.keys(block.fields_ || {})) {
					if (addedFieldNames.has(fname)) continue;
					const field = block.fields_[fname];
					let fval = '';
					if (typeof field.getValue === 'function') fval = field.getValue();
					else if (typeof field.getText === 'function') fval = field.getText();
					fval = String(fval || '').trim();
					blockXmlParts.fields.push(`<field name="${escapeXml(fname)}">${escapeXml(fval)}</field>`);
				}
			}

			// value 入力を補完
			for (const input of block.inputList || []) {
				if ([Blockly.INPUT_VALUE, Blockly.NEXT_STATEMENT].includes(input.type)) {
					const inputName = input.name || '';
					blockXmlParts.values.push(`<value name="${escapeXml(inputName)}"></value>`);
				}
			}

			block.dispose();
		} catch {
			problematicBlocks.add(type);
			continue;
		}

		// コメントとブロックXMLを追加
		const safeTooltip = escapeXml(String(tooltip || '').replace(/--/g, '- -').trim());
		if (safeTooltip) xml += `\n  <!-- ${safeTooltip} -->`;

		xml += `\n  <block type="${escapeXml(type)}">`;
		if (blockXmlParts.fields.length > 0)
			xml += '\n    ' + blockXmlParts.fields.join('\n    ');
		if (blockXmlParts.values.length > 0)
			xml += '\n    ' + blockXmlParts.values.join('\n    ');
		xml += `\n  </block>`;
	}

	xml += '\n</xml>';
	return xml;
}

export default generateAllBlocksXml;