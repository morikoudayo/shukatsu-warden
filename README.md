# Architecture

機能（feature）単位でコードを配置しつつ、各機能の中では責務を分離します。

```text
src/
├── index.ts                 # 起動だけ
├── config/
│   └── env.ts               # 環境変数の読み込み・検証
├── libs/
│   ├── slack.ts             # Bolt App / Slack Client生成
│   ├── supabase.ts          # Supabase Client生成
│   └── ai.ts                # AI Client生成
├── features/
│   ├── tasks/
│   │   ├── task.types.ts
│   │   ├── task.repository.ts   # DB読み書き
│   │   ├── task.service.ts      # タスク作成・更新
│   │   └── task.parser.ts       # AIパース
│   ├── checkins/
│   │   ├── checkin.service.ts   # 18:30の再計画処理
├── slack/
│   ├── register.ts          # Slackハンドラ一括登録
│   ├── messages.ts          # app.message(...)
├── jobs/
│   └── evening-checkin.ts   # Cronから呼ぶ処理
└── shared/
    ├── errors.ts
    └── utils.ts
```

## Responsibilities

| 場所 | 責務 |
| --- | --- |
| `index.ts` | アプリケーションの起動とハンドラ登録 |
| `config/` | 環境変数・設定の読み込みと検証 |
| `libs/` | Slack、Supabase、AIなど外部SDKの初期化 |
| `slack/` | Slackイベントの受信、入力検証、サービス呼び出し |
| `features/` | タスク・チェックインなどの業務ロジック |
| `*.service.ts` | ユースケース、業務ルール、処理の組み立て |
| `*.repository.ts` | DBアクセスのみ。業務判断は書かない |
| `*.parser.ts` | AIまたは自然文入力を構造化する処理 |
| `*.blocks.ts` | Slack Block Kitの組み立て |
| `jobs/` | Cronなど定期実行処理の入口 |
| `shared/` | 複数機能で共有するエラー・ユーティリティ |