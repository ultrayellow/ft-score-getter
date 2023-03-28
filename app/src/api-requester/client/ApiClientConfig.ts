import { EnvReader } from '../util/EnvReader.js';

export class ApiClientConfig {
  static readonly DEFAULT_CLIENT_NAME_ENV_KEY = 'CLIENT_NAME';
  static readonly DEFAULT_CLIENT_ID_ENV_KEY = 'CLIENT_ID';
  static readonly DEFAULT_CLIENT_SECRET_ENV_KEY = 'CLIENT_SECRET';
  static readonly DEFAULT_CLIENT_RATE_LIMIT_PER_SEC_KEY =
    'CLIENT_RATE_LIMIT_PER_SEC';
  static readonly DEFAULT_CLIENT_RATE_LIMIT_PER_HOUR_KEY =
    'CLIENT_RATE_LIMIT_PER_HOUR';

  readonly clientName: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly rateLimitPerSec: number;
  readonly rateLimitPerHour: number;

  constructor(
    clientNameEnvKey = ApiClientConfig.DEFAULT_CLIENT_NAME_ENV_KEY,
    clientIdEnvKey = ApiClientConfig.DEFAULT_CLIENT_ID_ENV_KEY,
    clientSecretEnvKey = ApiClientConfig.DEFAULT_CLIENT_SECRET_ENV_KEY,
    rateLimitPerSecEnvKey = ApiClientConfig.DEFAULT_CLIENT_RATE_LIMIT_PER_SEC_KEY,
    rateLimitPerHourEnvKey = ApiClientConfig.DEFAULT_CLIENT_RATE_LIMIT_PER_HOUR_KEY,
  ) {
    this.clientName = EnvReader.getEnv(clientNameEnvKey);
    this.clientId = EnvReader.getEnv(clientIdEnvKey);
    this.clientSecret = EnvReader.getEnv(clientSecretEnvKey);

    try {
      this.rateLimitPerSec = parseInt(EnvReader.getEnv(rateLimitPerSecEnvKey));
      this.rateLimitPerHour = parseInt(
        EnvReader.getEnv(rateLimitPerHourEnvKey),
      );
    } catch {
      // todo
      this.rateLimitPerSec = 2;
      this.rateLimitPerHour = 1200;
    }
    this.logConfig();
  }

  logConfig = () => {
    console.log(
      `
|-clientName: ${this.clientName}
|-clientId: ${this.clientId}
|-clientSecret: ${this.clientSecret}
|-request per sec: ${this.rateLimitPerSec}
|-request per hour: ${this.rateLimitPerHour}
--`,
    );
  };
}
