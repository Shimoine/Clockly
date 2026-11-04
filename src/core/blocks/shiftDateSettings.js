import * as Blockly from 'blockly';

const MODE_OPTIONS = [
    ['N回目の曜日', 'nth_weekday'],
    ['第N週の曜日（日曜始まり）', 'month_grid_position'],
    ['日にち', 'day_of_month'],
];

// 既存のXML/JSONとフィールド変更履歴を維持するための、表示しない設定値。
export class ShiftDateModeField extends Blockly.FieldDropdown {
    constructor() {
        super(MODE_OPTIONS);
        this.EDITABLE = false;
    }

    getText() {
        // 折りたたみ時の要約や読み上げにも方式名を混ぜない。
        return '';
    }

    initView() {
        super.initView();
        this.setVisible(false);
    }

    setVisible() {
        super.setVisible(false);
        const root = this.getSvgRoot();
        if (root) root.style.display = 'none';
    }
}

function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
}

// 標準の歯車の描画を利用し、ミニワークスペースの代わりに設定カードを開く。
export class ShiftDateSettingsIcon extends Blockly.icons.MutatorIcon {
    constructor(block) {
        super([], block);
        this.panel = null;
        this.closePanel = () => this.hideSettings();
        this.setTooltip('日付移動の設定');
    }

    getAriaLabel() {
        return '日付移動の設定';
    }

    dispose() {
        this.hideSettings();
        super.dispose();
    }

    bubbleIsVisible() {
        return !!this.panel;
    }

    hideSettings() {
        const panel = this.panel;
        if (!panel) return;
        this.panel = null;
        const restoreFocus = panel.contains(document.activeElement);
        if (panel.matches(':popover-open')) panel.hidePopover();
        panel.remove();
        window.removeEventListener('resize', this.closePanel);
        if (restoreFocus) this.getFocusableElement().focus();
    }

    async setBubbleVisible(visible) {
        const field = this.sourceBlock.getField('mode');
        if (!visible) {
            this.hideSettings();
            return;
        }
        if (this.panel) return;

        Blockly.DropDownDiv.hideWithoutAnimation();
        const panel = element('section', 'clockly-date-settings');
        panel.popover = 'auto';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', '日付移動の設定');
        panel.append(
            element('h2', 'clockly-date-settings__title', '月・年の動かし方'),
            element('p', 'clockly-date-settings__intro', '「か月」「年」で動かすときの基準です。'),
        );

        const choices = element('fieldset', 'clockly-date-settings__choices');
        choices.append(element('legend', 'clockly-date-settings__legend', '移動方法を選択'));
        const examples = [
            {
                value: 'nth_weekday',
                title: '月内でN回目の曜日を保つ',
                detail: '第5がない月は、最後の同じ曜日へ。',
                result: '10月6日（第1火曜日）',
            },
            {
                value: 'month_grid_position',
                title: 'カレンダーの第N週・曜日を保つ',
                detail: '日曜始まり。前後の月に出る場合があります。',
                result: '9月29日（10月の第1週の火曜日）',
            },
            {
                value: 'day_of_month',
                title: '日にちを保つ',
                detail: '同じ日がない月は、その月の末日へ。',
                result: '10月1日',
            },
        ];
        for (const option of examples) {
            const label = element('label', 'clockly-date-settings__option');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `shift-date-mode-${this.sourceBlock.id}`;
            radio.value = option.value;
            radio.checked = field.getValue() === option.value;
            radio.setAttribute('aria-label', option.title);
            radio.addEventListener('change', () => {
                if (radio.checked) field.setValue(option.value);
            });
            const text = element('span', 'clockly-date-settings__option-text');
            text.append(
                element('strong', 'clockly-date-settings__option-title', option.title),
                element('span', 'clockly-date-settings__detail', option.detail),
                element('span', 'clockly-date-settings__result', `移動先：${option.result}`),
            );
            label.append(radio, text);
            choices.append(label);
        }
        panel.append(
            element('p', 'clockly-date-settings__example', '例：2026年9月1日（火）を1か月後へ'),
            choices,
        );
        const footer = element('div', 'clockly-date-settings__footer');
        footer.append(element('span', ''));
        const done = element('button', 'clockly-date-settings__done', '完了');
        done.type = 'button';
        done.addEventListener('click', this.closePanel);
        footer.append(done);
        panel.append(footer);
        panel.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                this.hideSettings();
            }
        });
        panel.addEventListener('toggle', (event) => {
            if (event.newState === 'closed' && this.panel === panel) this.hideSettings();
        });
        this.panel = panel;
        // 歯車の pointerup が外側クリックとして処理されてから開く。
        await new Promise(requestAnimationFrame);
        if (this.panel !== panel) return;

        // top layerに表示し、Blocklyや親レイアウトのoverflow:hiddenで切られないようにする。
        document.body.append(panel);
        panel.showPopover();
        const anchor = this.getFocusableElement().getBoundingClientRect();
        const { width, height } = panel.getBoundingClientRect();
        const left = Math.min(window.innerWidth - width - 16, Math.max(16, anchor.left - width / 2));
        const top = anchor.bottom + height + 12 <= window.innerHeight - 16
            ? anchor.bottom + 12
            : Math.max(16, anchor.top - height - 12);
        panel.style.left = `${left}px`;
        panel.style.top = `${top}px`;
        window.addEventListener('resize', this.closePanel);
        panel.querySelector('input:checked').focus();
    }
}
