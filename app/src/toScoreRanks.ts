import { assertGroupBySuccess, groupBy } from './deno-util/groupBy.js';
import { mapValues } from './deno-util/mapValue.js';
import { sortBy } from './deno-util/sortBy.js';
import { sumOf } from './deno-util/sumOf.js';
import { Score } from './ft-dto/ScoresDto.js';

export interface ScoreRank {
  coalitionUserId: string;
  value: number;
}

const DEFAULT_TARGET_SIZE = 5;

// prettier-ignore
export const toScoresRanks = (scores: Score[], targetSize: number = DEFAULT_TARGET_SIZE): ScoreRank[] => {
  const scoresFiltered = scores.filter(({ coalitions_user_id }) => coalitions_user_id);
  assertIsUserScore(scoresFiltered);

  const scoresGrouped = groupBy(scoresFiltered, (it) => it.coalitions_user_id);
  assertGroupBySuccess(scoresGrouped);

  const scoresSumed = mapValues(scoresGrouped, (scores) => (sumOf(scores, (it) => it.value)))
  const scoreRanks = Object.entries(scoresSumed).map(([coalitionUserId, value]) => ({ coalitionUserId, value }));
  const sorted = sortBy(scoreRanks, (it) => -it.value);

  const scoreRanksSliced = sorted.slice(0, targetSize);
  return scoreRanksSliced;
};

/**
 * @description coalition 자체에 부여된 점수가 아니라, 유저에게 부여된 점수라는 것을 단언합니다.
*/
function assertIsUserScore(scores: Score[]): asserts scores is (Omit<Score, 'coalitions_user_id'> & { coalitions_user_id: number })[] {
  if (scores.find((score) => !score.coalitions_user_id)) {
    throw new Error("need to filter coalition's score.");
  }
}
