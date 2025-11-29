/**
 * @deprecated このモジュールは非推奨です。代わりに LevelSelector を使用してください。
 * 
 * DifficultySelector は3段階の難易度選択のみをサポートしていますが、
 * LevelSelector は20段階のレベルシステムをサポートしています。
 * 
 * 移行方法:
 * ```tsx
 * // 旧: DifficultySelector
 * import { DifficultySelector } from './components/DifficultySelector';
 * <DifficultySelector onStart={(difficulty, pokemon) => {...}} />
 * 
 * // 新: LevelSelector
 * import { LevelSelector } from './components/LevelSelector';
 * <LevelSelector onStart={(level, pokemon) => {...}} />
 * ```
 * 
 * 難易度からレベルへの対応:
 * - EASY (簡単) → レベル1-5
 * - NORMAL (普通) → レベル6-10
 * - HARD (難しい) → レベル11-15
 */
export { DifficultySelector } from './DifficultySelector';
