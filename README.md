# ポケモン100マス計算チャレンジ

子供向けの教育アプリケーション。100マス計算を通じて計算力を養いながら、ポケモンのコレクションを増やすゲーム要素を組み合わせたアプリです。

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **状態管理**: React Context API + useReducer
- **テスト**: Vitest + React Testing Library
- **データ永続化**: LocalStorage

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

### テストの実行

```bash
npm run test
```

### テストの実行（ウォッチモード）

```bash
npm run test -- --watch
```

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── GameBoard/      # ゲームボード関連
│   ├── DifficultySelector/  # 難易度選択
│   ├── Timer/          # タイマー
│   ├── Collection/     # コレクション画面
│   ├── Gacha/          # ガチャ画面
│   ├── Stats/          # 統計画面
│   └── Rewards/        # 報酬表示
├── contexts/           # Context API
├── services/           # ビジネスロジック
├── types/              # TypeScript型定義
├── data/               # マスターデータ
├── lib/                # ユーティリティ
└── test/               # テスト設定
```

## 開発手法

このプロジェクトはTDD（テスト駆動開発）で進めます。各機能の実装前にテストを書き、BDD（振る舞い駆動開発）の原則に従って開発します。

## ライセンス

Private
