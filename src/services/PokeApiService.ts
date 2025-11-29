import { type Pokemon, type PokeApiPokemon, type DifficultyLevel, Rarity } from '../types/index.js';
import { determineRarity, getLegendaryIds, getRareIds } from '../utils/pokemonRarity.js';

/**
 * PokeAPI との通信を管理するサービスクラス
 */
export class PokeApiService {
  private static readonly BASE_URL = 'https://pokeapi.co/api/v2';
  private static readonly MAX_POKEMON_ID = 151; // 第一世代のみ使用
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // ミリ秒
  private static readonly TIMEOUT = 5000; // ミリ秒

  /**
   * ランダムなポケモンを取得
   * @param level - オプショナル: レベル15以上の場合、レア度の高いポケモンが出やすくなる
   * @returns ランダムに選択されたポケモンデータ
   */
  static async fetchRandomPokemon(level?: DifficultyLevel): Promise<Pokemon> {
    let randomId: number;
    
    // レベル15以上の場合、レア度を上げる
    if (level !== undefined && level >= 15) {
      randomId = this.selectPokemonIdWithRarityBoost();
    } else {
      randomId = Math.floor(Math.random() * this.MAX_POKEMON_ID) + 1;
    }
    
    return this.fetchPokemonById(randomId);
  }

  /**
   * レア度ブースト付きでポケモンIDを選択
   * レベル15以上の場合に使用され、レアおよび伝説のポケモンが出やすくなる
   * @returns 選択されたポケモンID
   */
  private static selectPokemonIdWithRarityBoost(): number {
    const rand = Math.random();
    const legendaryIds = getLegendaryIds();
    const rareIds = getRareIds();
    
    // レア度ブースト時の確率
    // LEGENDARY: 15% (通常5%)
    // RARE: 35% (通常25%)
    // COMMON: 50% (通常70%)
    
    if (rand < 0.15) {
      // 伝説のポケモン
      return legendaryIds[Math.floor(Math.random() * legendaryIds.length)];
    } else if (rand < 0.50) {
      // レアポケモン
      return rareIds[Math.floor(Math.random() * rareIds.length)];
    } else {
      // コモンポケモン（伝説・レアを除く）
      let id: number;
      do {
        id = Math.floor(Math.random() * this.MAX_POKEMON_ID) + 1;
      } while (legendaryIds.includes(id) || rareIds.includes(id));
      return id;
    }
  }

  /**
   * IDでポケモンを取得
   * @param id - PokeAPI の pokemon ID
   * @returns ポケモンデータ
   */
  static async fetchPokemonById(id: number): Promise<Pokemon> {
    const url = `${this.BASE_URL}/pokemon/${id}`;
    const data = await this.fetchWithRetry<PokeApiPokemon>(url);

    // 日本語名を取得
    const speciesUrl = `${this.BASE_URL}/pokemon-species/${id}`;
    const speciesData = await this.fetchWithRetry<any>(speciesUrl);
    const japaneseName = speciesData.names.find((n: any) => n.language.name === 'ja')?.name || data.name;

    return {
      id: data.id,
      name: data.name,
      japaneseName,
      imageUrl: data.sprites.other['official-artwork'].front_default,
      rarity: determineRarity(data.id)
    };
  }

  /**
   * 複数のポケモンを取得
   * @param ids - PokeAPI の pokemon IDs の配列
   * @returns ポケモンデータの配列
   */
  static async fetchMultiplePokemon(ids: number[]): Promise<Pokemon[]> {
    const promises = ids.map(id => this.fetchPokemonById(id));
    return Promise.all(promises);
  }

  /**
   * リトライロジック付きのfetch
   * @param url - リクエストURL
   * @returns レスポンスデータ
   */
  private static async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

        const response = await fetch(url, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // 最後の試行でない場合は待機してリトライ
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }

    // 全てのリトライが失敗した場合
    throw new Error(
      `Failed to fetch after ${this.MAX_RETRIES} attempts: ${lastError?.message}`
    );
  }

  /**
   * 指定されたミリ秒待機
   * @param ms - 待機時間（ミリ秒）
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
