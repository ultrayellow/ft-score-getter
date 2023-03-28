import * as fs from 'fs';
import { ApiClientConfig } from './api-requester/client/ApiClientConfig.js';
import { TokenStore } from './api-requester/client/TokenStore.js';
import { RequestController } from './api-requester/RequestController.js';
import { Coalition, GAM, GON, GUN, LEE } from './CoalitionType.js';
import { getMonthFromInput } from './dateUtil.js';
import { ScoreMapper, UserScoreRank } from './ScoreMapper.js';
import { ScoreRequester } from './ScoreRequester.js';

const main = async () => {
  const startDate = new Date();
  console.log('\n==================\nstarting process...\n==================\n');

  // todo: display prompt
  // const input = fs.readFileSync('/dev/stdin', { encoding: 'utf-8' });
  const input = process.env.TARGET_MONTH || new Date().getMonth().toString();
  const targetMonth = getMonthFromInput(input);

  const requestController = new RequestController();
  await requestController.addTokenStore(new TokenStore(new ApiClientConfig()));

  const responses = await requestController.awaitRequestPool();
  console.log(responses);

  console.log(`Time Zone: ${process.env.TZ}`);
  console.log(`Target Month: ${targetMonth + 1}`);

  const gunUserScoreRanks = await getCoalitionScoreRank(GUN, targetMonth, requestController);
  const gonUserScoreRanks = await getCoalitionScoreRank(GON, targetMonth, requestController);
  const gamUserScoreRanks = await getCoalitionScoreRank(GAM, targetMonth, requestController);
  const leeUserScoreRanks = await getCoalitionScoreRank(LEE, targetMonth, requestController);

  console.log(gunUserScoreRanks);
  console.log(gonUserScoreRanks);
  console.log(gamUserScoreRanks);
  console.log(leeUserScoreRanks);

  await writeResult(targetMonth, GUN, gunUserScoreRanks);
  await writeResult(targetMonth, GON, gonUserScoreRanks);
  await writeResult(targetMonth, GAM, gamUserScoreRanks);
  await writeResult(targetMonth, LEE, leeUserScoreRanks);

  console.log('\n==================\n...end of process\n==================\n');
  const endDate = new Date();
  console.log(`Elapsed Time: ${endDate.getTime() - startDate.getTime()}ms`);
};

const getCoalitionScoreRank = async (
  coalition: Coalition,
  targetMonth: number,
  requestController: RequestController
) => {
  const scores = await ScoreRequester.request(coalition, targetMonth, requestController);
  const scoreRanks = toScoresRanks(scores);
  const userScoreRanks = await ScoreMapper.mapWithUser(scoreRanks, requestController);

  return userScoreRanks;
};

const writeResult = async (targetMonth: number, coalition: Coalition, scoreRanks: UserScoreRank[]) => {
  try {
    await fs.promises.mkdir(`/var/log/score-getter/${targetMonth + 1}`, { recursive: true });
    const outfile = await fs.promises.open(`/var/log/score-getter/${targetMonth + 1}/${coalition.name}.json`, 'w');

    try {
      await outfile.write(JSON.stringify(scoreRanks, null, '  '));
    } catch (e) {
      console.error('file write failed. use terminal output.');
    } finally {
      await outfile.close();
    }
  } catch (e) {
    console.error('file open failed. use terminal output.');
  }
};

main();
