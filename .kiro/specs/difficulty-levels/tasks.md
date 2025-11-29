# Implementation Plan

- [x] 1. 型定義の更新
  - types/index.tsにDifficultyLevel型とLevelConfig interfaceを追加
  - 既存のDifficulty enumを維持しつつ、新しい型を追加
  - _Requirements: 1.1, 1.2_

- [x] 2. レベル設定の実装
  - [x] 2.1 LevelConfigServiceを作成
    - 各レベルの設定を定義（制限時間、演算タイプ、数値範囲）
    - レベル1-20の設定を作成
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 2.2 getLevelConfig関数を実装
    - レベルに応じた設定を返す
    - _Requirements: 2.5_

- [x] 3. ProblemGeneratorの拡張
  - [x] 3.1 generateForLevel関数を実装
    - レベル設定に基づいて問題を生成
    - 既存のgenerate関数を維持
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 3.2 レベル別の問題生成ロジック
    - レベル1-5: 1桁足し算
    - レベル6-10: 1桁引き算・掛け算
    - レベル11-15: 2桁足し算・引き算
    - レベル16-20: 2桁掛け算
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [-] 4. UserContextの更新
  - [x] 4.1 LevelStats型を追加
    - レベルごとの統計情報を管理
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 レベルアンロック機能を実装
    - レベルクリア時に次のレベルをアンロック
    - _Requirements: 1.5, 3.3_
  
  - [x] 4.3 統計情報の保存・読み込み
    - LocalStorageに保存
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 4.4 データ移行機能を実装
    - 既存のDifficulty形式から新しいLevel形式に変換
    - _Requirements: 3.1, 3.2_

- [x] 5. LevelSelectorコンポーネントの作成
  - [x] 5.1 レベル選択UIを実装
    - 20個のレベルボタンをグリッド表示
    - ロック/アンロック状態を表示
    - _Requirements: 1.1, 1.5_
  
  - [x] 5.2 レベル情報の表示
    - 各レベルの名前、制限時間、クリア状態を表示
    - _Requirements: 1.1_
  
  - [x] 5.3 レベル選択ハンドラー
    - アンロック済みレベルのみ選択可能
    - _Requirements: 1.2, 1.5_

- [x] 6. RewardCalculatorの更新
  - [x] 6.1 レベルベースの報酬計算
    - レベルに応じたポイント倍率を適用
    - _Requirements: 4.1, 4.2_
  
  - [x] 6.2 ボーナス報酬の計算
    - 初クリアボーナス
    - ノーミスボーナス
    - _Requirements: 4.3, 4.4_
  
  - [x] 6.3 レアポケモン出現率の調整
    - レベル15以上でレア度を上げる
    - _Requirements: 4.5_

- [x] 7. GameContextの更新
  - [x] 7.1 startSession関数を更新
    - DifficultyLevelを受け取るように変更
    - 既存のDifficultyも引き続きサポート
    - _Requirements: 1.2, 1.3_
  
  - [x] 7.2 制限時間の設定
    - レベルに応じた制限時間を設定
    - _Requirements: 1.3_

- [x] 8. StatsViewの更新
  - [x] 8.1 レベル別統計表示
    - 各レベルのベストタイム、プレイ回数を表示
    - _Requirements: 3.4_
  
  - [x] 8.2 進捗表示
    - クリア済みレベル数、全体の進捗率を表示
    - _Requirements: 3.4_

- [x] 9. 既存コンポーネントの互換性維持
  - [x] 9.1 DifficultySelector（旧）を非推奨に
    - 新しいLevelSelectorへの移行パスを提供
    - _Requirements: 1.1_
  
  - [x] 9.2 既存のテストを更新
    - 新しいレベルシステムに対応
    - _Requirements: 全て_

- [x] 10. 統合とテスト
  - [x] 10.1 エンドツーエンドテスト
    - レベル選択からクリアまでの流れを確認
    - _Requirements: 全て_
  
  - [x] 10.2 データ移行のテスト
    - 既存ユーザーデータが正しく移行されることを確認
    - _Requirements: 3.1, 3.2_
