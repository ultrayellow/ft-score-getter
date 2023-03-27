/**
 * @description util class for console.log ~ console.error. extend with member ```logHost: string```
 */
export class Logger {
  readonly logHost: string;

  constructor(logHost: string) {
    this.logHost = logHost;
  }

  log = (message: string) => {
    console.log(`${this.logHost}: ${message}`);
  };

  warn = (message: string) => {
    console.warn(`${this.logHost}: ${message}`);
  };

  error = (message: string) => {
    console.error(`${this.logHost}: ${message}`);
  };

  log_start = () => {
    console.log(
      '\n==================\nstarting process...\n==================\n'
    );
  };

  log_end = () => {
    console.log(
      '\n==================\n...end of process\n==================\n'
    );
  };
}
