import * as path from "node:path";
import * as mockfs from "mock-fs";
import { DirectoryItems } from "mock-fs/lib/filesystem";

export function mockOClifFS(conf: DirectoryItems = {}): void {
    const basePath = path.resolve(__dirname, "../../");
    const loadRepoFile = (...fpath: string[]) =>
        mockfs.load(path.join(basePath, ...fpath));

    mockfs(
        {
            "./bin": loadRepoFile("./bin"),
            "./dist": loadRepoFile("./dist"),
            "./node_modules": loadRepoFile("./node_modules"),
            "./src": loadRepoFile("./src"),
            "./oclif.manifest.json": loadRepoFile("./oclif.manifest.json"),
            "./package.json": loadRepoFile("./package.json"),

            ...conf,
        },
        { createCwd: false }
    );
}
