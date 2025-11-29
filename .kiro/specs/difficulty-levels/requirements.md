# Requirements Document

## Introduction

現在の3段階の難易度（簡単・普通・難しい）を、レベル1からレベル20までの20段階に細分化し、より段階的な学習体験を提供する機能を実装します。

## Glossary

- **Difficulty Level System**: レベル1からレベル20までの20段階の難易度システム
- **Problem Generator**: 各レベルに応じた適切な難易度の計算問題を生成するサービス
- **Level Selector**: ユーザーがレベルを選択するためのUI
- **Stats System**: 各レベルごとの統計情報を管理するシステム

## Requirements

### Requirement 1

**User Story:** As a ユーザー, I want レベル1からレベル20までの難易度を選択できる, so that 自分のスキルに合わせた問題に挑戦できる

#### Acceptance Criteria

1. WHEN ユーザーがホーム画面を表示する, THE Level Selector SHALL レベル1からレベル20までの選択肢を表示する
2. WHEN ユーザーがレベルを選択する, THE System SHALL 選択されたレベルに応じた問題を生成する
3. WHEN ユーザーがレベルを選択する, THE System SHALL 選択されたレベルに応じた制限時間を設定する
4. WHEN ユーザーが未クリアのレベルを選択する, THE System SHALL そのレベルをプレイ可能にする
5. WHERE ユーザーが前のレベルをクリアしていない, THE System SHALL 次のレベルをロック状態で表示する

### Requirement 2

**User Story:** As a Problem Generator, I want 各レベルに応じた適切な難易度の問題を生成する, so that 段階的な学習体験を提供できる

#### Acceptance Criteria

1. WHEN レベル1-5が選択される, THE Problem Generator SHALL 1桁の足し算問題を生成する
2. WHEN レベル6-10が選択される, THE Problem Generator SHALL 1桁の引き算と掛け算問題を生成する
3. WHEN レベル11-15が選択される, THE Problem Generator SHALL 2桁の足し算と引き算問題を生成する
4. WHEN レベル16-20が選択される, THE Problem Generator SHALL 2桁の掛け算と複雑な計算問題を生成する
5. WHEN 問題を生成する, THE Problem Generator SHALL レベルに応じて数値の範囲を調整する

### Requirement 3

**User Story:** As a Stats System, I want 各レベルごとの統計情報を記録する, so that ユーザーの進捗を追跡できる

#### Acceptance Criteria

1. WHEN ユーザーがレベルをクリアする, THE Stats System SHALL そのレベルのベストタイムを記録する
2. WHEN ユーザーがレベルをクリアする, THE Stats System SHALL そのレベルのプレイ回数を記録する
3. WHEN ユーザーがレベルをクリアする, THE Stats System SHALL 次のレベルをアンロックする
4. WHEN ユーザーが統計画面を表示する, THE Stats System SHALL 各レベルの統計情報を表示する
5. WHEN ユーザーが新記録を達成する, THE Stats System SHALL 追加報酬を付与する

### Requirement 4

**User Story:** As a Reward System, I want レベルに応じた報酬を計算する, so that 高難易度レベルに挑戦するモチベーションを提供できる

#### Acceptance Criteria

1. WHEN ユーザーがレベルをクリアする, THE Reward System SHALL レベルに応じたポイントを付与する
2. WHEN ユーザーが高レベルをクリアする, THE Reward System SHALL より多くのポイントを付与する
3. WHEN ユーザーがレベルを初クリアする, THE Reward System SHALL ボーナスポイントを付与する
4. WHEN ユーザーがノーミスでクリアする, THE Reward System SHALL 追加ボーナスを付与する
5. WHERE レベルが15以上, THE Reward System SHALL レアポケモンの出現率を上げる
