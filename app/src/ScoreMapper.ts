import { RequestController } from './api-requester/RequestController.js';
import { CoalitionsUsersDto } from './ft-dto/CoalitinosUsersDto.js';
import { ScoreRank } from './ScoreConvertor.js';

export interface UserScoreRank extends ScoreRank {
  userId: string;
  login: string;
}

export class ScoreMapper {
  public static mapWithUser = async (scoreRanks: ScoreRank[], requestController: RequestController) => {
    const uids = await this.requestUserIds(scoreRanks, requestController);
    const logins = await this.requestUserLogins(uids, requestController);

    const result: UserScoreRank[] = [];

    scoreRanks.forEach((scoreRank, index) => {
      result[index] = {
        userId: uids[index],
        login: logins[index],
        coalitionUserId: scoreRank.coalitionUserId,
        value: scoreRank.value,
      };
    });

    return result;
  };

  private static requestUserIds = async (scoreRanks: ScoreRank[], requestController: RequestController) => {
    for (const scoreRank of scoreRanks) {
      requestController.addRequestPool(`coalitions_users/${scoreRank.coalitionUserId}`);
    }

    const responses = await requestController.awaitRequestPool();

    const uids: string[] = [];

    for (const response of responses) {
      if (response.status === 'rejected') {
        console.error('fetch fail occurred. should not use result of this process.');
        break;
      }

      const coalitionsUsers: CoalitionsUsersDto = await response.value.json();
      uids.push(coalitionsUsers.user_id.toString());
    }

    return uids;
  };

  private static requestUserLogins = async (userIds: string[], requestController: RequestController) => {
    for (const userId of userIds) {
      requestController.addRequestPool(`users/${userId}`);
    }

    const responses = await requestController.awaitRequestPool();

    const userLogins: string[] = [];

    for (const response of responses) {
      if (response.status === 'rejected') {
        console.error('fetch fail occurred. should not use result of this process.');
        break;
      }

      const users = await response.value.json();

      // hmmm...
      userLogins.push(users.login);
    }

    return userLogins;
  };
}
