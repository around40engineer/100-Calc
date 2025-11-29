import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GachaService } from './GachaService.js';
import { Rarity, type Pokemon } from '../types/index.js';
import { PokeApiService } from './PokeApiService.js';

describe('GachaService', () => {
  beforeEach(() => {
    // PokeApiService.fetchPokemonById をモック化
    vi.spyOn(PokeApiService, 'fetchPokemonById');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ポイント不足時の動作', () => {
    it('Given ユーザーが50ポイントしか持っていない When ガチャを引く Then 失敗が返される', async () => {
      // Given
      const userPoints = 50;

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(false);
      expect(result.pokemon).toBeUndefined();
      expect(result.remainingPoints).toBe(50);
    });

    it('Given ユーザーが99ポイント持っている When ガチャを引く Then 失敗が返される', async () => {
      // Given
      const userPoints = 99;

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(false);
      expect(result.pokemon).toBeUndefined();
      expect(result.remainingPoints).toBe(99);
    });

    it('Given ユーザーが0ポイント持っている When ガチャを引く Then 失敗が返される', async () => {
      // Given
      const userPoints = 0;

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(false);
      expect(result.pokemon).toBeUndefined();
      expect(result.remainingPoints).toBe(0);
    });
  });

  describe('ポイント消費の動作', () => {
    it('Given ユーザーが100ポイント持っている When ガチャを引く Then 成功し残りポイントは0になる', async () => {
      // Given
      const userPoints = 100;
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://example.com/pikachu.png',
        rarity: Rarity.COMMON
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(true);
      expect(result.pokemon).toBeDefined();
      expect(result.remainingPoints).toBe(0);
    });

    it('Given ユーザーが250ポイント持っている When ガチャを引く Then 成功し残りポイントは150になる', async () => {
      // Given
      const userPoints = 250;
      const mockPokemon: Pokemon = {
        id: 1,
        name: 'bulbasaur',
        imageUrl: 'https://example.com/bulbasaur.png',
        rarity: Rarity.COMMON
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(true);
      expect(result.pokemon).toBeDefined();
      expect(result.remainingPoints).toBe(150);
    });

    it('Given ユーザーが500ポイント持っている When ガチャを引く Then 成功し残りポイントは400になる', async () => {
      // Given
      const userPoints = 500;
      const mockPokemon: Pokemon = {
        id: 4,
        name: 'charmander',
        imageUrl: 'https://example.com/charmander.png',
        rarity: Rarity.RARE
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(true);
      expect(result.pokemon).toBeDefined();
      expect(result.remainingPoints).toBe(400);
    });
  });

  describe('PokeApiService との連携', () => {
    it('Given ガチャを引く When PokeApiService からポケモンを取得する Then ポケモンデータが返される', async () => {
      // Given
      const userPoints = 100;
      const mockPokemon: Pokemon = {
        id: 7,
        name: 'squirtle',
        imageUrl: 'https://example.com/squirtle.png',
        rarity: Rarity.COMMON
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.success).toBe(true);
      expect(result.pokemon).toEqual(mockPokemon);
      expect(PokeApiService.fetchPokemonById).toHaveBeenCalledTimes(1);
    });

    it('Given ガチャを引く When PokeApiService が呼ばれる Then 有効なポケモンIDが渡される', async () => {
      // Given
      const userPoints = 100;
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://example.com/pikachu.png',
        rarity: Rarity.COMMON
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      await GachaService.pull(userPoints);

      // Then
      const calledWithId = (PokeApiService.fetchPokemonById as any).mock.calls[0][0];
      expect(calledWithId).toBeGreaterThanOrEqual(1);
      expect(calledWithId).toBeLessThanOrEqual(151);
    });

    it('Given 複数回ガチャを引く When PokeApiService が呼ばれる Then 毎回異なるポケモンIDが渡される可能性がある', async () => {
      // Given
      const userPoints = 300;
      const mockPokemons: Pokemon[] = [
        {
          id: 1,
          name: 'bulbasaur',
          imageUrl: 'https://example.com/bulbasaur.png',
          rarity: Rarity.COMMON
        },
        {
          id: 4,
          name: 'charmander',
          imageUrl: 'https://example.com/charmander.png',
          rarity: Rarity.COMMON
        },
        {
          id: 7,
          name: 'squirtle',
          imageUrl: 'https://example.com/squirtle.png',
          rarity: Rarity.COMMON
        }
      ];

      (PokeApiService.fetchPokemonById as any)
        .mockResolvedValueOnce(mockPokemons[0])
        .mockResolvedValueOnce(mockPokemons[1])
        .mockResolvedValueOnce(mockPokemons[2]);

      // When
      await GachaService.pull(userPoints);
      await GachaService.pull(userPoints - 100);
      await GachaService.pull(userPoints - 200);

      // Then
      expect(PokeApiService.fetchPokemonById).toHaveBeenCalledTimes(3);
    });
  });

  describe('レア度別の確率', () => {
    it('Given 多数回ガチャを引く When レア度を集計する Then COMMON が最も多く出現する', async () => {
      // Given
      const iterations = 1000;
      const rarityCount: Record<Rarity, number> = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      // PokeApiService をモック化して、IDに基づいてレア度を返す
      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];

        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }

        return {
          id,
          name: `pokemon-${id}`,
          imageUrl: `https://example.com/pokemon-${id}.png`,
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      // COMMON は約70%（許容範囲: 60-80%）
      const commonRate = rarityCount[Rarity.COMMON] / iterations;
      expect(commonRate).toBeGreaterThan(0.60);
      expect(commonRate).toBeLessThan(0.80);
    });

    it('Given 多数回ガチャを引く When レア度を集計する Then RARE は約25%の確率で出現する', async () => {
      // Given
      const iterations = 1000;
      const rarityCount: Record<Rarity, number> = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];

        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }

        return {
          id,
          name: `pokemon-${id}`,
          imageUrl: `https://example.com/pokemon-${id}.png`,
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      // RARE は約25%（許容範囲: 15-35%）
      const rareRate = rarityCount[Rarity.RARE] / iterations;
      expect(rareRate).toBeGreaterThan(0.15);
      expect(rareRate).toBeLessThan(0.35);
    });

    it('Given 多数回ガチャを引く When レア度を集計する Then LEGENDARY は約5%の確率で出現する', async () => {
      // Given
      const iterations = 1000;
      const rarityCount: Record<Rarity, number> = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];

        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }

        return {
          id,
          name: `pokemon-${id}`,
          imageUrl: `https://example.com/pokemon-${id}.png`,
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      // LEGENDARY は約5%（許容範囲: 2-10%）
      const legendaryRate = rarityCount[Rarity.LEGENDARY] / iterations;
      expect(legendaryRate).toBeGreaterThan(0.02);
      expect(legendaryRate).toBeLessThan(0.10);
    });

    it('Given ガチャを引く When レア度が選択される Then 全てのレア度の確率の合計は100%である', async () => {
      // Given
      const iterations = 1000;
      const rarityCount: Record<Rarity, number> = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];

        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }

        return {
          id,
          name: `pokemon-${id}`,
          imageUrl: `https://example.com/pokemon-${id}.png`,
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      const total = rarityCount[Rarity.COMMON] + rarityCount[Rarity.RARE] + rarityCount[Rarity.LEGENDARY];
      expect(total).toBe(iterations);
    });
  });

  describe('ガチャコストの確認', () => {
    it('Given ガチャコストが100ポイント When ガチャを引く Then 100ポイント消費される', async () => {
      // Given
      const userPoints = 200;
      const mockPokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://example.com/pikachu.png',
        rarity: Rarity.COMMON
      };

      (PokeApiService.fetchPokemonById as any).mockResolvedValueOnce(mockPokemon);

      // When
      const result = await GachaService.pull(userPoints);

      // Then
      expect(result.remainingPoints).toBe(userPoints - 100);
    });
  });

  describe('レベル15以上でのレア度ブースト', () => {
    it('Given レベル15でガチャを引く When 多数回実行する Then レア・レジェンダリーの出現率が上がる', async () => {
      // Given
      const iterations = 1000;
      const level = 15;
      const rarityCount = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      // PokeApiServiceをモック化して、実際のレア度を返すようにする
      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        // IDに基づいてレア度を決定（実際のGachaServiceのロジックに従う）
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];
        
        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }
        
        return {
          id,
          name: 'test',
          imageUrl: 'https://example.com/test.png',
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100, level);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then - ブースト時の期待値: COMMON 50%, RARE 40%, LEGENDARY 10%
      const commonRate = rarityCount[Rarity.COMMON] / iterations;
      const rareRate = rarityCount[Rarity.RARE] / iterations;
      const legendaryRate = rarityCount[Rarity.LEGENDARY] / iterations;

      // 通常時(70%, 25%, 5%)よりもレア・レジェンダリーが多いことを確認
      expect(commonRate).toBeLessThan(0.65); // 通常70%より低い
      expect(rareRate).toBeGreaterThan(0.30); // 通常25%より高い
      expect(legendaryRate).toBeGreaterThan(0.07); // 通常5%より高い
    });

    it('Given レベル20でガチャを引く When 多数回実行する Then レア度ブーストが適用される', async () => {
      // Given
      const iterations = 1000;
      const level = 20;
      const rarityCount = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];
        
        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }
        
        return {
          id,
          name: 'test',
          imageUrl: 'https://example.com/test.png',
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100, level);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      const rareRate = rarityCount[Rarity.RARE] / iterations;
      const legendaryRate = rarityCount[Rarity.LEGENDARY] / iterations;

      expect(rareRate).toBeGreaterThan(0.30); // ブースト時は40%期待
      expect(legendaryRate).toBeGreaterThan(0.07); // ブースト時は10%期待
    });

    it('Given レベル14でガチャを引く When 実行する Then 通常のレア度が適用される', async () => {
      // Given
      const iterations = 1000;
      const level = 14;
      const rarityCount = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];
        
        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }
        
        return {
          id,
          name: 'test',
          imageUrl: 'https://example.com/test.png',
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100, level);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then - 通常時の期待値: COMMON 70%, RARE 25%, LEGENDARY 5%
      const commonRate = rarityCount[Rarity.COMMON] / iterations;
      const rareRate = rarityCount[Rarity.RARE] / iterations;

      expect(commonRate).toBeGreaterThan(0.60); // 通常は70%程度
      expect(rareRate).toBeLessThan(0.35); // 通常は25%程度
    });

    it('Given レベル指定なしでガチャを引く When 実行する Then 通常のレア度が適用される', async () => {
      // Given
      const iterations = 1000;
      const rarityCount = {
        [Rarity.COMMON]: 0,
        [Rarity.RARE]: 0,
        [Rarity.LEGENDARY]: 0
      };

      (PokeApiService.fetchPokemonById as any).mockImplementation(async (id: number) => {
        let rarity: Rarity;
        const legendaryIds = [144, 145, 146, 150, 151];
        const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];
        
        if (legendaryIds.includes(id)) {
          rarity = Rarity.LEGENDARY;
        } else if (rareIds.includes(id)) {
          rarity = Rarity.RARE;
        } else {
          rarity = Rarity.COMMON;
        }
        
        return {
          id,
          name: 'test',
          imageUrl: 'https://example.com/test.png',
          rarity
        };
      });

      // When
      for (let i = 0; i < iterations; i++) {
        const result = await GachaService.pull(100);
        if (result.success && result.pokemon) {
          rarityCount[result.pokemon.rarity]++;
        }
      }

      // Then
      const commonRate = rarityCount[Rarity.COMMON] / iterations;
      expect(commonRate).toBeGreaterThan(0.60); // 通常は70%程度
    });
  });
});
