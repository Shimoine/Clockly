export const toolboxConfig = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "カレンダ",
      colour: "300",
      custom: "CALENDAR_VARIABLE",
    },
    {
      kind: "category",
      name: "カレンダ操作",
      colour: "210",
      contents: [
        {
          kind: "block",
          type: "get_events",
          inputs: {
            calendar: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
        {
          kind: "block",
          type: "insert_event",
          inputs: {
            event: {
              shadow: { type: "dummy_value", fields: { text: "予定" } },
            },
            calendar: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
        {
          kind: "block",
          type: "insert_event2",
          inputs: {
            calendar: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
        {
          kind: "block",
          type: "delete_event",
          inputs: {
            event: {
              shadow: { type: "dummy_value", fields: { text: "予定" } },
            },
            calendar: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
      ],
    },
    {
      kind: "category",
      name: "抽出",
      colour: "180",
      contents: [
        { kind: "label", text: "抽出", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "filter",
          inputs: {
            events: {
              shadow: { type: "dummy_value", fields: { text: "予定" } },
            },
            condition: {
              shadow: { type: "dummy_value", fields: { text: "条件" } },
            },
          },
        },
        { kind: "label", text: "絞り込み", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "if",
          inputs: {
            condition: {
              shadow: { type: "dummy_value", fields: { text: "条件" } },
            },
            statement: {
              shadow: { type: "dummy_statement", fields: { text: "処理" } },
            },
          },
        },
        { kind: "label", text: "条件", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "match",
          fields: { property: "summary", text: "ここに入力" },
        },
        {
          kind: "block",
          type: "date_match",
          inputs: {
            dates: {
              shadow: { type: "dummy_value", fields: { text: "日付" } },
            },
          },
        },
        {
          kind: "block",
          type: "time_match",
          inputs: {
            time: {
              shadow: { type: "dummy_value", fields: { text: "時刻" } },
            },
          },
        },
        { kind: "label", text: "結合", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "and",
          inputs: {
            value1: {
              shadow: { type: "dummy_value", fields: { text: "条件1" } },
            },
            value2: {
              shadow: { type: "dummy_value", fields: { text: "条件2" } },
            },
          },
        },
        {
          kind: "block",
          type: "or",
          inputs: {
            value1: {
              shadow: { type: "dummy_value", fields: { text: "条件1" } },
            },
            value2: {
              shadow: { type: "dummy_value", fields: { text: "条件2" } },
            },
          },
        },
      ],
    },
    {
      kind: "category",
      name: "加工",
      colour: "240",
      contents: [
        { kind: "label", text: "写像", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "map_test",
          inputs: {
            calendar1: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
            statement: {
              shadow: { type: "dummy_statement", fields: { text: "加工処理" } },
            },
            calendar2: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
        {
          kind: "block",
          type: "map_test2",
          inputs: {
            calendar1: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
            boolean: {
              shadow: { type: "dummy_value", fields: { text: "条件" } },
            },
            statement: {
              shadow: { type: "dummy_statement", fields: { text: "加工処理" } },
            },
            calendar2: {
              shadow: { type: "dummy_value", fields: { text: "カレンダ" } },
            },
          },
        },
        { kind: "label", text: "加工", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "replace_name",
          fields: { property: "summary", text: "ここに入力" },
        },
        { kind: "block", type: "hide" },
        {
          kind: "block",
          type: "move_date",
          inputs: {
            date: {
              shadow: { type: "dummy_value", fields: { text: "日付" } },
            },
          },
        },
        {
          kind: "block",
          type: "move_time",
          inputs: {
            time: {
              shadow: { type: "dummy_value", fields: { text: "時刻" } },
            },
          },
        },
      ],
    },
    {
      kind: "category",
      name: "日付",
      colour: "120",
      contents: [
        { kind: "label", text: "日付", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "year",
          inputs: {
            month: {
              block: {
                type: "month",
                inputs: {
                  date: { block: { type: "date" } },
                },
              },
            },
          },
        },
        { kind: "block", type: "specified_year" },
        { kind: "block", type: "specified_month" },
        { kind: "block", type: "specified_week" },
        { kind: "block", type: "specified_date" },
        { kind: "block", type: "day" },
        { kind: "label", text: "時刻", "web-class": "myLabelStyle" },
        { kind: "block", type: "time" },
      ],
    },
    {
      kind: "category",
      name: "集計/表示",
      colour: "60",
      contents: [
        { kind: "label", text: "集計", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "total_hours",
          inputs: {
            events: {
              shadow: { type: "dummy_value", fields: { text: "予定" } },
            },
          },
        },
        {
          kind: "block",
          type: "total_events",
          inputs: {
            events: {
              shadow: { type: "dummy_value", fields: { text: "予定" } },
            },
          },
        },
        { kind: "label", text: "表示", "web-class": "myLabelStyle" },
        {
          kind: "block",
          type: "print",
          inputs: {
            value: {
              shadow: { type: "dummy_value", fields: { text: "データ" } },
            },
          },
        },
      ],
    },
  ],
};

export default toolboxConfig;