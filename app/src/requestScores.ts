import { RequestController } from './api-requester/RequestController.js';
import { assertsFulfilled } from './asserts.js';
import { Coalition } from './coalitionType.js';
import { getPrevMonth } from './dateUtil.js';
import { Score, ScoreDto, scoreSchema } from './ft-dto/ScoresDto.js';

// todo: config here
const DEFAULT_PAGE_JUMP_SIZE = 10;

export const requestScores = async (
  coalition: Coalition,
  targetMonth: number,
  requestController: RequestController,
) => {
  const scores: Score[] = [];

  let currPage = 1;
  while (needMoreFetch(scores, targetMonth)) {
    const nextPage = addScoresRequest(currPage, coalition, requestController);
    currPage = nextPage;

    const currDatas = await getScoresResponsesData(requestController);

    scores.push(...scoreSchema.array().parse(currDatas));
  }

  const targetMonthScores = scores.filter((score) =>
    isTargetMonthScores(score, targetMonth),
  );

  return targetMonthScores;
};

const needMoreFetch = (scores: Score[], targetMonth: number) => {
  if (scores.length === 0) {
    return true;
  }

  // todo: 현재 scores api 특성상 크게 문제는 없지만, 이후 문제가 될 가능성 있음.
  // todo: dayjs
  const prevMonth = getPrevMonth(targetMonth);

  return (
    scores.find(
      (score) => new Date(score.created_at).getMonth() === prevMonth,
    ) === undefined
  );
};

const addScoresRequest = (
  currPage: number,
  coalition: Coalition,
  requestController: RequestController,
) => {
  for (let i = 0; i < DEFAULT_PAGE_JUMP_SIZE; i++) {
    requestController.addRequestPool(
      `coalitions/${coalition.id}/scores?page[size]=100&page[number]=${
        currPage + i
      }`,
    );
  }

  return currPage + DEFAULT_PAGE_JUMP_SIZE;
};

const getScoresResponsesData = async (requestController: RequestController) => {
  const responses = await requestController.awaitRequestPool();
  // todo: this throws
  assertsFulfilled(responses);

  // todo: zod
  const jsons = responses.map((res): Promise<ScoreDto[]> => res.value.json());
  const allPageDatas = (await Promise.all(jsons)).flat();

  return allPageDatas;
};

const isTargetMonthScores = (score: Score, targetMonth: number) => {
  const scoreCreatedMonth = new Date(score.created_at).getMonth();

  return targetMonth === scoreCreatedMonth;
};
