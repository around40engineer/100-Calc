import { LevelConfigService } from './src/services/LevelConfigService';

// Test getLevelConfig for various levels
console.log('Testing getLevelConfig...');
console.log('Level 1:', LevelConfigService.getLevelConfig(1).name);
console.log('Level 10:', LevelConfigService.getLevelConfig(10).name);
console.log('Level 20:', LevelConfigService.getLevelConfig(20).name);

// Test that all levels return valid configs
for (let i = 1; i <= 20; i++) {
  const config = LevelConfigService.getLevelConfig(i as any);
  if (!config || config.level !== i) {
    console.error(`Failed for level ${i}`);
    process.exit(1);
  }
}

console.log('✓ All 20 levels return valid configs');
console.log('✓ getLevelConfig function works correctly');
