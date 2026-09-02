import { useEffect, useState } from "react";
import { getCalendarList } from "@/lib/api";

/**
 * カレンダー一覧をTTL付きメモリキャッシュで管理するフック。
 * - TTL(デフォルト5分)以内なら再フェッチせずキャッシュを返す
 * - TTL切れならバックグラウンドで静かに再フェッチ(表示はキャッシュのまま)
 * - refresh()を呼べばTTLに関係なく即時再フェッチ
 */

const TTL_MS = 5 * 60 * 1000; // 5分

let cache = null;       // キャッシュされたカレンダー一覧
let cachedAt = 0;       // キャッシュ作成時刻(ms)
let fetchPromise = null; // 並行フェッチ防止用

function isCacheExpired() {
  return Date.now() - cachedAt > TTL_MS;
}

async function fetchCalendarList() {
  if (fetchPromise) return fetchPromise;

  fetchPromise = getCalendarList()
    .then((list) => {
      cache = [...list].sort((a, b) => a.summary.localeCompare(b.summary));
      cachedAt = Date.now();
      fetchPromise = null;
      return cache;
    })
    .catch((e) => {
      fetchPromise = null;
      throw e;
    });

  return fetchPromise;
}

// キャッシュ更新を全マウント中のフックに通知するサブスクライバー
const subscribers = new Set();
function notifySubscribers(list) {
  subscribers.forEach((fn) => fn(list));
}

export function useCalendarList() {
  const [calendars, setCalendars] = useState(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // このコンポーネントをサブスクライバーに登録
    const handler = (list) => setCalendars(list);
    subscribers.add(handler);

    if (cache !== null && !isCacheExpired()) {
      // キャッシュが有効 → 即座に反映してフェッチしない
      setCalendars(cache);
      setLoading(false);
    } else if (cache !== null && isCacheExpired()) {
      // キャッシュ期限切れ → キャッシュをそのまま表示しつつバックグラウンドで更新
      setCalendars(cache);
      setLoading(false);
      fetchCalendarList()
        .then((list) => notifySubscribers(list))
        .catch((e) => console.error("カレンダー一覧の更新に失敗しました:", e));
    } else {
      // キャッシュなし → ローディング表示してフェッチ
      setLoading(true);
      fetchCalendarList()
        .then((list) => {
          setCalendars(list);
          setLoading(false);
        })
        .catch((e) => {
          console.error("カレンダー一覧の取得に失敗しました:", e);
          setError(e);
          setLoading(false);
        });
    }

    return () => {
      subscribers.delete(handler);
    };
  }, []);

  const refresh = () => {
    cache = null;
    cachedAt = 0;
    fetchPromise = null;
    setLoading(true);
    fetchCalendarList()
      .then((list) => {
        notifySubscribers(list);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  };

  return { calendars, loading, error, refresh };
}

export default useCalendarList;