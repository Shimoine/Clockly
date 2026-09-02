/**
 * 文字列(カレンダーID)から決定的に色を生成する。
 * 元 PageOfCalendar.js の hashToColor をそのまま移植。
 */
export function hashToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

export default hashToColor;