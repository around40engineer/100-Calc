import { Rarity, type Pokemon, type DifficultyLevel } from '../types/index.js';
import { PokeApiService } from './PokeApiService.js';

export class GachaService {
  private static readonly GACHA_COST = 100;
  private static readonly RARITY_RATES = {
    [Rarity.COMMON]: 0.70,      // 70%
    [Rarity.RARE]: 0.25,         // 25%
    [Rarity.LEGENDARY]: 0.05     // 5%
  };

  // レベル15以上でレア度ブーストを適用
  private static readonly RARE_BOOST_LEVEL = 15;
  private static readonly BOOSTED_RARITY_RATES = {
    [Rarity.COMMON]: 0.50,      // 50% (70% → 50%)
    [Rarity.RARE]: 0.40,         // 40% (25% → 40%)
    [Rarity.LEGENDARY]: 0.10     // 10% (5% → 10%)
  };

  // レア度に基づいてポケモンIDの範囲を決定
  private static readonly RARITY_ID_RANGES = {
    [Rarity.LEGENDARY]: [144, 145, 146, 150, 151],
    [Rarity.RARE]: [3, 6, 9, 65, 68, 76, 94, 130, 131, 143]
  };

  static async pull(userPoints: number, level?: DifficultyLevel): Promise<{
    success: boolean;
    pokemon?: Pokemon;
    remainingPoints: number;
  }> {
    if (userPoints < this.GACHA_COST) {
      return {
        success: false,
        remainingPoints: userPoints
      };
    }

    const rarity = this.selectRarity(level);
    const pokemonId = this.selectPokemonIdByRarity(rarity);
    const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

    return {
      success: true,
      pokemon,
      remainingPoints: userPoints - this.GACHA_COST
    };
  }

  private static selectRarity(level?: DifficultyLevel): Rarity {
    const rand = Math.random();
    let cumulative = 0;

    // レベル15以上の場合、ブーストされたレア度を使用
    const rates = level !== undefined && level >= this.RARE_BOOST_LEVEL
      ? this.BOOSTED_RARITY_RATES
      : this.RARITY_RATES;

    for (const [rarity, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (rand < cumulative) {
        return rarity as Rarity;
      }
    }

    return Rarity.COMMON;
  }

  private static selectPokemonIdByRarity(rarity: Rarity): number {
    if (rarity === Rarity.LEGENDARY) {
      const ids = this.RARITY_ID_RANGES[Rarity.LEGENDARY];
      return ids[Math.floor(Math.random() * ids.length)];
    } else if (rarity === Rarity.RARE) {
      const ids = this.RARITY_ID_RANGES[Rarity.RARE];
      return ids[Math.floor(Math.random() * ids.length)];
    } else {
      // COMMON: 範囲からランダム選択（伝説・レアを除く）
      let id: number;
      do {
        id = Math.floor(Math.random() * 151) + 1;
      } while (
        this.RARITY_ID_RANGES[Rarity.LEGENDARY].includes(id) ||
        this.RARITY_ID_RANGES[Rarity.RARE].includes(id)
      );
      return id;
    }
  }
}
