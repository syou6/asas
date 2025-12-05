# MulmoChat x Supabase RAG 統合設計（詳細版）

目的: MulmoChat のマルチモーダル体験を維持しつつ、自社ドキュメントを取り込み RAG で回答できるようにする。実装先は MulmoChat (Vue + Vite + Express, `misc/mulmochat`) とし、`chatgpt-your-files` の Supabase/pgvector/関数ロジックを参照・移植する。

## 1. 目標と制約
- 目標: MulmoChat フロントからドキュメントをアップロード→埋め込み生成→検索→コンテキスト付与で回答。上位コンテキストを UI 表示。
- 制約: MulmoChat は AGPL-3.0。`chatgpt-your-files` はライセンス未記載（商用で混ぜる場合は確認が必要）。
- 現状 MulmoChat は認証なし。Supabase Auth を導入するか、当面 service role で単一テナント運用かを決める必要あり。

## 2. リポ概要（確認済み）
- MulmoChat (`misc/mulmochat`):  
  - サーバー: Express/TS (`server/index.ts`, ルータ `server/routes/*.ts`)、テキスト生成 API は `server/routes/textLLM.ts` → `server/llm/*`.  
  - フロント: Vue 3 (`src/App.vue`, `src/components/Sidebar.vue` など)。アップロード用フックは Sidebar の `uploadFiles` emit。
- chatgpt-your-files (`misc/chatgpt-your-files`):  
  - Supabase スキーマ/関数: `supabase/migrations/*.sql`, `supabase/functions/{process,embed,chat}`。  
  - Next.js フロントでの RAG フロー: `app/files/page.tsx` (Storage へ upload → trigger)、`app/chat/page.tsx` (ブラウザ内で `Supabase/gte-small` で embedding を作成し、Edge Function `functions/v1/chat` へ送信)。

## 3. chatgpt-your-files の RAG フロー（参照元の挙動）
- ストレージ: bucket `files`。ポリシーはユーザ単位。トリガー `on_file_upload` で `private.handle_storage_update()` 実行（`20231006192603_files.sql`, `20231006212813_documents.sql`）。  
  - 挙動: Storage insert → `documents` へメタ行追加 → Edge Function `/functions/v1/process` 呼び出し。
- ドキュメント分割: Edge Function `supabase/functions/process/index.ts` が Storage から markdown を取得し、`_lib/markdown-parser.ts` で heading 切り・長文分割し `document_sections` に insert。
- 埋め込み生成: `document_sections` の insert トリガー `private.embed(...)` (`20231007002735_embed.sql`) が Edge Function `/functions/v1/embed` をバッチ呼び出しし、Supabase AI Session `gte-small` で 384 次元ベクトルを計算し `embedding` 列に保存。
- 類似検索: RPC `match_document_sections(embedding vector(384), match_threshold float)` (`20231007040908_match.sql`) が inner product <#> でソート。Edge Function `functions/chat` が `match_threshold=0.8`, `limit 5` で取得。
- 推論: `functions/chat/index.ts` が OpenAI `gpt-3.5-turbo-0125` でコンテキストをインライン注入し、StreamingTextResponse を返す。

## 4. 提案アーキテクチャ（MulmoChat 側での統合）
- データ基盤: Supabase Storage + Postgres/pgvector を利用。embedding 次元は 384 (gte-small) で開始。将来 OpenAI embedding に切り替える場合はベクトル列の次元変更が必要。
- 認証: PoC では service role key + 単一テナントでも可。将来は Supabase Auth を MulmoChat に組み込み、`user_id` で RLS を効かせる。
- サーバー: MulmoChat の Express に「ドキュメント API」と「RAG 付きテキスト生成」を追加。embedding/検索はサーバーで実行（フロントでの embedding 計算を省く）。
- フロント: MulmoChat UI に「Documents」ビューを追加し、アップロード／一覧／削除／チャット時のコンテキスト表示を行う。

## 5. API 設計（MulmoChat サーバー追加分）
### 5.1 ドキュメント管理
- `POST /api/docs/upload` (multipart/form-data)  
  - 入力: `file`、任意 `userId`、`title`。  
  - 処理: サイズ/拡張子バリデーション → Supabase Storage `documents` バケットへ保存 → テキスト抽出 (md/txt/pdf から本文) → チャンク分割 → OpenAI embedding もしくは Supabase AI embedding 生成 → `documents` / `chunks` テーブルへ insert。  
  - 出力: `{ id, title, sizeBytes, createdAt, chunkCount }`
- `GET /api/docs` (query: userId?) → ドキュメント一覧 + chunk 件数。
- `DELETE /api/docs/:id` → DB 行 + Storage を削除（cascade 確認）。

### 5.2 RAG 付きチャット
- `POST /api/chat/rag`  
  - 入力: `{ messages, docIds?: string[], topK?: number, matchThreshold?: number }`  
  - 処理: docIds 指定時はそのドキュメントに限定し、なければ全件検索。`topK` デフォルト 5。`matchThreshold` デフォルト 0.8。  
  - ベクトル検索: Supabase RPC `match_document_sections` 相当を Node 実装するか、PostgREST RPC を叩く。  
  - モデル呼び出し: 既存 `generateText` (provider/model 可変) を流用し、先頭に system プロンプト + コンテキストを挿入。  
  - 出力: `{ result, context: [{content, docId, score}] }`
- 既存 `/api/text/generate` への追加オプション: `ragContext` を受け取り、server 側で messages に追加する拡張もあり（既存 UI への影響が少ない）。

## 6. バックエンド実装タスク（ファイル指針）
- 新規モジュール（案）:  
  - `server/rag/supabaseClient.ts`: Supabase service client (fetch ベースでも可)。  
  - `server/rag/storage.ts`: Storage へのアップロード/削除。  
  - `server/rag/chunk.ts`: テキスト抽出 + チャンク分割（Markdown は `markdown-parser.ts` 移植、PDF は後回しでも可）。  
  - `server/rag/embedding.ts`: OpenAI embedding 呼び出し（`text-embedding-3-small`）、もしくは Supabase AI エンドポイント呼び出し。  
  - `server/rag/search.ts`: ベクトル検索 (supabase rpc or http postgrest) とスコア計算。  
  - `server/routes/docs.ts`: 上記 API のルータ。  
  - `server/routes/ragChat.ts`: RAG 付きチャット API ルータ。
- 既存に触る箇所: `server/routes/api.ts` で新ルータを mount。`server/llm/types.ts` に RAG オプションを追加する場合は型も拡張。

## 7. フロント実装タスク（Vue, `src/`）
- 新ビュー/コンポーネント: `src/components/DocumentsPanel.vue`（アップロードフォーム + 一覧 + 削除 + 進捗）。  
  - Sidebar にタブ/ボタン追加（`src/components/Sidebar.vue` の upload/emits 周辺）。  
  - アップロード結果は API 経由で取得し、チャット画面と共有。
- チャット画面拡張:  
  - 「使用ドキュメント選択」UI（チェックボックス/タグ）。  
  - API レスポンスの `context` を表示（スニペット + スコア表示）。  
  - 「RAG 無効化」トグルを追加。
- 状態管理: 既存の composable (`useUserPreferences`) に doc 選択や RAG 有効フラグを保存する拡張を検討。

### 実装済みメモ（このブランチ）
- API: `/api/docs` (GET/POST/DELETE) と `/api/rag/chat` を追加。OpenAI embeddings → Supabase `rag_documents`/`rag_chunks` に保存し、RPC `match_rag_chunks` で検索。
- フロント: ツールバーに Docs ボタン（DocumentsPanel オーバーレイ）と RAG トグルを追加。RAG トグル ON のとき、テキスト送信は `/api/rag/chat` に送り、結果をサイドバーに表示。会話履歴は前回の user/assistant メッセージを保持。

## 8. 環境変数と設定
- `.env` (サーバー):  
  - `SUPABASE_URL`  
  - `SUPABASE_SERVICE_ROLE_KEY`（server only）  
  - `SUPABASE_BUCKET=documents`（新規バケット名、既存 `files` を流用でも可）  
  - `OPENAI_API_KEY`（既存）  
  - `EMBED_MODEL=text-embedding-3-small` または `SUPABASE_EMBED_MODEL=gte-small`  
  - `RAG_TOP_K=5`, `RAG_MATCH_THRESHOLD=0.8` (デフォルト用)
- Supabase 側: Storage バケット作成、migrations 適用（次セクション参照）。

## 9. スキーマ/マイグレーション方針
- そのまま流用する場合: `chatgpt-your-files/supabase/migrations` を Supabase に適用。embedding 列は vector(384)。  
- MulmoChat サーバーで完結させたい場合: 同等スキーマを自前で作成し、`documents` と `document_sections` を利用（ユーザ識別キーを text/uuid で持つ）。  
- RLS: PoC で service role 固定なら一旦無効化/緩和。将来 Auth を入れる場合は `created_by` / `user_id` を使った RLS を有効化。

### Supabase 用シンプルスキーマ（本実装で参照するテーブル/関数）
`server/routes/docs.ts` と `server/routes/ragChat.ts` は以下スキーマを前提にしています（ベクトル次元は OpenAI `text-embedding-3-small` の 1536 に合わせています）。

```sql
-- enable
create extension if not exists vector with schema public;

create table if not exists rag_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  path text not null,
  size_bytes bigint not null,
  user_id text not null default 'anonymous',
  created_at timestamptz not null default now()
);

create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references rag_documents(id) on delete cascade,
  content text not null,
  embedding vector(1536) not null,
  chunk_index int not null,
  created_at timestamptz not null default now()
);

create or replace function match_rag_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.8,
  doc_ids uuid[] default null
) returns table (
  chunk_id uuid,
  document_id uuid,
  content text,
  similarity float,
  document_title text
) language plpgsql as $$
begin
  return query
  select
    c.id as chunk_id,
    c.document_id,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity,
    d.title as document_title
  from rag_chunks c
  join rag_documents d on d.id = c.document_id
  where (doc_ids is null or c.document_id = any(doc_ids))
    and (1 - (c.embedding <=> query_embedding)) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

必要に応じて RLS を追加し、service role キーのみからの利用に限定してください。

## 10. ステップバイステップ作業（実行チェックリスト）
1) Supabase: migrations 適用（上記ファイル）と bucket 作成。  
2) MulmoChat サーバーに Supabase クライアント層を追加 (`server/rag/supabaseClient.ts`)。  
3) テキスト抽出/チャンク/embedding ユーティリティ作成 (`server/rag/markdown.ts`, `server/rag/embedding.ts`)。  
4) ドキュメント API ルータ追加 (`server/routes/docs.ts`)、`server/routes/api.ts` に mount。  
5) RAG 検索/チャット API 追加 (`server/routes/ragChat.ts`)、`generateText` 呼び出し前にコンテキスト注入。  
6) フロント Documents 画面とチャット拡張を追加、API 呼び出し実装。  
7) .env サンプル/README 更新。  
8) 動作確認: ローカル Supabase で md をアップロード → chunk/embedding 生成 → チャットでコンテキストが挿入されることを確認。  
9) テスト: chunk/embedding の単体、RAG API の統合 (Supabase テスト用 DB で topK 検証)。

## 11. テスト計画
- サーバー:  
  - チャンク分割: 入力 markdown を分割し、空チャンクなしを確認。  
  - ベクトル検索: 擬似ベクトルで類似検索が topK 件返ること。  
  - API: `/api/docs/upload` → DB/Storage に反映、`/api/chat/rag` でコンテキストが返ること。
- フロント:  
  - アップロード UI のバリデーションとエラー表示。  
  - RAG トグルが off のときに通常チャットにフォールバックすること。  
  - コンテキスト表示がレスポンスと同期すること。

## 12. 未決事項（要決定）
- 認証: Supabase Auth を MulmoChat に導入するか、service role で単一ユーザー運用にするか。  
- 埋め込みモデル: Supabase AI (384 次元) を踏襲するか、OpenAI embedding (1536/3072 次元) に切り替えるか。  
- 対応ファイル種/サイズ上限: md/txt のみで開始か、pdf を含めるか（PDF 抽出ライブラリを server に追加する必要あり）。  
- UI 配置: Documents を Sidebar に置くか、メインビューにタブで切り替えるか。  
- 既存 MulmoChat プラグインとの統合度: 「ドキュメント検索」を新プラグインとして扱うか、チャットの基本機能として常設するか。
