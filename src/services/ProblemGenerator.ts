import { Difficulty, OperationType, type Problem, type DifficultyLevel } from '../types';
import { LevelConfigService } from './LevelConfigService';

export class ProblemGenerator {
  /**
   * 指定されたレベルで指定数の問題を生成する
   */
  static generateForLevel(level: DifficultyLevel, count: number): Problem[] {
    const config = LevelConfigService.getLevelConfig(level);
    const problems: Problem[] = [];
    
    for (let i = 0; i < count; i++) {
      const problem = this.generateProblemFromConfig(config);
      problems.push(problem);
    }
    
    return problems;
  }

  /**
   * 指定された難易度で指定数の問題を生成する
   */
  static generate(difficulty: Difficulty, count: number): Problem[] {
    const problems: Problem[] = [];
    
    for (let i = 0; i < count; i++) {
      let problem: Problem;
      
      switch (difficulty) {
        case Difficulty.EASY:
          problem = this.generateEasyProblem();
          break;
        case Difficulty.NORMAL:
          problem = this.generateNormalProblem();
          break;
        case Difficulty.HARD:
          problem = this.generateHardProblem();
          break;
      }
      
      problems.push(problem);
    }
    
    return problems;
  }
  
  /**
   * 簡単モードの問題を生成（1桁の足し算・引き算）
   */
  private static generateEasyProblem(): Problem {
    const operand1 = Math.floor(Math.random() * 10);
    const operand2 = Math.floor(Math.random() * 10);
    const operation = Math.random() < 0.5 
      ? OperationType.ADDITION 
      : OperationType.SUBTRACTION;
    
    // 引き算の場合、負の数にならないように調整
    if (operation === OperationType.SUBTRACTION && operand1 < operand2) {
      return {
        id: this.generateId(),
        operand1: operand2,
        operand2: operand1,
        operation,
        answer: operand2 - operand1
      };
    }
    
    return {
      id: this.generateId(),
      operand1,
      operand2,
      operation,
      answer: operation === OperationType.ADDITION 
        ? operand1 + operand2 
        : operand1 - operand2
    };
  }
  
  /**
   * 普通モードの問題を生成（1桁の掛け算）
   */
  private static generateNormalProblem(): Problem {
    const operand1 = Math.floor(Math.random() * 10);
    const operand2 = Math.floor(Math.random() * 10);
    
    return {
      id: this.generateId(),
      operand1,
      operand2,
      operation: OperationType.MULTIPLICATION,
      answer: operand1 * operand2
    };
  }
  
  /**
   * 難しいモードの問題を生成（2桁の足し算・引き算・掛け算）
   */
  private static generateHardProblem(): Problem {
    // ランダムに演算タイプを選択
    const operations = [
      OperationType.ADDITION,
      OperationType.SUBTRACTION,
      OperationType.MULTIPLICATION
    ];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // 少なくとも一方は2桁にする
    const useTwoDigits = Math.random() < 0.8; // 80%の確率で2桁を含む
    
    let operand1: number;
    let operand2: number;
    
    if (useTwoDigits) {
      // 一方または両方を2桁にする
      if (Math.random() < 0.5) {
        // 両方2桁
        operand1 = Math.floor(Math.random() * 90) + 10; // 10-99
        operand2 = Math.floor(Math.random() * 90) + 10; // 10-99
      } else {
        // 一方だけ2桁
        operand1 = Math.floor(Math.random() * 90) + 10; // 10-99
        operand2 = Math.floor(Math.random() * 100); // 0-99
      }
    } else {
      // 両方1桁または2桁の範囲
      operand1 = Math.floor(Math.random() * 100); // 0-99
      operand2 = Math.floor(Math.random() * 100); // 0-99
    }
    
    // 引き算の場合、負の数にならないように調整
    if (operation === OperationType.SUBTRACTION && operand1 < operand2) {
      [operand1, operand2] = [operand2, operand1];
    }
    
    let answer: number;
    switch (operation) {
      case OperationType.ADDITION:
        answer = operand1 + operand2;
        break;
      case OperationType.SUBTRACTION:
        answer = operand1 - operand2;
        break;
      case OperationType.MULTIPLICATION:
        answer = operand1 * operand2;
        break;
    }
    
    return {
      id: this.generateId(),
      operand1,
      operand2,
      operation,
      answer
    };
  }
  
  /**
   * レベル設定に基づいて問題を生成
   */
  private static generateProblemFromConfig(config: import('../types').LevelConfig): Problem {
    const { operationTypes, numberRange } = config;
    
    // ランダムに演算タイプを選択
    const operation = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    
    // 数値範囲内でランダムな数値を生成
    const operand1 = Math.floor(Math.random() * (numberRange.max - numberRange.min + 1)) + numberRange.min;
    const operand2 = Math.floor(Math.random() * (numberRange.max - numberRange.min + 1)) + numberRange.min;
    
    // 引き算の場合、負の数にならないように調整
    if (operation === OperationType.SUBTRACTION && operand1 < operand2) {
      return {
        id: this.generateId(),
        operand1: operand2,
        operand2: operand1,
        operation,
        answer: operand2 - operand1
      };
    }
    
    let answer: number;
    switch (operation) {
      case OperationType.ADDITION:
        answer = operand1 + operand2;
        break;
      case OperationType.SUBTRACTION:
        answer = operand1 - operand2;
        break;
      case OperationType.MULTIPLICATION:
        answer = operand1 * operand2;
        break;
    }
    
    return {
      id: this.generateId(),
      operand1,
      operand2,
      operation,
      answer
    };
  }

  /**
   * ユニークなIDを生成
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
