import * as fs from 'fs';
import { ApiClientConfig } from './api-requester/client/ApiClientConfig.js';
import { TokenStore } from './api-requester/client/TokenStore.js';
import { RequestController } from './api-requester/RequestController.js';
import { getMonthFromInput } from './dateUtil.js';
import { ScoreConvertor } from './ScoreConvertor.js';
import { ScoreMapper } from './ScoreMapper.js';
import { ScoreRequester } from './ScoreRequester.js';

export enum CoalitionId {
  GUN = 85,
  GON,
  GAM,
  LEE,
}

const main = async () => {
  const startDate = new Date();
  console.log('\n==================\nstarting process...\n==================\n');

  // todo: display prompt
  // const input = fs.readFileSync('/dev/stdin', { encoding: 'utf-8' });
  const input = '3';
  const targetMonth = getMonthFromInput(input);

  const requestController = new RequestController();
  await requestController.addTokenStore(new TokenStore(new ApiClientConfig()));

  console.log(`TimeZone: ${process.env.TZ}`);
  console.log(`month: ${targetMonth}`);

  const gunUserScoreRanks = await getCoalitionScoreRank(CoalitionId.GUN, targetMonth, requestController);
  const gonUserScoreRanks = await getCoalitionScoreRank(CoalitionId.GON, targetMonth, requestController);
  const gamUserScoreRanks = await getCoalitionScoreRank(CoalitionId.GAM, targetMonth, requestController);
  const leeUserScoreRanks = await getCoalitionScoreRank(CoalitionId.LEE, targetMonth, requestController);

  console.log(gunUserScoreRanks);
  console.log(gonUserScoreRanks);
  console.log(gamUserScoreRanks);
  console.log(leeUserScoreRanks);

  console.log('\n==================\n...end of process\n==================\n');
  const endDate = new Date();
  console.log(`time: ${endDate.getTime() - startDate.getTime()}ms`);
};

const getCoalitionScoreRank = async (
  coalitionId: number,
  targetMonth: number,
  requestController: RequestController
) => {
  const scores = await ScoreRequester.request(coalitionId, targetMonth, requestController);
  const scoreRanks = ScoreConvertor.toScoresRanks(scores);
  const userScoreRanks = await ScoreMapper.mapWithUser(scoreRanks, requestController);

  return userScoreRanks;
};

main();
