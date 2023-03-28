import { ApiClientConfig } from './ApiClientConfig.js';
import { Fetcher } from '../util/Fetcher.js';
import { Logger } from '../util/Logger.js';
import { RateLimiter } from './RateLimiter.js';

interface TokenResponsePayload {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

export class ApiRefError extends Error {
  constructor() {
    super();
    this.name = 'ApiRefError';
  }
}

// todo: token class?
export interface Token {
  readonly accessToken: string;
  readonly createdAt: number;
  readonly expiredAt: number;
  readonly rateLimiter: RateLimiter;
}

export class TokenStore {
  private readonly config: ApiClientConfig;

  private token: Token | null;

  private readonly fetcher = new Fetcher();
  private readonly logger;

  constructor(apiClientConfig: ApiClientConfig) {
    this.config = apiClientConfig;
    this.token = null;
    this.logger = new Logger(`${this.config.clientName}-Token`);
  }

  getApiClientId = () => {
    return this.config.clientId;
  };

  getToken = async () => {
    const currToken = this.token;

    // todo: refresh expired logic error
    if (this.isEmptyToken(currToken) || this.isExpiredToken(currToken)) {
      const tokenResponsePayload = await this.issueToken();

      const newToken: Token = {
        accessToken: tokenResponsePayload.access_token,
        createdAt: toMilliseconds(tokenResponsePayload.created_at),
        expiredAt: getExpiredDate(tokenResponsePayload.expires_in),
        rateLimiter: new RateLimiter(this.config),
      } as const;

      this.token = newToken;

      this.logger.log(`token expiresAt: ${newToken.expiredAt}`);

      return newToken;
    }

    return currToken;
  };

  isEmptyToken = (token: Token | null): token is null => {
    return token === null;
  };

  isExpiredToken = (token: Token) => {
    const currTime = new Date().getTime();
    return currTime >= token.expiredAt;
  };

  private issueToken = async () => {
    this.logger.log('trying to issue a token...');

    const tokenResponse = await this.fetchApiToken();

    // todo: check retry for here
    if (!tokenResponse.ok) {
      this.logger.error(`issue token fail. status: ${tokenResponse.status}`);
      throw Error(tokenResponse.statusText);
    }

    const tokenResponsePayload: TokenResponsePayload =
      await tokenResponse.json();

    // runtime type check for handling api reference change.
    if (isApiRefError(tokenResponsePayload)) {
      this.logger.error('api ref error. library is outdated');
      throw new ApiRefError();
    }

    this.logger.log(`token issued: ${tokenResponsePayload.access_token}`);

    return tokenResponsePayload;
  };

  private fetchApiToken = async () => {
    const response = await this.fetcher.request({
      url: 'oauth/token',
      init: {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      },
    });

    return response;
  };
}

/** =========================================================================
 * helper functions
 *
 ** ========================================================================= */

/**
 *
 * @description log all not found properties. this is for runtime typecheck only.
 * @returns true if any of properties not exist.
 */
const isApiRefError = (tokenResponsePayload: TokenResponsePayload) => {
  let isError = false;

  Object.entries(tokenResponsePayload).forEach((curr) => {
    if (curr[1] === undefined) {
      console.error(`${curr[0]} not found in response.`);
      isError = true;
    }
  });

  return isError;
};

/**
 *
 * @param expiresIn token's left lifetime as milliseconds
 * @returns Date(current Time + expiresIn);
 */
const getExpiredDate = (expiresIn: number) => {
  const currTime = new Date().getTime();
  return floorUnderSeconds(currTime + toMilliseconds(expiresIn));
};

const toMilliseconds = (seconds: number) => {
  return seconds * 1000;
};

/**
 * @description floor under seconds
 */
const floorUnderSeconds = (milliseconds: number) => {
  return (milliseconds / 1000) * 1000;
};
