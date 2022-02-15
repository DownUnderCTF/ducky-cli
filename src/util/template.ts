import {PathLike} from "fs";
import * as fs from 'node:fs/promises';

import * as handlebars from 'handlebars';

export async function templateFile(path: PathLike, context: unknown = {}): Promise<string> {
    return handlebars.compile(
        (await fs.readFile(path)).toString()
    )(context);
}
