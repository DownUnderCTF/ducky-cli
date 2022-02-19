import * as path from "node:path";
import * as os from "node:os";

import * as fs from "fs-extra";
import log from "loglevel";

import { ChallengeSetupInfo } from "../types";
import { templateFile } from "../../../util/template";
import { ignoreWalk } from "../../../util/fsutil";
import { TEMPLATE_FILE_EXTENSION } from "../../../config";

/**
 * Generates a challenge template from a well-known location
 */
export default class TemplateGenerator {
    constructor(
        private readonly templateDir: string,
        private readonly targetDir: string,
        private readonly challengeContext: ChallengeSetupInfo
    ) {}

    async generate(): Promise<void> {
        if (await fs.pathExists(this.targetDir)) {
            throw new Error(`"${this.targetDir}" already exists, refusing to initialize challenge.`);
        }

        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ducky"));
        await fs.copy(this.templateDir, tmpDir);
        log.debug("Using working directory", tmpDir);

        await Promise.all((await ignoreWalk(tmpDir)).map(async file => {
            const stat = await fs.lstat(file);
            if (stat.isFile() && file.endsWith(TEMPLATE_FILE_EXTENSION)) {
                log.debug("Processing template file", file);

                const resultantFilePath = file.slice(0, -TEMPLATE_FILE_EXTENSION.length);
                await fs.writeFile(resultantFilePath, await templateFile(file, this.challengeContext));

                log.debug("Generated", resultantFilePath, "and removing", file);
                await fs.remove(file);
            }
        }));

        log.debug("Finalizing template", this.targetDir);
        await fs.move(tmpDir, this.targetDir);
    }
}
