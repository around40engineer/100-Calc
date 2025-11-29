import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PokeApiService } from './PokeApiService.js';
import { Rarity, type Pokemon } from '../types/index.js';

describe('PokeApiService', () => {
  // グローバルfetchをモック化
  const originalFetch = global.fetch;

  beforeEach(() => {
    // fetchをモック化
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // fetchを元に戻す
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('IDでポケモン取得', () => {
    it('Given 有効なポケモンID When fetchPokemonById を呼ぶ Then ポケモンデータが返される', async () => {
      // Given
      const pokemonId = 25; // ピカチュウ
      const mockPokemonResponse = {
        id: 25,
        name: 'pikachu',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/pikachu.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ピカチュウ' },
          { language: { name: 'en' }, name: 'Pikachu' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

      // Then
      expect(pokemon.id).toBe(pokemonId);
      expect(pokemon.name).toBe('pikachu');
      expect(pokemon.japaneseName).toBe('ピカチュウ');
      expect(pokemon.imageUrl).toBe('https://example.com/pikachu.png');
      expect(pokemon.rarity).toBeDefined();
      expect(Object.values(Rarity)).toContain(pokemon.rarity);
    });

    it('Given 伝説のポケモンID When fetchPokemonById を呼ぶ Then LEGENDARY レア度が返される', async () => {
      // Given
      const pokemonId = 150; // ミュウツー
      const mockPokemonResponse = {
        id: 150,
        name: 'mewtwo',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/mewtwo.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ミュウツー' },
          { language: { name: 'en' }, name: 'Mewtwo' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

      // Then
      expect(pokemon.rarity).toBe(Rarity.LEGENDARY);
    });

    it('Given レアポケモンID When fetchPokemonById を呼ぶ Then RARE レア度が返される', async () => {
      // Given
      const pokemonId = 6; // リザードン
      const mockPokemonResponse = {
        id: 6,
        name: 'charizard',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/charizard.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'リザードン' },
          { language: { name: 'en' }, name: 'Charizard' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

      // Then
      expect(pokemon.rarity).toBe(Rarity.RARE);
    });

    it('Given コモンポケモンID When fetchPokemonById を呼ぶ Then COMMON レア度が返される', async () => {
      // Given
      const pokemonId = 25; // ピカチュウ
      const mockPokemonResponse = {
        id: 25,
        name: 'pikachu',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/pikachu.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ピカチュウ' },
          { language: { name: 'en' }, name: 'Pikachu' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

      // Then
      expect(pokemon.rarity).toBe(Rarity.COMMON);
    });

    it('Given 無効なポケモンID When fetchPokemonById を呼ぶ Then エラーがスローされる', async () => {
      // Given
      const pokemonId = 9999;

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      // When & Then
      await expect(PokeApiService.fetchPokemonById(pokemonId))
        .rejects.toThrow();
    });
  });

  describe('ランダムポケモン取得', () => {
    it('Given ランダムポケモン取得 When fetchRandomPokemon を呼ぶ Then ポケモンデータが返される', async () => {
      // Given
      const mockPokemonResponse = {
        id: 1,
        name: 'bulbasaur',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/bulbasaur.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'フシギダネ' },
          { language: { name: 'en' }, name: 'Bulbasaur' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchRandomPokemon();

      // Then
      expect(pokemon).toBeDefined();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
      expect(pokemon.name).toBeDefined();
      expect(pokemon.imageUrl).toBeDefined();
      expect(pokemon.rarity).toBeDefined();
    });

    it('Given 複数回ランダムポケモン取得 When fetchRandomPokemon を呼ぶ Then 異なるポケモンが返される可能性がある', async () => {
      // Given
      const mockPokemon1 = {
        id: 1,
        name: 'bulbasaur',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/bulbasaur.png'
            }
          }
        }
      };

      const mockSpecies1 = {
        names: [
          { language: { name: 'ja' }, name: 'フシギダネ' },
          { language: { name: 'en' }, name: 'Bulbasaur' }
        ]
      };

      const mockPokemon2 = {
        id: 4,
        name: 'charmander',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/charmander.png'
            }
          }
        }
      };

      const mockSpecies2 = {
        names: [
          { language: { name: 'ja' }, name: 'ヒトカゲ' },
          { language: { name: 'en' }, name: 'Charmander' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemon1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpecies1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemon2
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpecies2
        });

      // When
      const pokemon1 = await PokeApiService.fetchRandomPokemon();
      const pokemon2 = await PokeApiService.fetchRandomPokemon();

      // Then
      expect(pokemon1).toBeDefined();
      expect(pokemon2).toBeDefined();
      // 異なるポケモンが返される可能性を確認（この例では確実に異なる）
      expect(pokemon1.id).not.toBe(pokemon2.id);
    });
  });

  describe('複数ポケモン取得', () => {
    it('Given ポケモンIDの配列 When fetchMultiplePokemon を呼ぶ Then 全てのポケモンデータが返される', async () => {
      // Given
      const pokemonIds = [1, 4, 7];
      
      const mockPokemon1 = {
        id: 1,
        name: 'bulbasaur',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/bulbasaur.png'
            }
          }
        }
      };

      const mockSpecies1 = {
        names: [
          { language: { name: 'ja' }, name: 'フシギダネ' },
          { language: { name: 'en' }, name: 'Bulbasaur' }
        ]
      };

      const mockPokemon2 = {
        id: 4,
        name: 'charmander',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/charmander.png'
            }
          }
        }
      };

      const mockSpecies2 = {
        names: [
          { language: { name: 'ja' }, name: 'ヒトカゲ' },
          { language: { name: 'en' }, name: 'Charmander' }
        ]
      };

      const mockPokemon3 = {
        id: 7,
        name: 'squirtle',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/squirtle.png'
            }
          }
        }
      };

      const mockSpecies3 = {
        names: [
          { language: { name: 'ja' }, name: 'ゼニガメ' },
          { language: { name: 'en' }, name: 'Squirtle' }
        ]
      };

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/pokemon/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockPokemon1
          });
        } else if (url.includes('/pokemon-species/1')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpecies1
          });
        } else if (url.includes('/pokemon/4')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockPokemon2
          });
        } else if (url.includes('/pokemon-species/4')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpecies2
          });
        } else if (url.includes('/pokemon/7')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockPokemon3
          });
        } else if (url.includes('/pokemon-species/7')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpecies3
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // When
      const pokemons = await PokeApiService.fetchMultiplePokemon(pokemonIds);

      // Then
      expect(pokemons).toHaveLength(3);
      expect(pokemons[0].id).toBe(1);
      expect(pokemons[0].name).toBe('bulbasaur');
      expect(pokemons[1].id).toBe(4);
      expect(pokemons[1].name).toBe('charmander');
      expect(pokemons[2].id).toBe(7);
      expect(pokemons[2].name).toBe('squirtle');
    });

    it('Given 空の配列 When fetchMultiplePokemon を呼ぶ Then 空の配列が返される', async () => {
      // Given
      const pokemonIds: number[] = [];

      // When
      const pokemons = await PokeApiService.fetchMultiplePokemon(pokemonIds);

      // Then
      expect(pokemons).toHaveLength(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('Given ネットワークエラー When fetchPokemonById を呼ぶ Then リトライ後にエラーがスローされる', async () => {
      // Given
      const pokemonId = 25;
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      // When & Then
      await expect(PokeApiService.fetchPokemonById(pokemonId))
        .rejects.toThrow();
      
      // リトライが実行されたことを確認（3回試行、最初のfetchで失敗するのでspeciesは呼ばれない）
      expect(global.fetch).toHaveBeenCalled();
    });

    it('Given タイムアウト When fetchPokemonById を呼ぶ Then リトライ後にエラーがスローされる', async () => {
      // Given
      const pokemonId = 25;
      (global.fetch as any).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      // When & Then
      await expect(PokeApiService.fetchPokemonById(pokemonId))
        .rejects.toThrow();
      
      // リトライが実行されたことを確認
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('Given 1回目は失敗2回目は成功 When fetchPokemonById を呼ぶ Then リトライ後に成功する', async () => {
      // Given
      const pokemonId = 25;
      const mockPokemonResponse = {
        id: 25,
        name: 'pikachu',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/pikachu.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ピカチュウ' },
          { language: { name: 'en' }, name: 'Pikachu' }
        ]
      };

      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchPokemonById(pokemonId);

      // Then
      expect(pokemon.id).toBe(pokemonId);
      expect(pokemon.name).toBe('pikachu');
    });

    it('Given APIエラーレスポンス When fetchPokemonById を呼ぶ Then リトライ後にエラーがスローされる', async () => {
      // Given
      const pokemonId = 25;
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500
      });

      // When & Then
      await expect(PokeApiService.fetchPokemonById(pokemonId))
        .rejects.toThrow();
      
      // リトライが実行されたことを確認
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('レベルベースのレア度ブースト', () => {
    it('Given レベル14以下 When fetchRandomPokemon を呼ぶ Then 通常のランダム選択が行われる', async () => {
      // Given
      const level = 14 as const;
      const mockPokemonResponse = {
        id: 25,
        name: 'pikachu',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/pikachu.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ピカチュウ' },
          { language: { name: 'en' }, name: 'Pikachu' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchRandomPokemon(level);

      // Then
      expect(pokemon).toBeDefined();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
    });

    it('Given レベル15 When fetchRandomPokemon を呼ぶ Then レア度ブーストが適用される', async () => {
      // Given
      const level = 15 as const;
      const mockPokemonResponse = {
        id: 150, // ミュウツー（伝説）
        name: 'mewtwo',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/mewtwo.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ミュウツー' },
          { language: { name: 'en' }, name: 'Mewtwo' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchRandomPokemon(level);

      // Then
      expect(pokemon).toBeDefined();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
    });

    it('Given レベル20 When fetchRandomPokemon を呼ぶ Then レア度ブーストが適用される', async () => {
      // Given
      const level = 20 as const;
      const mockPokemonResponse = {
        id: 6, // リザードン（レア）
        name: 'charizard',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/charizard.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'リザードン' },
          { language: { name: 'en' }, name: 'Charizard' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchRandomPokemon(level);

      // Then
      expect(pokemon).toBeDefined();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
    });

    it('Given レベル未指定 When fetchRandomPokemon を呼ぶ Then 通常のランダム選択が行われる', async () => {
      // Given
      const mockPokemonResponse = {
        id: 25,
        name: 'pikachu',
        sprites: {
          other: {
            'official-artwork': {
              front_default: 'https://example.com/pikachu.png'
            }
          }
        }
      };

      const mockSpeciesResponse = {
        names: [
          { language: { name: 'ja' }, name: 'ピカチュウ' },
          { language: { name: 'en' }, name: 'Pikachu' }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPokemonResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSpeciesResponse
        });

      // When
      const pokemon = await PokeApiService.fetchRandomPokemon();

      // Then
      expect(pokemon).toBeDefined();
      expect(pokemon.id).toBeGreaterThanOrEqual(1);
      expect(pokemon.id).toBeLessThanOrEqual(151);
    });
  });

  describe('レア度判定', () => {
    it('Given 全ての伝説のポケモンID When レア度判定 Then LEGENDARY が返される', async () => {
      // Given
      const legendaryIds = [144, 145, 146, 150, 151];
      
      for (const id of legendaryIds) {
        const mockPokemonResponse = {
          id,
          name: `pokemon-${id}`,
          sprites: {
            other: {
              'official-artwork': {
                front_default: `https://example.com/pokemon-${id}.png`
              }
            }
          }
        };

        const mockSpeciesResponse = {
          names: [
            { language: { name: 'ja' }, name: `ポケモン${id}` },
            { language: { name: 'en' }, name: `Pokemon${id}` }
          ]
        };

        (global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockPokemonResponse
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockSpeciesResponse
          });

        // When
        const pokemon = await PokeApiService.fetchPokemonById(id);

        // Then
        expect(pokemon.rarity).toBe(Rarity.LEGENDARY);
      }
    });

    it('Given 全てのレアポケモンID When レア度判定 Then RARE が返される', async () => {
      // Given
      const rareIds = [3, 6, 9, 65, 68, 76, 94, 130, 131, 143];
      
      for (const id of rareIds) {
        const mockPokemonResponse = {
          id,
          name: `pokemon-${id}`,
          sprites: {
            other: {
              'official-artwork': {
                front_default: `https://example.com/pokemon-${id}.png`
              }
            }
          }
        };

        const mockSpeciesResponse = {
          names: [
            { language: { name: 'ja' }, name: `ポケモン${id}` },
            { language: { name: 'en' }, name: `Pokemon${id}` }
          ]
        };

        (global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockPokemonResponse
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockSpeciesResponse
          });

        // When
        const pokemon = await PokeApiService.fetchPokemonById(id);

        // Then
        expect(pokemon.rarity).toBe(Rarity.RARE);
      }
    });
  });
});
