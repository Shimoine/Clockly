import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import express from "express";
import { deleteLibrary } from "../../src/lib/api.js";

test("ライブラリ削除APIはクライアントのリクエストを受け付け、指定した項目だけを削除する", async (t) => {
  const testDb = await mkdtemp(join(tmpdir(), "clockly-library-test-"));
  const previousDbPath = process.env.DB_PATH;
  process.env.DB_PATH = testDb;
  let server;

  try {
    const { default: libraryRoutes } = await import("./library.js");
    const app = express();
    // 本番と同じstrictモードのJSONパーサーを通して検証する。
    app.use(express.json({ limit: "10mb" }));
    app.use("/api", libraryRoutes);
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });

    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const realFetch = globalThis.fetch;
    // ブラウザ用の相対URLだけをテストサーバーへ向ける。本文は変更しない。
    t.mock.method(globalThis, "fetch", (url, options) =>
      realFetch(new URL(url, baseUrl), options),
    );
    const post = (path, body) => fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const readLibrary = async () => (await fetch("/api/get_library")).json();
    const entries = [
      { id: "keep-first", name: "先頭", blockXml: '<block type="year" />' },
      { id: "remove-middle", name: "削除対象", blockXml: '<block type="month" />' },
      { id: "keep-last", name: "末尾", blockXml: '<block type="date" />' },
    ];
    for (const entry of entries) {
      assert.equal((await post("create_library", entry)).status, 201);
    }

    const response = await deleteLibrary("remove-middle");
    assert.equal(response.status, 200);
    assert.equal((await response.json()).message, "削除に成功しました");
    const remaining = {
      id: ["keep-first", "keep-last"],
      name: ["先頭", "末尾"],
      xml: [entries[0].blockXml, entries[2].blockXml],
    };
    assert.deepEqual(await readLibrary(), remaining);

    assert.equal((await deleteLibrary("remove-middle")).status, 404);
    for (const body of [{}, { id: "" }, { id: " " }, { id: 123 }, { id: null }]) {
      assert.equal((await post("delete_library", body)).status, 400);
    }
    assert.deepEqual(await readLibrary(), remaining);
  } finally {
    t.mock.restoreAll();
    if (server?.listening) {
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
    if (previousDbPath === undefined) delete process.env.DB_PATH;
    else process.env.DB_PATH = previousDbPath;
    await rm(testDb, { recursive: true, force: true });
  }
});
