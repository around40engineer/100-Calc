import { Rarity, type Pokemon, type DifficultyLevel } from '../types/index.js';
import { PokeApiService } from './PokeApiService.js';

export class GachaService {
  private static readonly GACHA_COST = 100;
  private static readonly RARITY_RATES = {
    [Rarity.COMMON]: 0.90,      // 90%
    [Rarity.RARE]: 0.08,         // 8%
    [Rarity.LEGENDARY]: 0.02     // 2%
  };

  // レベル15以上でレア度ブーストを適用
  private static readonly RARE_BOOST_LEVEL = 15;
  private static readonly BOOSTED_RARITY_RATES = {
    [Rarity.COMMON]: 0.70,      // 70% (90% → 70%)
    [Rarity.RARE]: 0.24,         // 24% (8% → 24%)
    [Rarity.LEGENDARY]: 0.06     // 6% (2% → 6%)
  };

  // レア度に基づいてポケモンIDの範囲を決定
  // 伝説・幻のポケモン（各世代の代表的なもの）
  private static readonly RARITY_ID_RANGES = {
    [Rarity.LEGENDARY]: [
      144, 145, 146, 150, 151, // 第1世代
      243, 244, 245, 249, 250, 251, // 第2世代
      377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // 第3世代
      480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, // 第4世代
      638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // 第5世代
      716, 717, 718, 719, 720, 721, // 第6世代
      785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809, // 第7世代
      888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, // 第8世代
      1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1024, 1025 // 第9世代
    ],
    [Rarity.RARE]: [
      3, 6, 9, 65, 68, 76, 94, 130, 131, 143, // 第1世代
      154, 157, 160, 181, 196, 197, 229, 230, 242, // 第2世代
      254, 257, 260, 282, 306, 334, 350, 362, 373, 376, // 第3世代
      445, 448, 460, 465, 473, 474, 475, 476, // 第4世代
      497, 500, 503, 508, 530, 534, 537, 542, 553, 560, 563, 567, 571, 576, 579, 584, 589, 591, 593, 596, 598, 601, 604, 609, 612, 614, 615, 617, 621, 623, 625, 630, 635, // 第5世代
      652, 655, 658, 663, 668, 671, 673, 675, 681, 683, 685, 687, 689, 691, 693, 695, 697, 699, 700, 701, 702, 703, 706, 707, 709, 711, 713, 715, // 第6世代
      724, 727, 730, 733, 735, 738, 740, 743, 745, 748, 750, 752, 754, 756, 758, 760, 763, 764, 765, 766, 768, 770, 771, 773, 776, 778, 780, 784, // 第7世代
      812, 815, 818, 823, 826, 828, 830, 832, 834, 836, 838, 839, 841, 842, 844, 845, 847, 849, 851, 853, 855, 858, 861, 862, 863, 865, 867, 869, 870, 873, 874, 875, 876, 877, 879, 880, 881, 882, 883, 884, 887, // 第8世代
      914, 917, 920, 923, 925, 928, 931, 934, 937, 940, 943, 945, 947, 949, 952, 954, 956, 959, 962, 964, 967, 970, 972, 975, 978, 980, 983, 985, 987, 989, 991, 992, 993, 994, 995, 998, 1000, 1006, 1011, 1012, 1013, 1018, 1020, 1021, 1022, 1023 // 第9世代
    ]
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
        id = Math.floor(Math.random() * 1025) + 1;
      } while (
        this.RARITY_ID_RANGES[Rarity.LEGENDARY].includes(id) ||
        this.RARITY_ID_RANGES[Rarity.RARE].includes(id)
      );
      return id;
    }
  }
}
