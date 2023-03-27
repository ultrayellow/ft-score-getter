import { RequestController } from './api-requester/RequestController.js';
import { getPrevMonth } from './dateUtil.js';
import { ScoreDto } from './ft-dto/ScoresDto.js';

export class ScoreRequester {
  private static readonly DEFAULT_PAGE_JUMP_SIZE = 10;

  public static request = async (coalitionId: number, targetMonth: number, requestController: RequestController) => {
    const scores: ScoreDto[] = [];

    // oof :(
    let currPage = 1;
    while (this.needMoreFetch(scores, targetMonth)) {
      const nextPage = this.addScoresRequest(currPage, coalitionId, requestController);
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
    const prevMonth = getPrevMonth(targetMonth);
    return prevMonth !== new Date(scores[scores.length - 1].created_at).getMonth();
  };

  private static addScoresRequest = (currPage: number, coalitionId: number, requestController: RequestController) => {
    for (let i = 0; i < this.DEFAULT_PAGE_JUMP_SIZE; i++) {
      requestController.addRequestPool(`coalitions/${coalitionId}/scores?page[size]=100&page[number]=${currPage + i}`);
    }

    return currPage + this.DEFAULT_PAGE_JUMP_SIZE;
  };

  private static getScoresResponsesData = async (requestController: RequestController) => {
    const allPageDatas: ScoreDto[] = [];

    const responses = await requestController.awaitRequestPool();

    for (const response of responses) {
      if (response.status === 'rejected') {
        console.error('fetch fail occurred. should not use result of this process.');
        break;
      }

      const singlePageDatas = await response.value.json();
      allPageDatas.push(...singlePageDatas);
    }

    return allPageDatas;
  };

  private static isTargetMonthScores = (score: ScoreDto, targetMonth: number) => {
    const scoreCreatedMonth = new Date(score.created_at).getMonth();

    return targetMonth === scoreCreatedMonth;
  };
}
