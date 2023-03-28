import { Logger } from './Logger.js';

/**
 * @description reader for env.
 */
export class EnvReader {
  private static readonly logger = new Logger('EnvReader');

  /**
   * @param envKey process env key.
   * @returns env value of key.
   * @description return env value by given key. if not exist, throws Error.
   */
  static getEnv = (envKey: string) => {
    const envValue = process.env[envKey];

    if (!isEnvExist(envValue)) {
      this.logger.error(`${envKey} not exist in env file`);
      // todo: Error Type?
      throw Error(`${envKey}: env key not exist`);
    }

    return envValue;
  };
}

// todo: static? non-member?
const isEnvExist = (envValue: string | undefined): envValue is string => {
  return envValue !== undefined;
};
