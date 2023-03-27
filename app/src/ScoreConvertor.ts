import { ScoreDto } from './ft-dto/ScoresDto.js';

export interface ScoreMap {
  [coalitionUserId: string]: number;
}

export interface ScoreRank {
  coalitionUserId: string;
  value: number;
}

export class ScoreConvertor {
  private static DEFAULT_TARGET_SIZE = 5;

  public static toScoresRanks = (scores: ScoreDto[], targetSize: number = this.DEFAULT_TARGET_SIZE) => {
    const scoresMap = this.toScoresMap(scores);
    const sorted = Object.entries(scoresMap).sort((a, b) => b[1] - a[1]);

    const scoreRanks = sorted.map((curr) => {
      const scoreRank: ScoreRank = {
        coalitionUserId: curr[0],
        value: curr[1],
      };

      return scoreRank;
    });

    const scoreRanksSliced = scoreRanks.slice(0, targetSize);
    return scoreRanksSliced;
  };

  private static toScoresMap = (scores: ScoreDto[]) => {
    const result: ScoreMap = {};

    scores.reduce((acc, curr) => {
      if (!curr.coalitions_user_id) {
        return acc;
      }

      if (!acc[curr.coalitions_user_id.toString()]) {
        acc[curr.coalitions_user_id.toString()] = 0;
      }

      acc[curr.coalitions_user_id.toString()] += curr.value;

      return acc;
    }, result);

    return result;
  };
}
