import { RequestController } from './api-requester/RequestController.js';
import { assertsFulfilled } from './asserts.js';
import { CoalitionsUsersDto } from './ft-dto/CoalitinosUsersDto.js';
import { ScoreRank } from './toScoreRanks.js';

export interface UserScoreRank extends ScoreRank {
  userId: string;
  login: string;
}

export const mapWithUser = async (
  scoreRanks: ScoreRank[],
  requestController: RequestController,
): Promise<UserScoreRank[]> => {
  const uids = await requestUserIds(scoreRanks, requestController);
  const logins = await requestUserLogins(uids, requestController);

  const result = scoreRanks.map(({ coalitionUserId, value }, index) => ({
    userId: uids[index],
    login: logins[index],
    coalitionUserId,
    value,
  }));

  return result;
};

const requestUserIds = async (
  scoreRanks: ScoreRank[],
  requestController: RequestController,
) => {
  for (const scoreRank of scoreRanks) {
    requestController.addRequestPool(
      `coalitions_users/${scoreRank.coalitionUserId}`,
    );
  }

  const responses = await requestController.awaitRequestPool();
  assertsFulfilled(responses);

  const jsons = responses.map(
    (res): Promise<CoalitionsUsersDto[]> => res.value.json(),
  );

  const coalitionsUsers = (await Promise.all(jsons)).flat();
  const uids = coalitionsUsers.map((coalitionsUser) =>
    coalitionsUser.user_id.toString(),
  );

  return uids;
};

const requestUserLogins = async (
  userIds: string[],
  requestController: RequestController,
) => {
  for (const userId of userIds) {
    requestController.addRequestPool(`users/${userId}`);
  }

  const responses = await requestController.awaitRequestPool();
  assertsFulfilled(responses);

  const jsons = responses.map((res) => res.value.json());
  // todo: has any type, expect UserDto
  const users = (await Promise.all(jsons)).flat();
  const logins = users.map((user) => user.login);

  return logins;
};
