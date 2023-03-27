import fs from 'fs/promises';

export interface ReadAllFilesOption {
  recursive?: true;
}

/**
 * @description simple file r/w class
 */
export class Files {
  constructor() {}

  /**
   *
   * @param filepath file to read
   * @returns file content in json format
   */
  static readFile = async <ReturnType = unknown>(filepath: string) => {
    const jsonString = await fs.readFile(filepath, { encoding: 'utf-8' });
    const json: ReturnType = JSON.parse(jsonString);

    return json;
  };

  /**
   *
   * @param dirpath directory to read
   * @param option ReadAllFilesOption
   * @returns file contents in json[] format
   */
  static readAllFiles = async <ReturnType = unknown>(
    dirpath: string,
    option?: ReadAllFilesOption
  ) => {
    const dir = await fs.opendir(dirpath);

    const jsons: ReturnType[] = [];

    for await (const dirent of dir) {
      try {
        // todo: handle max depth?
        // if recursive option is enabled, read file recursively.
        if (dirent.isDirectory() && option?.recursive) {
          const recursiveResult = await this.readAllFiles<ReturnType>(
            dirpath + '/' + dirent.name,
            option
          );

          jsons.push(...recursiveResult);
        }

        if (dirent.isFile()) {
          const jsonString = await fs.readFile(dirpath + '/' + dirent.name, {
            encoding: 'utf-8',
          });

          jsons.push(JSON.parse(jsonString));
        }
      } catch {
        dir.close();
      }
      // dir has automatic close system on success.
    }

    return jsons;
  };

  /**
   *
   * @param filepath file to write
   * @param json content to write in json format
   */
  static writeFile = async (filepath: string, json: unknown) => {
    await fs.writeFile(filepath, JSON.stringify(json, null, '  '), {
      encoding: 'utf-8',
    });
  };

  /**
   *
   * @description save all jsons with file prefix + index
   * @param jsons contents to write in json[] format
   * @param dirpath directory to write
   * @param count write ```count``` files
   * @param prefix file prefix
   */
  static writeAllFiles = async (
    jsons: unknown[],
    dirpath: string,
    count: number,
    prefix: string = 'file'
  ) => {
    await fs.mkdir(dirpath, { recursive: true });

    for (let i = 0; i < count; i++) {
      await fs.writeFile(
        dirpath + '/' + prefix + `${i}` + '.json',
        JSON.stringify(jsons[i], null, '  '),
        { encoding: 'utf-8' }
      );
    }
  };

  static mkdir = async (dir: string) => {
    await fs.mkdir(dir, { recursive: true });
  };
}
