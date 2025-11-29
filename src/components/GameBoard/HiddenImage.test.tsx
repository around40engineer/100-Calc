import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HiddenImage } from './HiddenImage';
import type { CellState } from '../../types';
import { OperationType } from '../../types';

describe('HiddenImage', () => {
  const mockPokemonImageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

  // ヘルパー関数: 10x10のセル状態を生成
  const createCellStates = (revealedIndices: number[] = []): CellState[][] => {
    const cells: CellState[][] = [];
    let index = 0;
    
    for (let row = 0; row < 10; row++) {
      cells[row] = [];
      for (let col = 0; col < 10; col++) {
        cells[row][col] = {
          problem: {
            id: `${index}`,
            operand1: 1,
            operand2: 1,
            operation: OperationType.ADDITION,
            answer: 2
          },
          userAnswer: null,
          isCorrect: null,
          isRevealed: revealedIndices.includes(index)
        };
        index++;
      }
    }
    
    return cells;
  };

  describe('初期状態で画像が隠れている', () => {
    it('Given 全てのセルが閉じている When HiddenImageが表示される Then 画像が完全に隠れている', () => {
      // Given
      const cells = createCellStates([]);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      // 全ての画像パーツが隠れていることを確認
      for (let i = 0; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        expect(part).toHaveAttribute('data-revealed', 'false');
      }
    });

    it('Given HiddenImageが表示される When レンダリングされる Then 10x10のグリッドが表示される', () => {
      // Given
      const cells = createCellStates([]);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      // 100個の画像パーツが存在することを確認
      for (let i = 0; i < 100; i++) {
        expect(screen.getByTestId(`image-part-${i}`)).toBeInTheDocument();
      }
    });
  });

  describe('セルが開くと対応部分が表示される', () => {
    it('Given 1つのセルが開いている When HiddenImageが表示される Then 対応する画像パーツが表示される', () => {
      // Given
      const cells = createCellStates([0]); // 最初のセルのみ開いている

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      const revealedPart = screen.getByTestId('image-part-0');
      expect(revealedPart).toHaveAttribute('data-revealed', 'true');
      
      // 他のパーツは隠れている
      for (let i = 1; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        expect(part).toHaveAttribute('data-revealed', 'false');
      }
    });

    it('Given 複数のセルが開いている When HiddenImageが表示される Then 対応する複数の画像パーツが表示される', () => {
      // Given
      const cells = createCellStates([0, 5, 10, 50, 99]); // 複数のセルが開いている

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      const revealedIndices = [0, 5, 10, 50, 99];
      revealedIndices.forEach(index => {
        const part = screen.getByTestId(`image-part-${index}`);
        expect(part).toHaveAttribute('data-revealed', 'true');
      });
      
      // 他のパーツは隠れている
      for (let i = 0; i < 100; i++) {
        if (!revealedIndices.includes(i)) {
          const part = screen.getByTestId(`image-part-${i}`);
          expect(part).toHaveAttribute('data-revealed', 'false');
        }
      }
    });

    it('Given 特定の行のセルが全て開いている When HiddenImageが表示される Then その行の画像パーツが全て表示される', () => {
      // Given
      const firstRowIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // 最初の行
      const cells = createCellStates(firstRowIndices);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      firstRowIndices.forEach(index => {
        const part = screen.getByTestId(`image-part-${index}`);
        expect(part).toHaveAttribute('data-revealed', 'true');
      });
      
      // 他の行は隠れている
      for (let i = 10; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        expect(part).toHaveAttribute('data-revealed', 'false');
      }
    });
  });

  describe('段階的に画像が見える', () => {
    it('Given 25%のセルが開いている When HiddenImageが表示される Then 画像の25%が表示される', () => {
      // Given
      const revealedIndices = Array.from({ length: 25 }, (_, i) => i); // 最初の25セル
      const cells = createCellStates(revealedIndices);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      let revealedCount = 0;
      for (let i = 0; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        if (part.getAttribute('data-revealed') === 'true') {
          revealedCount++;
        }
      }
      expect(revealedCount).toBe(25);
    });

    it('Given 50%のセルが開いている When HiddenImageが表示される Then 画像の50%が表示される', () => {
      // Given
      const revealedIndices = Array.from({ length: 50 }, (_, i) => i); // 最初の50セル
      const cells = createCellStates(revealedIndices);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      let revealedCount = 0;
      for (let i = 0; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        if (part.getAttribute('data-revealed') === 'true') {
          revealedCount++;
        }
      }
      expect(revealedCount).toBe(50);
    });

    it('Given 全てのセルが開いている When HiddenImageが表示される Then 画像が完全に表示される', () => {
      // Given
      const revealedIndices = Array.from({ length: 100 }, (_, i) => i); // 全セル
      const cells = createCellStates(revealedIndices);

      // When
      render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells} />);

      // Then
      for (let i = 0; i < 100; i++) {
        const part = screen.getByTestId(`image-part-${i}`);
        expect(part).toHaveAttribute('data-revealed', 'true');
      }
    });

    it('Given セルが段階的に開いていく When 状態が更新される Then 画像が段階的に表示される', () => {
      // Given
      const cells1 = createCellStates([0, 1, 2]);
      const { rerender } = render(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells1} />);

      // Then - 最初は3つだけ表示
      expect(screen.getByTestId('image-part-0')).toHaveAttribute('data-revealed', 'true');
      expect(screen.getByTestId('image-part-1')).toHaveAttribute('data-revealed', 'true');
      expect(screen.getByTestId('image-part-2')).toHaveAttribute('data-revealed', 'true');
      expect(screen.getByTestId('image-part-3')).toHaveAttribute('data-revealed', 'false');

      // When - さらにセルを開く
      const cells2 = createCellStates([0, 1, 2, 3, 4, 5]);
      rerender(<HiddenImage imageUrl={mockPokemonImageUrl} cells={cells2} />);

      // Then - 6つ表示される
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`image-part-${i}`)).toHaveAttribute('data-revealed', 'true');
      }
      expect(screen.getByTestId('image-part-6')).toHaveAttribute('data-revealed', 'false');
    });
  });

  describe('PokeAPI から取得した画像URLの表示', () => {
    it('Given PokeAPIの画像URLが渡される When HiddenImageが表示される Then 画像URLが使用される', () => {
      // Given
      const cells = createCellStates([1]); // 1つのセルが開いている
      const pokeApiImageUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png';

      // When
      render(<HiddenImage imageUrl={pokeApiImageUrl} cells={cells} />);

      // Then - 開いているセルに画像URLが設定されていることを確認
      const revealedPart = screen.getByTestId('image-part-1');
      expect(revealedPart).toHaveStyle({ backgroundImage: `url(${pokeApiImageUrl})` });
    });

    it('Given 異なるポケモンの画像URLが渡される When HiddenImageが表示される Then 正しい画像URLが使用される', () => {
      // Given - 1つのセルを開いた状態
      const cells = createCellStates([0]);
      const pikachuUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

      // When
      render(<HiddenImage imageUrl={pikachuUrl} cells={cells} />);

      // Then - 開いているセルに画像URLが設定されていることを確認
      const part = screen.getByTestId('image-part-0');
      expect(part).toHaveStyle({ backgroundImage: `url(${pikachuUrl})` });
    });

    it('Given 画像URLが更新される When rerenderされる Then 新しい画像URLが使用される', () => {
      // Given - 1つのセルを開いた状態
      const cells = createCellStates([0]);
      const url1 = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png';
      const { rerender } = render(<HiddenImage imageUrl={url1} cells={cells} />);

      // Then - 最初のURL（開いているセルで確認）
      let part = screen.getByTestId('image-part-0');
      expect(part).toHaveStyle({ backgroundImage: `url(${url1})` });

      // When - URLを更新
      const url2 = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
      rerender(<HiddenImage imageUrl={url2} cells={cells} />);

      // Then - 新しいURL（開いているセルで確認）
      part = screen.getByTestId('image-part-0');
      expect(part).toHaveStyle({ backgroundImage: `url(${url2})` });
    });
  });
});
