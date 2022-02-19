import * as path from "node:path";

import { Command, Flags } from "@oclif/core";

import { inquiredParse } from "../../ext/InquiredCommand";
import TemplateGenerator from "../../services/challenge/generators/TemplateGenerator";
import {
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeHostingType,
    CHALLENGE_CATEGORIES,
    CHALLENGE_DIFFICULTIES,
    CHALLENGE_HOSTING_TYPE,
} from "../../services/challenge/types";
import { findUpRequired, findUpWith } from "../../util/fsutil";
import { TEMPLATE_FOLDER } from "../../config";

export default class ChallengeInit extends Command {
    static description = "Bootstrap and initialize a challenge";

    static inquiredFlags = {
        category: {
            message: "Category",
        },
        name: {
            message: "Name",
        },
        author: {
            message: "Author",
        },
        difficulty: {
            message: "Difficulty",
        },
        type: {
            message: "Hosting Type",
        },
    };

    static flags = {
        id: Flags.string({
            hidden: true,
            description: "Challenge Id",
        }),
        category: Flags.enum<ChallengeCategory>({
            char: "c",
            description: "Challenge category",
            options: [...CHALLENGE_CATEGORIES],
        }),
        name: Flags.string({
            char: "n",
            description: "Challenge name",
        }),
        author: Flags.string({
            char: "a",
            description: "Handle or name of challenge author",
            default: "anonymous",
        }),
        difficulty: Flags.enum<ChallengeDifficulty>({
            char: "d",
            description: "Challenge difficulty",
            options: [...CHALLENGE_DIFFICULTIES],
        }),
        type: Flags.enum<ChallengeHostingType>({
            char: "t",
            description:
                "Type of hosting required (none - description only, tcp, http)",
            options: [...CHALLENGE_HOSTING_TYPE],
            default: "http",
        }),
        dir: Flags.string({
            char: "D",
            description: "Root challenge repository directory",
            default: async () => await findUpWith(".git", "./"),
        }),
        template: Flags.string({
            char: "T",
            description: "Directory to use as a template",
            default: async () => await findUpRequired(TEMPLATE_FOLDER),
        }),
    };

    async run(): Promise<void> {
        const { flags } = await inquiredParse.bind(this)(ChallengeInit);

        const {
            dir: rootDir,
            template: templateDir,
            id,
            category,
            name,
            author,
            difficulty,
            type,
        } = flags;
        const targetDir = path.join(rootDir, category, name);

        this.debug("Creating a new challenge", { flags });

        const generator = new TemplateGenerator(templateDir, targetDir, {
            id: id ?? name.replaceAll(/[^\w]/g, "_"),
            name,
            category,
            author,
            difficulty,
            hostingType: type,
            tags: [],
        });
        await generator.generate();

        this.log(`Generated new challenge ${name} at ${targetDir}`);
    }
}
