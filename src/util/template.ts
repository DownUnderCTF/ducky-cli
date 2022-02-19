import { PathLike } from "fs";
import * as fs from "node:fs/promises";

import * as handlebars from "handlebars";
import registerHelpers from "../ext/handlebars";

export async function templateFile(
    path: PathLike,
    context: unknown = {}
): Promise<string> {
    registerHelpers();
    return handlebars.compile(await fs.readFile(path, "utf-8"))(context);
}
