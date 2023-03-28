import fs from 'fs/promises';
import { Logger } from './Logger.js';
import { Util } from './Util.js';

export interface FetcherConfig {
  url: string;
  retryCount: number;
  retryInterval: number;
  saveErrorLog: boolean;
  errorLogPath: string;
  errorStatusFn: (status: number) => boolean;
}

export interface RequestArg {
  url: string;
  init?: RequestInit;
}

// todo: add constructor for Error(filename, linenumber)
export class ResponseStatusError extends Error {
  name = 'ResponseStautsError';
  status: number;

  // todo: fix ErrorOptions not found after build
  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

export class Fetcher {
  private static readonly FT_INTRA_API_ENDPOINT = 'https://api.intra.42.fr/v2/';
  private static readonly DEFAULT_RETRY_COUNT = 3;
  private static readonly DEFAULT_RETRY_INTERVAL = Util.SEC;
  // todo: default value...
  private static readonly DEFAULT_SAVE_ERROR_LOG = true;
  private static readonly DEFAULT_ERROR_LOG_PATH = './error';
  private static readonly DEFAULT_ERROR_STATUS_FN = (status: number) =>
    status >= 400;

  error: unknown;

  private readonly config: FetcherConfig;

  private readonly logger = new Logger('Fetcher');

  constructor(config?: Partial<FetcherConfig>) {
    this.config = {
      url: config?.url ? config.url : Fetcher.FT_INTRA_API_ENDPOINT,
      retryCount: config?.retryCount
        ? config.retryCount
        : Fetcher.DEFAULT_RETRY_COUNT,
      retryInterval: config?.retryInterval
        ? config.retryInterval
        : Fetcher.DEFAULT_RETRY_INTERVAL,
      saveErrorLog: config?.saveErrorLog
        ? config.saveErrorLog
        : Fetcher.DEFAULT_SAVE_ERROR_LOG,
      errorLogPath: config?.errorLogPath
        ? config.errorLogPath
        : Fetcher.DEFAULT_ERROR_LOG_PATH,
      errorStatusFn: config?.errorStatusFn
        ? config.errorStatusFn
        : Fetcher.DEFAULT_ERROR_STATUS_FN,
    } as const;
  }

  public request = async (requestArg: RequestArg) => {
    const { url, init } = requestArg;
    const finalUrl = `${this.config.url}${url}`;

    for (let i = 0; i < this.config.retryCount; i++) {
      try {
        const response = await this.requestSingleRun(finalUrl, init);
        return response;
      } catch (e) {
        this.error = e;
        this.logger.error(`fetch failed. error: ${e}`);

        // retry logic
        if (!this.isRetryLimitReached(i)) {
          this.logger.log(
            `going to retry after ${this.config.retryInterval}ms...`,
          );

          await Util.sleepMs(this.config.retryInterval);
        }
      }
    }

    await this.logError(this.error, finalUrl, init);
    console.log('here');
    return Promise.reject(this.error);
    // todo...
    // throw this.error;
  };

  public requestWithToken = (requestArg: RequestArg, accessToken: string) => {
    const { url, init } = requestArg;

    const newInit: RequestInit = {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    } as const;

    const response = this.request({ url: url, init: newInit });
    return response;
  };

  // request without retry
  private requestSingleRun = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init);

    if (this.isErrorStatus(response.status)) {
      throw new ResponseStatusError(response.status);
    }

    return response;
  };

  private logError = async (
    error: unknown,
    url: string,
    init?: RequestInit,
  ) => {
    try {
      const currTime = new Date().getTime();
      await fs.mkdir(this.config.errorLogPath, { recursive: true });
      const errorLogFile = await fs.open(
        `${this.config.errorLogPath}/fetch-err-${currTime}.log`,
        'w',
      );

      try {
        await errorLogFile.write(`url: ${url}\n\n`);

        if (init) {
          await errorLogFile.write(
            `init: ${JSON.stringify(init, null, '  ')}\n\n`,
          );

          if (init.body) {
            await errorLogFile.write(`body: ${init.body.toString()}\n\n`);
          }
        }

        await errorLogFile.write(`${JSON.stringify(error, null, '  ')}\n`);
      } finally {
        await errorLogFile.close();
      }
    } catch (e) {
      this.logger.error(`fetch error logging failed. error: ${e}`);
    }
  };

  isErrorStatus = (status: number) => {
    return this.config.errorStatusFn(status);
  };

  isRetryLimitReached = (count: number) => {
    return count + 1 === this.config.retryCount;
  };
}
