import { Util } from '../util/Util.js';
import { ApiClientConfig } from './ApiClientConfig.js';

export class RateLimiter {
  private readonly config: ApiClientConfig;

  // hmm...
  private secondlyLimitResetAt: number;
  private secondlySendCount: number;
  private hourlyLimtResetAt: number;
  private hourlySendCount: number;

  constructor(apiClientConfig: ApiClientConfig) {
    this.config = apiClientConfig;

    this.secondlyLimitResetAt = 0;
    this.secondlySendCount = 0;
    this.hourlyLimtResetAt = 0;
    this.hourlySendCount = 0;
  }

  isLimitReaced = () => {
    const currTime = new Date().getTime();

    if (
      this.hourlySendCount >= this.config.rateLimitPerHour &&
      !this.isNewHour(currTime)
    ) {
      return true;
    }

    if (
      this.secondlySendCount >= this.config.rateLimitPerSec &&
      !this.isNewSec(currTime)
    ) {
      return true;
    }

    return false;
  };

  updateAtRequest = () => {
    const currTime = new Date().getTime();

    if (this.isNewHour(currTime)) {
      this.refreshHourlyLimit();
    }

    if (this.isNewSec(currTime)) {
      this.refreshSecondlyLimit();
    }

    this.secondlySendCount++;
    this.hourlySendCount++;
  };

  private isNewHour = (currTime: number) => {
    return this.hourlyLimtResetAt < currTime;
  };

  private refreshHourlyLimit = () => {
    this.hourlyLimtResetAt = getHourlyLimitResetAt();
    this.hourlySendCount = 0;
  };

  private isNewSec = (currTime: number) => {
    // todo
    return this.secondlyLimitResetAt + Util.SEC / 2 < currTime;
  };

  private refreshSecondlyLimit = () => {
    this.secondlyLimitResetAt = getSecondlyLimitResetAt();
    this.secondlySendCount = 0;
  };
}

const getHourlyLimitResetAt = () => {
  const currTime = new Date();
  return currTime.setHours(currTime.getHours() + 1, 0, 0, 0);
};

const getSecondlyLimitResetAt = () => {
  const currTime = new Date();
  return currTime.setSeconds(currTime.getSeconds() + 1);
};
