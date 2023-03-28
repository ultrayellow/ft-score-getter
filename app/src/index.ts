import * as fs from 'fs';
import { ApiClientConfig } from './api-requester/client/ApiClientConfig.js';
import { TokenStore } from './api-requester/client/TokenStore.js';
import { RequestController } from './api-requester/RequestController.js';
import { Coalition, GAM, GON, GUN, LEE } from './coalitionType.js';
import { getMonthFromInput } from './dateUtil.js';
import { toScoresRanks } from './toScoreRanks.js';
import { mapWithUser, UserScoreRank } from './mapWithUser.js';
import { requestScores } from './requestScores.js';

interface CoalitionsScoreRanks {
  readonly gun: UserScoreRank[];
  readonly gon: UserScoreRank[];
  readonly gam: UserScoreRank[];
  readonly lee: UserScoreRank[];
}

const main = async () => {
  const startDate = new Date();
  console.log(
    '\n==================\nstarting process...\n==================\n',
  );

  // todo: display prompt
  // const input = fs.readFileSync('/dev/stdin', { encoding: 'utf-8' });
  const input = process.env.TARGET_MONTH || new Date().getMonth().toString();
  const targetMonth = getMonthFromInput(input);

  const requestController = new RequestController();
  await requestController.addTokenStore(new TokenStore(new ApiClientConfig()));

  console.log(`Time Zone: ${process.env.TZ}`);
  console.log(`Target Month: ${targetMonth + 1}`);

  const coalitionsScoreRanks: CoalitionsScoreRanks = {
    gun: await getCoalitionScoreRank(GUN, targetMonth, requestController),
    gon: await getCoalitionScoreRank(GON, targetMonth, requestController),
    gam: await getCoalitionScoreRank(GAM, targetMonth, requestController),
    lee: await getCoalitionScoreRank(LEE, targetMonth, requestController),
  } as const;

  Object.entries(coalitionsScoreRanks).forEach(([coalitionName, scores]) => {
    console.log(coalitionName, scores);
  });

  await writeResult(targetMonth, coalitionsScoreRanks);

  console.log('\n==================\n...end of process\n==================\n');
  const endDate = new Date();
  console.log(`Elapsed Time: ${endDate.getTime() - startDate.getTime()}ms`);
};

const getCoalitionScoreRank = async (
  coalition: Coalition,
  targetMonth: number,
  requestController: RequestController,
) => {
  const scores = await requestScores(coalition, targetMonth, requestController);
  const scoreRanks = toScoresRanks(scores);
  const userScoreRanks = await mapWithUser(scoreRanks, requestController);

  return userScoreRanks;
};

const writeResult = async (
  targetMonth: number,
  coalitionsScoreRanks: CoalitionsScoreRanks,
) => {
  try {
    const outfile = await fs.promises.open(
      `/var/log/score-getter/${targetMonth + 1}.json`,
      'w',
    );

    try {
      await outfile.write(JSON.stringify(coalitionsScoreRanks, null, '  '));
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
