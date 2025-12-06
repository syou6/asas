# ホスティング方針（シンプル構成）

## 目的
現在の Express API ＋ Vite フロントを、最小コスト・最小改修で動かす。フロントは Vercel などの無料枠で静的配信、API は小さな常駐ホスト（VPS/低プランの PaaS）で動かす想定。

## 推奨構成
- フロント：`yarn build` した静的アセットを Vercel などで配信。
- バックエンドAPI：Express をそのまま小さな常駐ホスト（VPS/Render/Fly 等）で起動。コード改修不要、.env を置くだけ。
- Supabase：既存プロジェクト（Storage + Postgres + vector）をそのまま利用。

## バックエンドを小さなホストに載せる手順
1) 環境変数を用意（サーバーに .env を配置、コミットしない）
   - テキスト＋RAGに必要な最小キー：
     - `OPENAI_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - （任意）`SUPABASE_BUCKET=documents`（デフォルト）、`EMBED_MODEL=text-embedding-3-small`
   - 画像/音声/Exa/PDF など不要ならキーを空のままにしておけば自動で無効化。

2) ビルド
   ```bash
   yarn install
   yarn build   # フロントとサーバーをビルド（dist/ と server/dist/index.js ができる）
   ```

3) サーバー起動（プロダクション）
   ```bash
   node server/dist/index.js
   ```
   - ポートは `PORT`（未指定なら 3001）。
   - VPS なら pm2/systemd などのプロセスマネージャで常駐。

4) フロント配信
   - 例: Vercel に静的配信。API呼び出し先は常駐ホストの URL に合わせる（開発時は vite の proxy、実運用では `VITE_API_BASE` などで指定）。
   - あるいは同じVPS上で dist/ を Nginx 等で配信してもよい。

5) CORS
   - 現状は `cors()` で `*` 許可。必要に応じてフロントのオリジンに絞る。

6) Supabase 前提
   - Storage バケット `documents` が存在。
   - `rag_documents` / `rag_chunks` テーブルと `match_rag_chunks` 関数（vector(1536)）。

## コストの目安
- VPS: 月 ~$5 クラスで十分（テキスト＋RAGのみ）。
- 外部API: OpenAI 埋め込み/生成は従量課金。Gemini/Exa 等はキーを入れなければコスト発生なし。
- 重いプラグイン（音声リアルタイム、画像生成/編集、PDF要約）はキー未設定で無効にしておけば費用は出ない。

## デモと通常運用の切り替え
- 通常運用: テキスト＋RAG用のキーだけ設定。その他キーは空にしてプラグイン無効化。
- デモ時: 音声/画像/PDF など見せたい機能のキーを一時的に設定。デモ後にキーを外す。

## サーバーレスに移行したい場合
- Express をそのまま Vercel/Supabase Edge に載せることはできない。各ルートをサーバーレス関数に書き直し、アップロードサイズを 2–5MB 程度に制限、タイムアウトやコールドスタートへの対策が必要。急ぎでなければ常駐ホスト運用を推奨。

