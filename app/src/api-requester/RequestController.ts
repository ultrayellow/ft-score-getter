import { Token, TokenStore } from './client/TokenStore.js';
import { Fetcher, RequestArg } from './util/Fetcher.js';
import { Logger } from './util/Logger.js';
import { Util } from './util/Util.js';

export class RequestController {
  private readonly tokenStores: TokenStore[];
  private readonly requestPool: RequestArg[];

  private readonly logger = new Logger('RequestController');
  // todo: fix fetcher?
  private readonly fetcher = new Fetcher({ retryCount: 1 });

  constructor() {
    this.tokenStores = [];
    this.requestPool = [];
  }

  addTokenStore = async (tokenStore: TokenStore) => {
    if (this.isDuplicatedTokenStore(tokenStore)) {
      this.logger.error('duplicated tokenStore');
      return;
    }

    const initializeResult = await this.initializeTokenStore(tokenStore);
    if (initializeResult === false) {
      this.logger.error('invalid tokenStore');
      return;
    }

    this.tokenStores.push(tokenStore);
  };

  addRequestPool = (url: string, init?: RequestInit) => {
    this.requestPool.push({ url, init });
  };

  awaitRequestPool = async () => {
    const results: PromiseSettledResult<Response>[] = [];
    while (this.requestPool.length > 0) {
      const currRequestPool = this.requestPool.splice(0, 10);
      const currResults = await this.sendRequests(currRequestPool);

      await this.retryRejected(currRequestPool, currResults);

      results.push(...currResults);

      if (this.hourlyLimitReached(currRequestPool, currResults)) {
        // todo: function..?
        this.logger.log(`hourly limit reached. returning first ${results.length} requests`);
        break;
      }
    }

    return results;
  };

  retryRejected = async (requestPool: RequestArg[], results: PromiseSettledResult<Response>[]) => {
    const retryIndexes = results.reduce((acc, curr, index) => {
      if (curr.status === 'rejected') {
        acc.push(index);
      }

      return acc;
    }, Array<number>());

    const retryPromises = await this.sendRequests(
      retryIndexes.map((curr) => {
        return requestPool[curr];
      })
    );

    const retryResults = retryPromises;

    retryIndexes.forEach((retryIndex, index) => {
      results[retryIndex] = retryResults[index];
    });
  };

  private isDuplicatedTokenStore = (tokenStore: TokenStore) => {
    const currApiClientId = tokenStore.getApiClientId();
    const findResult = this.tokenStores.find((curr) => curr.getApiClientId() === currApiClientId);
    return findResult !== undefined;
  };

  private initializeTokenStore = async (tokenStore: TokenStore) => {
    try {
      // todo: hmm...
      const token = await tokenStore.getToken();
      return true;
    } catch {
      return false;
    }
  };

  private selectToken = async (deps: number = 0): Promise<Token | null> => {
    // todo
    if (deps === 10 * 3) {
      return null;
    }

    for (const tokenStore of this.tokenStores) {
      const token = await tokenStore.getToken();

      if (!token.rateLimiter.isLimitReaced()) {
        return token;
      }
    }

    // this.logger.log('no token available, start wating 1100ms...');

    await Util.sleepMs(100);

    // recursive try
    return await this.selectToken(deps + 1);
  };

  private sendRequests = async (requestPool: RequestArg[]) => {
    const promisePool: Promise<Response>[] = [];

    for (const currRequest of requestPool) {
      const token = await this.selectToken();
      if (!token) {
        this.logger.error(`no api client available, proceed request before ${currRequest.url}`);
        break;
      }

      token.rateLimiter.updateAtRequest();

      const promise = this.fetcher.requestWithToken(currRequest, token.accessToken);

      promisePool.push(promise);

      this.logger.log(`request sent, url: ${currRequest.url}`);
    }

    const results = await Promise.allSettled(promisePool);
    return results;
  };

  // unknown[] type?
  private hourlyLimitReached = (requestPool: RequestArg[], resultPool: PromiseSettledResult<Response>[]) => {
    return requestPool.length > resultPool.length;
  };
}
