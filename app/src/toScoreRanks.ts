import { groupBy } from './deno-util/groupBy.js';
import { mapValues } from './deno-util/mapValue.js';
import { sortBy } from './deno-util/sortBy.js';
import { sumOf } from './deno-util/sumOf.js';
import { ScoreDto } from './ft-dto/ScoresDto.js';

export interface ScoreRank {
  coalitionUserId: string;
  value: number;
}

const DEFAULT_TARGET_SIZE = 5;

// prettier-ignore
export const toScoresRanks = (scores: ScoreDto[], targetSize: number = DEFAULT_TARGET_SIZE): ScoreRank[] => {
  const scoresFiltered = scores.filter(({ coalitions_user_id }) => coalitions_user_id);
  const scoresGrouped = groupBy(scoresFiltered, (it) => it.coalitions_user_id.toString());
  // hmm...
  const scoresSumed = mapValues(scoresGrouped, (dtos) => (dtos ? sumOf(dtos, (it) => it.value) : 0));
  const scoreRanks = Object.entries(scoresSumed).map(([coalitionUserId, value]) => ({ coalitionUserId, value }));
  const sorted = sortBy(scoreRanks, (it) => -it.value);

  const scoreRanksSliced = sorted.slice(0, targetSize);
  return scoreRanksSliced;
};
