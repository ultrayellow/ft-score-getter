/**
 * @description helper class for library.
 */
export class Util {
  static readonly SEC = 1000;
  static readonly HOUR = this.SEC * 60 * 60;
  static readonly DAY = this.HOUR * 24;

  static async sleepMs(ms: number) {
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), ms);
    });
  }
}
