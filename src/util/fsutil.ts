import * as path from "node:path";

import * as fs from "fs-extra";

/**
 * Finds a parent directory containing a file path, returning the entire path
 * findUp('hello') -> '/path/to/cwd/some/parent/hello
 * @param name file path to look for
 * @param start the directory to start searching from
 * @returns Path to ancestor and path or null if nothing can be found
 */
async function findUp(name: string, start: string = process.cwd()): Promise<string | null> {
    const parent = path.dirname(start);

    if (start === parent) return null;

    const target = path.join(start, name);
    return (await fs.pathExists(target)) ? target : findUp(name, parent);
}

export async function findUpWith(name: string, defaultPath?: string): Promise<string> {
    const up = await findUp(name);
    const containingPath = up ? path.join(up, "../") : defaultPath;
    if (!containingPath) throw new Error(`Could not find a ancestor path containing ${name}`);
    return containingPath;
}

export async function findUpRequired(name: string): Promise<string> {
    const up = await findUp(name);
    if (!up) throw new Error(`Could not find a ancestor path containing ${name}`);
    return up;
}
