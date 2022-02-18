import * as path from "node:path";
import * as os from "node:os";

import * as fs from "fs-extra";
import * as klaw from "klaw";
import log from "loglevel";

import { ChallengeSetupInfo } from "../types";
import { templateFile } from "../../../util/template";

/**
 * Generates a challenge template from a well-known location
 */
export default class TemplateGenerator {
    private readonly templateExtension = ".tpl";

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

        for await (const file of klaw(tmpDir)) {
            if (file.stats.isFile() && file.path.endsWith(this.templateExtension)) {
                log.debug("Processing template file", file.path);

                const resultantFilePath = file.path.slice(0, -this.templateExtension.length);
                await fs.writeFile(resultantFilePath, await templateFile(file.path, this.challengeContext));

                log.debug("Generated", resultantFilePath, "and removing", file.path);
                await fs.remove(file.path);
            }
        }

        log.debug("Finalizing template", this.targetDir);
        await fs.move(tmpDir, this.targetDir);
    }
}
