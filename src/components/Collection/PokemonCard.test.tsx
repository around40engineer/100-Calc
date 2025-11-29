import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PokemonCard } from './PokemonCard';
import { Rarity, type Pokemon } from '../../types';

describe('PokemonCard', () => {
  describe('ポケモン情報の表示', () => {
    it('Given 獲得済みポケモンデータ When PokemonCard が表示される Then ポケモンの画像が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const pokemonImage = screen.getByAltText(/pikachu/i);
      expect(pokemonImage).toBeInTheDocument();
      expect(pokemonImage).toHaveAttribute('src', pokemon.imageUrl);
    });

    it('Given 獲得済みポケモンデータ When PokemonCard が表示される Then ポケモンの名前が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
    });

    it('Given 獲得済みポケモンデータ When PokemonCard が表示される Then ポケモンIDが表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/No\.\s*25/i)).toBeInTheDocument();
    });

    it('Given PokeAPIから取得した画像URL When PokemonCard が表示される Then 正しい画像URLが使用される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const pokemonImage = screen.getByAltText(/charizard/i) as HTMLImageElement;
      expect(pokemonImage.src).toContain('official-artwork/6.png');
    });
  });

  describe('未獲得ポケモンのシルエット表示', () => {
    it('Given 未獲得ポケモン When PokemonCard が表示される Then シルエット画像が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      const pokemonImage = screen.getByAltText(/\?\?\?/i);
      expect(pokemonImage).toBeInTheDocument();
      expect(pokemonImage).toHaveClass(/grayscale|opacity/i);
    });

    it('Given 未獲得ポケモン When PokemonCard が表示される Then ポケモン名が隠される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      expect(screen.queryByText(/pikachu/i)).not.toBeInTheDocument();
      expect(screen.getByText(/\?\?\?/)).toBeInTheDocument();
    });

    it('Given 未獲得ポケモン When PokemonCard が表示される Then ロック状態が視覚的に示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).toHaveAttribute('data-owned', 'false');
    });

    it('Given 未獲得ポケモン When PokemonCard が表示される Then ポケモンIDは表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      expect(screen.getByText(/No\.\s*25/i)).toBeInTheDocument();
    });
  });

  describe('レア度表示', () => {
    it('Given コモンポケモン When PokemonCard が表示される Then コモンレア度が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/ノーマル/i)).toBeInTheDocument();
    });

    it('Given レアポケモン When PokemonCard が表示される Then レアレア度が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/レア/i)).toBeInTheDocument();
    });

    it('Given レジェンダリーポケモン When PokemonCard が表示される Then レジェンダリーレア度が表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/レジェンド/i)).toBeInTheDocument();
    });

    it('Given コモンポケモン When PokemonCard が表示される Then グレー系の背景色が適用される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).toHaveAttribute('data-rarity', 'common');
    });

    it('Given レアポケモン When PokemonCard が表示される Then ブルー系の背景色が適用される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 6,
        name: 'charizard',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        rarity: Rarity.RARE
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).toHaveAttribute('data-rarity', 'rare');
    });

    it('Given レジェンダリーポケモン When PokemonCard が表示される Then ゴールド系の背景色が適用される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).toHaveAttribute('data-rarity', 'legendary');
    });

    it('Given 未獲得ポケモン When PokemonCard が表示される Then レア度は表示されない', () => {
      // Given
      const pokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
        rarity: Rarity.LEGENDARY
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      expect(screen.queryByText(/legendary/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/rare/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/common/i)).not.toBeInTheDocument();
    });
  });

  describe('カードのインタラクション', () => {
    it('Given 獲得済みポケモン When カードが表示される Then クリック可能な状態である', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).not.toHaveClass(/cursor-not-allowed|pointer-events-none/i);
    });

    it('Given 未獲得ポケモン When カードが表示される Then 非アクティブな状態である', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'pikachu',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={false} />);

      // Then
      const card = screen.getByTestId('pokemon-card');
      expect(card).toHaveClass(/opacity/i);
    });
  });

  describe('エッジケース', () => {
    it('Given 3桁のポケモンID When PokemonCard が表示される Then 正しくフォーマットされる', () => {
      // Given
      const pokemon: Pokemon = {
        id: 151,
        name: 'mew',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
        rarity: Rarity.LEGENDARY
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/No\.\s*151/i)).toBeInTheDocument();
    });

    it('Given 1桁のポケモンID When PokemonCard が表示される Then 正しくフォーマットされる', () => {
      // Given
      const pokemon: Pokemon = {
        id: 1,
        name: 'bulbasaur',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/No\.\s*1/i)).toBeInTheDocument();
    });

    it('Given 長いポケモン名 When PokemonCard が表示される Then テキストが適切に表示される', () => {
      // Given
      const pokemon: Pokemon = {
        id: 25,
        name: 'very-long-pokemon-name-test',
        imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        rarity: Rarity.COMMON
      };

      // When
      render(<PokemonCard pokemon={pokemon} isOwned={true} />);

      // Then
      expect(screen.getByText(/very-long-pokemon-name-test/i)).toBeInTheDocument();
    });
  });
});
