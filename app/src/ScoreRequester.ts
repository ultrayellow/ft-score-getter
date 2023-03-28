import { RequestController } from './api-requester/RequestController.js';
import { Coalition } from './CoalitionType.js';
import { getPrevMonth } from './dateUtil.js';
import { ScoreDto } from './ft-dto/ScoresDto.js';

function assertsFulfilled<T>(result: PromiseSettledResult<T>[]): asserts result is PromiseFulfilledResult<T>[] {
  if (result.find((res) => res.status === 'rejected')) {
    throw new Error('error when fetching');
  }
}

export class ScoreRequester {
  private static readonly DEFAULT_PAGE_JUMP_SIZE = 10;

  public static request = async (coalition: Coalition, targetMonth: number, requestController: RequestController) => {
    const scores: ScoreDto[] = [];

    // oof :(
    let currPage = 1;
    while (this.needMoreFetch(scores, targetMonth)) {
      const nextPage = this.addScoresRequest(currPage, coalition, requestController);
      currPage = nextPage;

      const currDatas = await this.getScoresResponsesData(requestController);

      scores.push(...currDatas);
    }

    const targetMonthScores = scores.filter((score) => this.isTargetMonthScores(score, targetMonth));
    return targetMonthScores;
  };

  private static needMoreFetch = (scores: ScoreDto[], targetMonth: number) => {
    if (scores.length === 0) {
      return true;
    }

    // todo: 현재 scores api 특성상 크게 문제는 없지만, 이후 문제가 될 가능성 있음.
    // todo: dayjs
    const prevMonth = getPrevMonth(targetMonth);
    return prevMonth !== new Date(scores[scores.length - 1].created_at).getMonth();
  };

  private static addScoresRequest = (currPage: number, coalition: Coalition, requestController: RequestController) => {
    for (let i = 0; i < this.DEFAULT_PAGE_JUMP_SIZE; i++) {
      requestController.addRequestPool(`coalitions/${coalition.id}/scores?page[size]=100&page[number]=${currPage + i}`);
    }

    return currPage + this.DEFAULT_PAGE_JUMP_SIZE;
  };

  private static getScoresResponsesData = async (requestController: RequestController) => {
    const responses = await requestController.awaitRequestPool();
    // todo: this throws
    assertsFulfilled(responses);

    // todo: zod
    const jsons = responses.map((res): Promise<ScoreDto[]> => res.value.json());
    const allPageDatas = (await Promise.all(jsons)).flat();

    return allPageDatas;
  };

  private static isTargetMonthScores = (score: ScoreDto, targetMonth: number) => {
    const scoreCreatedMonth = new Date(score.created_at).getMonth();

    return targetMonth === scoreCreatedMonth;
  };
}
