import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardModal } from './RewardModal';
import { RewardType, Rarity, type Reward, type Pokemon } from '../../types';

describe('RewardModal', () => {
  let mockPokemon: Pokemon;
  let mockRewards: Reward[];
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // モックポケモンデータ
    mockPokemon = {
      id: 25,
      name: 'pikachu',
      imageUrl: 'https://example.com/pikachu.png',
      rarity: Rarity.COMMON
    };

    // モック報酬データ
    mockRewards = [
      {
        type: RewardType.COMPLETION,
        points: 20,
        pokemon: mockPokemon
      },
      {
        type: RewardType.FIRST_CLEAR,
        points: 100
      },
      {
        type: RewardType.NO_MISTAKES,
        points: 30
      }
    ];

    mockOnClose = vi.fn();
  });

  describe('報酬一覧の表示', () => {
    it('Given RewardModal が開かれる When 報酬データが渡される Then 全ての報酬が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/完了報酬/i)).toBeInTheDocument();
      expect(screen.getByText(/初クリア報酬/i)).toBeInTheDocument();
      expect(screen.getByText(/ノーミス報酬/i)).toBeInTheDocument();
    });

    it('Given 報酬が表示される When 各報酬にポイントが含まれる Then ポイント数が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/20.*pt/i)).toBeInTheDocument();
      expect(screen.getByText(/100.*pt/i)).toBeInTheDocument();
      expect(screen.getByText(/30.*pt/i)).toBeInTheDocument();
    });

    it('Given 報酬が表示される When 合計ポイントを計算する Then 合計ポイントが表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      // 20 + 100 + 30 = 150
      expect(screen.getByText('💰 合計')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && 
               (element?.className.includes('text-4xl') || element?.className.includes('text-5xl')) && 
               content.includes('150') && 
               content.includes('pt');
      })).toBeInTheDocument();
    });

    it('Given モーダルが閉じている When isOpen が false Then モーダルが表示されない', () => {
      // Given & When
      render(<RewardModal isOpen={false} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.queryByText(/完了報酬/i)).not.toBeInTheDocument();
    });
  });

  describe('ポケモン獲得演出', () => {
    it('Given 報酬にポケモンが含まれる When モーダルが開かれる Then ポケモンの画像が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const pokemonImage = screen.getByAltText(/pikachu/i);
      expect(pokemonImage).toBeInTheDocument();
      expect(pokemonImage).toHaveAttribute('src', mockPokemon.imageUrl);
    });

    it('Given 報酬にポケモンが含まれる When モーダルが開かれる Then ポケモンの名前が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/pikachu/i)).toBeInTheDocument();
    });

    it('Given 報酬にポケモンが含まれる When モーダルが開かれる Then ポケモンのレア度が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/ノーマル/i)).toBeInTheDocument();
    });

    it('Given 報酬にポケモンが含まれない When モーダルが開かれる Then ポケモン情報が表示されない', () => {
      // Given
      const rewardsWithoutPokemon: Reward[] = [
        {
          type: RewardType.NEW_RECORD,
          points: 50
        }
      ];

      // When
      render(<RewardModal isOpen={true} rewards={rewardsWithoutPokemon} onClose={mockOnClose} />);

      // Then
      expect(screen.queryByAltText(/pikachu/i)).not.toBeInTheDocument();
    });

    it('Given レジェンダリーポケモンを獲得する When モーダルが開かれる Then 特別な演出が表示される', () => {
      // Given
      const legendaryPokemon: Pokemon = {
        id: 150,
        name: 'mewtwo',
        imageUrl: 'https://example.com/mewtwo.png',
        rarity: Rarity.LEGENDARY
      };

      const rewardsWithLegendary: Reward[] = [
        {
          type: RewardType.COMPLETION,
          points: 60,
          pokemon: legendaryPokemon
        }
      ];

      // When
      render(<RewardModal isOpen={true} rewards={rewardsWithLegendary} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/レジェンド/i)).toBeInTheDocument();
      // 特別な演出を示すクラスやデータ属性を確認
      const pokemonSection = screen.getByTestId('pokemon-display');
      expect(pokemonSection).toHaveAttribute('data-rarity', 'legendary');
    });
  });

  describe('PokeAPI から取得したポケモン情報の表示', () => {
    it('Given PokeAPIから取得したポケモンデータ When 報酬に含まれる Then 正しい画像URLが使用される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const pokemonImage = screen.getByAltText(/pikachu/i) as HTMLImageElement;
      expect(pokemonImage.src).toContain('example.com/pikachu.png');
    });

    it('Given PokeAPIから取得したポケモンデータ When 報酬に含まれる Then ポケモンIDが表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/No\.\s*25/i)).toBeInTheDocument();
    });

    it('Given 複数の報酬タイプがある When ポケモンは1つだけ Then ポケモンは1回だけ表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const pokemonImages = screen.getAllByAltText(/pikachu/i);
      expect(pokemonImages).toHaveLength(1);
    });
  });

  describe('モーダルの操作', () => {
    it('Given モーダルが開いている When 閉じるボタンをクリックする Then onClose が呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // When
      const closeButton = screen.getByRole('button', { name: /閉じる/i });
      await user.click(closeButton);

      // Then
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('Given モーダルが開いている When オーバーレイをクリックする Then onClose が呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // When
      const overlay = screen.getByTestId('modal-overlay');
      await user.click(overlay);

      // Then
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('Given モーダルが開いている When Escapeキーを押す Then onClose が呼ばれる', async () => {
      // Given
      const user = userEvent.setup();
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // When
      await user.keyboard('{Escape}');

      // Then
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  describe('アニメーション演出', () => {
    it('Given モーダルが開かれる When 初期表示される Then アニメーションクラスが適用される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass(/animate/i);
    });

    it('Given ポケモンを獲得する When モーダルが開かれる Then ポケモン画像にアニメーションが適用される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const pokemonDisplay = screen.getByTestId('pokemon-display');
      expect(pokemonDisplay).toHaveClass(/animate/i);
    });

    it('Given 報酬リストが表示される When モーダルが開かれる Then 報酬アイテムにスタガーアニメーションが適用される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={mockRewards} onClose={mockOnClose} />);

      // Then
      const rewardItems = screen.getAllByTestId(/reward-item/i);
      expect(rewardItems.length).toBeGreaterThan(0);
      
      // 各アイテムに異なる遅延が設定されていることを確認
      rewardItems.forEach((item, index) => {
        expect(item).toHaveStyle({ animationDelay: `${index * 0.1}s` });
      });
    });
  });

  describe('エッジケース', () => {
    it('Given 報酬が空配列 When モーダルが開かれる Then エラーにならず空の状態が表示される', () => {
      // Given & When
      render(<RewardModal isOpen={true} rewards={[]} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText('💰 合計')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && 
               (element?.className.includes('text-4xl') || element?.className.includes('text-5xl')) && 
               content.includes('0') && 
               content.includes('pt');
      })).toBeInTheDocument();
    });

    it('Given 報酬が1つだけ When モーダルが開かれる Then 正しく表示される', () => {
      // Given
      const singleReward: Reward[] = [
        {
          type: RewardType.COMPLETION,
          points: 20,
          pokemon: mockPokemon
        }
      ];

      // When
      render(<RewardModal isOpen={true} rewards={singleReward} onClose={mockOnClose} />);

      // Then
      expect(screen.getByText(/完了報酬/i)).toBeInTheDocument();
      expect(screen.getByText('💰 合計')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && 
               (element?.className.includes('text-4xl') || element?.className.includes('text-5xl')) && 
               content.includes('20') && 
               content.includes('pt');
      })).toBeInTheDocument();
    });

    it('Given 非常に大きなポイント数 When 報酬が表示される Then 正しくフォーマットされる', () => {
      // Given
      const largePointRewards: Reward[] = [
        {
          type: RewardType.FIRST_CLEAR,
          points: 999999
        }
      ];

      // When
      render(<RewardModal isOpen={true} rewards={largePointRewards} onClose={mockOnClose} />);

      // Then
      // 合計ポイントの表示を確認（text-4xl または text-5xl クラスを持つ要素）
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && 
               (element?.className.includes('text-4xl') || element?.className.includes('text-5xl')) && 
               content.includes('999,999') && 
               content.includes('pt');
      })).toBeInTheDocument();
    });
  });
});
