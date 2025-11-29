import { describe, it, expect } from 'vitest';
import { ProblemGenerator } from './ProblemGenerator.js';
import { Difficulty, OperationType, type Problem, type DifficultyLevel } from '../types/index.js';

describe('ProblemGenerator', () => {
  describe('簡単モードの問題生成', () => {
    it('Given 簡単モードが選択された When 100問生成する Then 全て1桁の足し算または引き算である', () => {
      // Given
      const difficulty = Difficulty.EASY;
      const count = 100;
      
      // When
      const problems = ProblemGenerator.generate(difficulty, count);
      
      // Then
      expect(problems).toHaveLength(100);
      problems.forEach((problem: Problem) => {
        expect(problem.operand1).toBeGreaterThanOrEqual(0);
        expect(problem.operand1).toBeLessThanOrEqual(9);
        expect(problem.operand2).toBeGreaterThanOrEqual(0);
        expect(problem.operand2).toBeLessThanOrEqual(9);
        expect([OperationType.ADDITION, OperationType.SUBTRACTION])
          .toContain(problem.operation);
      });
    });
    
    it('Given 引き算問題が生成される When 計算する Then 答えは負の数にならない', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.EASY, 100)
        .filter((p: Problem) => p.operation === OperationType.SUBTRACTION);
      
      // Then
      problems.forEach((problem: Problem) => {
        expect(problem.answer).toBeGreaterThanOrEqual(0);
        expect(problem.answer).toBe(problem.operand1 - problem.operand2);
      });
    });

    it('Given 簡単モードの問題 When 答えを計算する Then 正しい答えが設定されている', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.EASY, 50);
      
      // Then
      problems.forEach((problem: Problem) => {
        const expectedAnswer = problem.operation === OperationType.ADDITION
          ? problem.operand1 + problem.operand2
          : problem.operand1 - problem.operand2;
        expect(problem.answer).toBe(expectedAnswer);
      });
    });

    it('Given 簡単モードの問題 When 生成する Then 各問題にユニークなIDが付与される', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.EASY, 100);
      
      // Then
      const ids = problems.map((p: Problem) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });
  });

  describe('普通モードの問題生成', () => {
    it('Given 普通モードが選択された When 100問生成する Then 全て1桁の掛け算である', () => {
      // Given
      const difficulty = Difficulty.NORMAL;
      const count = 100;
      
      // When
      const problems = ProblemGenerator.generate(difficulty, count);
      
      // Then
      expect(problems).toHaveLength(100);
      problems.forEach((problem: Problem) => {
        expect(problem.operand1).toBeGreaterThanOrEqual(0);
        expect(problem.operand1).toBeLessThanOrEqual(9);
        expect(problem.operand2).toBeGreaterThanOrEqual(0);
        expect(problem.operand2).toBeLessThanOrEqual(9);
        expect(problem.operation).toBe(OperationType.MULTIPLICATION);
      });
    });

    it('Given 普通モードの問題 When 答えを計算する Then 正しい答えが設定されている', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.NORMAL, 50);
      
      // Then
      problems.forEach((problem: Problem) => {
        const expectedAnswer = problem.operand1 * problem.operand2;
        expect(problem.answer).toBe(expectedAnswer);
      });
    });
  });

  describe('難しいモードの問題生成', () => {
    it('Given 難しいモードが選択された When 100問生成する Then 全て2桁の計算である', () => {
      // Given
      const difficulty = Difficulty.HARD;
      const count = 100;
      
      // When
      const problems = ProblemGenerator.generate(difficulty, count);
      
      // Then
      expect(problems).toHaveLength(100);
      problems.forEach((problem: Problem) => {
        // 少なくとも一方のオペランドが2桁（10-99）
        const hasTwoDigit = problem.operand1 >= 10 || problem.operand2 >= 10;
        expect(hasTwoDigit).toBe(true);
        expect(problem.operand1).toBeGreaterThanOrEqual(0);
        expect(problem.operand1).toBeLessThanOrEqual(99);
        expect(problem.operand2).toBeGreaterThanOrEqual(0);
        expect(problem.operand2).toBeLessThanOrEqual(99);
        expect([
          OperationType.ADDITION,
          OperationType.SUBTRACTION,
          OperationType.MULTIPLICATION
        ]).toContain(problem.operation);
      });
    });

    it('Given 難しいモードの引き算問題 When 計算する Then 答えは負の数にならない', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.HARD, 100)
        .filter((p: Problem) => p.operation === OperationType.SUBTRACTION);
      
      // Then
      problems.forEach((problem: Problem) => {
        expect(problem.answer).toBeGreaterThanOrEqual(0);
        expect(problem.answer).toBe(problem.operand1 - problem.operand2);
      });
    });

    it('Given 難しいモードの問題 When 答えを計算する Then 正しい答えが設定されている', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.HARD, 50);
      
      // Then
      problems.forEach((problem: Problem) => {
        let expectedAnswer = 0;
        switch (problem.operation) {
          case OperationType.ADDITION:
            expectedAnswer = problem.operand1 + problem.operand2;
            break;
          case OperationType.SUBTRACTION:
            expectedAnswer = problem.operand1 - problem.operand2;
            break;
          case OperationType.MULTIPLICATION:
            expectedAnswer = problem.operand1 * problem.operand2;
            break;
        }
        expect(problem.answer).toBe(expectedAnswer);
      });
    });
  });

  describe('問題生成の一般的な振る舞い', () => {
    it('Given 任意の難易度 When 0問生成する Then 空の配列が返される', () => {
      // Given & When
      const problems = ProblemGenerator.generate(Difficulty.EASY, 0);
      
      // Then
      expect(problems).toHaveLength(0);
    });

    it('Given 任意の難易度 When 問題を生成する Then 全ての問題にIDが付与される', () => {
      // Given & When
      const easyProblems = ProblemGenerator.generate(Difficulty.EASY, 10);
      const normalProblems = ProblemGenerator.generate(Difficulty.NORMAL, 10);
      const hardProblems = ProblemGenerator.generate(Difficulty.HARD, 10);
      
      // Then
      [...easyProblems, ...normalProblems, ...hardProblems].forEach((problem: Problem) => {
        expect(problem.id).toBeDefined();
        expect(typeof problem.id).toBe('string');
        expect(problem.id.length).toBeGreaterThan(0);
      });
    });
  });
});

  describe('レベルベースの問題生成', () => {
    describe('レベル1-5: 1桁の足し算', () => {
      it('Given レベル1が選択された When 50問生成する Then 全て0-5の範囲の足し算である', () => {
        // Given
        const level: DifficultyLevel = 1;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(0);
          expect(problem.operand1).toBeLessThanOrEqual(5);
          expect(problem.operand2).toBeGreaterThanOrEqual(0);
          expect(problem.operand2).toBeLessThanOrEqual(5);
          expect(problem.operation).toBe(OperationType.ADDITION);
          expect(problem.answer).toBe(problem.operand1 + problem.operand2);
        });
      });

      it('Given レベル3が選択された When 50問生成する Then 全て0-9の範囲の足し算である', () => {
        // Given
        const level: DifficultyLevel = 3;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(0);
          expect(problem.operand1).toBeLessThanOrEqual(9);
          expect(problem.operand2).toBeGreaterThanOrEqual(0);
          expect(problem.operand2).toBeLessThanOrEqual(9);
          expect(problem.operation).toBe(OperationType.ADDITION);
        });
      });
    });

    describe('レベル6-10: 1桁の引き算・掛け算', () => {
      it('Given レベル6が選択された When 50問生成する Then 全て0-9の範囲の引き算である', () => {
        // Given
        const level: DifficultyLevel = 6;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(0);
          expect(problem.operand1).toBeLessThanOrEqual(9);
          expect(problem.operand2).toBeGreaterThanOrEqual(0);
          expect(problem.operand2).toBeLessThanOrEqual(9);
          expect(problem.operation).toBe(OperationType.SUBTRACTION);
          expect(problem.answer).toBeGreaterThanOrEqual(0);
        });
      });

      it('Given レベル8が選択された When 50問生成する Then 全て0-5の範囲の掛け算である', () => {
        // Given
        const level: DifficultyLevel = 8;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(0);
          expect(problem.operand1).toBeLessThanOrEqual(5);
          expect(problem.operand2).toBeGreaterThanOrEqual(0);
          expect(problem.operand2).toBeLessThanOrEqual(5);
          expect(problem.operation).toBe(OperationType.MULTIPLICATION);
        });
      });

      it('Given レベル10が選択された When 50問生成する Then 足し算・引き算・掛け算が混在する', () => {
        // Given
        const level: DifficultyLevel = 10;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        const operations = new Set(problems.map(p => p.operation));
        expect(operations.size).toBeGreaterThan(1); // 複数の演算タイプが含まれる
      });
    });

    describe('レベル11-15: 2桁の足し算・引き算', () => {
      it('Given レベル11が選択された When 50問生成する Then 全て10-50の範囲の足し算である', () => {
        // Given
        const level: DifficultyLevel = 11;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(10);
          expect(problem.operand1).toBeLessThanOrEqual(50);
          expect(problem.operand2).toBeGreaterThanOrEqual(10);
          expect(problem.operand2).toBeLessThanOrEqual(50);
          expect(problem.operation).toBe(OperationType.ADDITION);
        });
      });

      it('Given レベル14が選択された When 50問生成する Then 全て10-99の範囲の引き算である', () => {
        // Given
        const level: DifficultyLevel = 14;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(10);
          expect(problem.operand1).toBeLessThanOrEqual(99);
          expect(problem.operand2).toBeGreaterThanOrEqual(10);
          expect(problem.operand2).toBeLessThanOrEqual(99);
          expect(problem.operation).toBe(OperationType.SUBTRACTION);
          expect(problem.answer).toBeGreaterThanOrEqual(0);
        });
      });
    });

    describe('レベル16-20: 2桁の掛け算', () => {
      it('Given レベル16が選択された When 50問生成する Then 全て10-20の範囲の掛け算である', () => {
        // Given
        const level: DifficultyLevel = 16;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(10);
          expect(problem.operand1).toBeLessThanOrEqual(20);
          expect(problem.operand2).toBeGreaterThanOrEqual(10);
          expect(problem.operand2).toBeLessThanOrEqual(20);
          expect(problem.operation).toBe(OperationType.MULTIPLICATION);
        });
      });

      it('Given レベル19が選択された When 50問生成する Then 全て10-99の範囲の掛け算である', () => {
        // Given
        const level: DifficultyLevel = 19;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        problems.forEach((problem: Problem) => {
          expect(problem.operand1).toBeGreaterThanOrEqual(10);
          expect(problem.operand1).toBeLessThanOrEqual(99);
          expect(problem.operand2).toBeGreaterThanOrEqual(10);
          expect(problem.operand2).toBeLessThanOrEqual(99);
          expect(problem.operation).toBe(OperationType.MULTIPLICATION);
        });
      });

      it('Given レベル20が選択された When 50問生成する Then 全ての演算タイプが含まれる', () => {
        // Given
        const level: DifficultyLevel = 20;
        const count = 50;
        
        // When
        const problems = ProblemGenerator.generateForLevel(level, count);
        
        // Then
        expect(problems).toHaveLength(50);
        const operations = new Set(problems.map(p => p.operation));
        expect(operations.size).toBeGreaterThan(1); // 複数の演算タイプが含まれる
      });
    });

    describe('一般的な振る舞い', () => {
      it('Given 任意のレベル When 問題を生成する Then 正しい答えが設定されている', () => {
        // Given & When
        const levels: DifficultyLevel[] = [1, 5, 10, 15, 20];
        
        levels.forEach(level => {
          const problems = ProblemGenerator.generateForLevel(level, 20);
          
          // Then
          problems.forEach((problem: Problem) => {
            let expectedAnswer = 0;
            switch (problem.operation) {
              case OperationType.ADDITION:
                expectedAnswer = problem.operand1 + problem.operand2;
                break;
              case OperationType.SUBTRACTION:
                expectedAnswer = problem.operand1 - problem.operand2;
                break;
              case OperationType.MULTIPLICATION:
                expectedAnswer = problem.operand1 * problem.operand2;
                break;
            }
            expect(problem.answer).toBe(expectedAnswer);
          });
        });
      });

      it('Given 任意のレベル When 問題を生成する Then 各問題にユニークなIDが付与される', () => {
        // Given & When
        const problems = ProblemGenerator.generateForLevel(10, 100);
        
        // Then
        const ids = problems.map((p: Problem) => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(100);
      });
    });
  });
