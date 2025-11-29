import type { CellState } from '../../types';

interface HiddenImageProps {
  imageUrl: string;
  cells: CellState[][];
}

export const HiddenImage = ({ imageUrl, cells }: HiddenImageProps) => {
  // 10x10グリッドのセル状態をフラット配列に変換
  const flatCells = cells.flat();

  return (
    <>
      {flatCells.map((cell, index) => (
        <div
          key={index}
          data-testid={`image-part-${index}`}
          data-revealed={cell.isRevealed}
          className="relative transition-all duration-300 aspect-square"
          style={{
            backgroundColor: cell.isRevealed ? 'transparent' : 'rgba(200, 200, 200, 0.95)',
            backgroundImage: cell.isRevealed ? `url(${imageUrl})` : 'none',
            backgroundSize: '1000% 1000%',
            backgroundPosition: `${(index % 10) * 11.111}% ${Math.floor(index / 10) * 11.111}%`
          }}
        />
      ))}
    </>
  );
};
