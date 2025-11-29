import { Rarity } from '../types';

/**
 * ポケモンのレア度を判定するユーティリティ
 * PokeAPI の pokemon ID に基づいてレア度を判定します
 */

// 伝説のポケモン（第一世代）
const LEGENDARY_IDS = [
  144, // フリーザー
  145, // サンダー
  146, // ファイヤー
  150, // ミュウツー
  151  // ミュウ
];

// レアポケモン（進化系の最終形態など）
const RARE_IDS = [
  3,   // フシギバナ
  6,   // リザードン
  9,   // カメックス
  65,  // フーディン
  68,  // カイリキー
  76,  // ゴローニャ
  94,  // ゲンガー
  130, // ギャラドス
  131, // ラプラス
  143  // カビゴン
];

/**
 * ポケモンIDに基づいてレア度を判定する
 * @param id - PokeAPI の pokemon ID
 * @returns レア度 (COMMON, RARE, LEGENDARY)
 */
export function determineRarity(id: number): Rarity {
  if (LEGENDARY_IDS.includes(id)) {
    return Rarity.LEGENDARY;
  } else if (RARE_IDS.includes(id)) {
    return Rarity.RARE;
  } else {
    return Rarity.COMMON;
  }
}

/**
 * 伝説のポケモンIDの配列を取得
 * @returns 伝説のポケモンIDの配列
 */
export function getLegendaryIds(): number[] {
  return [...LEGENDARY_IDS];
}

/**
 * レアポケモンIDの配列を取得
 * @returns レアポケモンIDの配列
 */
export function getRareIds(): number[] {
  return [...RARE_IDS];
}

/**
 * 指定されたレア度のポケモンIDかどうかを判定
 * @param id - PokeAPI の pokemon ID
 * @param rarity - 判定するレア度
 * @returns 指定されたレア度のポケモンIDかどうか
 */
export function isRarity(id: number, rarity: Rarity): boolean {
  return determineRarity(id) === rarity;
}
