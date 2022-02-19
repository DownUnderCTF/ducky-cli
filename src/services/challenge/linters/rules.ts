import * as path from "node:path";

import * as fs from "fs-extra";

import { getCtfcliSpec, hasArtifact } from "./helpers";
import { CHALLENGE_CATEGORIES } from "../types";
import { ignoreWalk } from "../../../util/fsutil";
import {
    CHALLENGE_CONFIGURATION_FILE_NAME,
    DELETEME_FILE_NAME_FLAGS,
} from "../../../config";

export type RuleLevel = "notice" | "warning" | "error" | "fatal";
export type RuleDefinition = {
    code: string;
    level: RuleLevel;
    description: string;
    /**
     * Check the rule
     * Return
     *   boolean => Has the rule passed? (true if this isn't a violation)
     *   string | null => Additional failure detail (null if this isn't a violation)
     */
    check: (challengeDir: string) => Promise<boolean | string | null>;
};

export type RuleViolation = {
    code: string;
    message?: string;
};

export const rules: Readonly<Readonly<RuleDefinition>[]> = [
    // Structure rules
    {
        code: "S000",
        check: S000,
        level: "fatal",
        description: "Must have a ctfcli.yml file",
    },
    {
        code: "S001",
        check: S001,
        level: "error",
        description: "Must have a solve/ folder",
    },
    {
        code: "S002",
        check: S002,
        level: "error",
        description: "Must have a solve/WRITEUP.md file with content",
    },
    {
        code: "S003",
        check: S003,
        level: "error",
        description: "Must have a README.md file with content",
    },
    {
        code: "S004",
        check: S004,
        level: "error",
        description: "Must not have DELETEME files",
    },

    // Configuration rules
    {
        code: "C000",
        check: C000,
        level: "error",
        description: "Must have a challenge name",
    },
    {
        code: "C001",
        check: C001,
        level: "error",
        description: "Must have a valid challenge category",
    },
    {
        code: "C002",
        check: C002,
        level: "error",
        description: "Must have a challenge description",
    },
    {
        code: "C003",
        check: C003,
        level: "warning",
        description:
            'Should have a challenge author (specified by "Author: ...")',
    },
    {
        code: "C004",
        check: C004,
        level: "error",
        description: "Must have at least a difficulty tag",
    },
    {
        code: "C005",
        check: C005,
        level: "error",
        description: "Must have at least one flag",
    },
    {
        code: "C006",
        check: C006,
        level: "error",
        description: "Published paths must exist",
    },
];

const ruleLookup = Object.fromEntries(rules.map((rule) => [rule.code, rule]));

export function getRuleByCode(code: string): RuleDefinition | undefined {
    return ruleLookup[code];
}

async function S000(challengeDir: string): Promise<string | null> {
    return await hasArtifact(
        path.join(challengeDir, CHALLENGE_CONFIGURATION_FILE_NAME),
        "file"
    );
}

async function S001(challengeDir: string): Promise<string | null> {
    return await hasArtifact(path.join(challengeDir, "solve"), "directory");
}

async function S002(challengeDir: string): Promise<string | null> {
    return await hasArtifact(
        path.join(challengeDir, "solve/WRITEUP.md"),
        "file",
        1
    );
}

async function S003(challengeDir: string): Promise<string | null> {
    return await hasArtifact(path.join(challengeDir, "README.md"), "file", 1);
}

async function S004(challengeDir: string): Promise<string | null> {
    const toDelete = (await ignoreWalk(challengeDir)).filter((fpath) =>
        DELETEME_FILE_NAME_FLAGS.some((flag) => fpath.includes(flag))
    );
    return toDelete.length === 0
        ? null
        : "Found DELETEME(s): " + toDelete.join(", ");
}

async function C000(challengeDir: string): Promise<boolean> {
    return !!(await getCtfcliSpec(challengeDir)).name;
}

async function C001(challengeDir: string): Promise<string | null> {
    const ctfcliSpec = await getCtfcliSpec(challengeDir);
    if (!ctfcliSpec.category) {
        return "No category specified";
    }

    if (!CHALLENGE_CATEGORIES.includes(ctfcliSpec.category)) {
        return `Invalid category ${
            ctfcliSpec.category
        }. Must be one of ${CHALLENGE_CATEGORIES.join(", ")}`;
    }

    return null;
}

async function C002(challengeDir: string): Promise<boolean> {
    return !!(await getCtfcliSpec(challengeDir)).description;
}

async function C003(challengeDir: string): Promise<boolean> {
    return /Author: \w+/i.test((await getCtfcliSpec(challengeDir)).description);
}

async function C004(challengeDir: string): Promise<boolean> {
    return ((await getCtfcliSpec(challengeDir)).tags ?? []).length > 0;
}

async function C005(challengeDir: string): Promise<boolean> {
    return ((await getCtfcliSpec(challengeDir)).flags ?? []).length > 0;
}

async function C006(challengeDir: string): Promise<string | null> {
    const requiredFiles = (await getCtfcliSpec(challengeDir)).files ?? [];
    const fileStatuses = await Promise.all(
        requiredFiles.map(async (p) => [
            p,
            await fs.pathExists(path.join(challengeDir, p)),
        ])
    );
    const missingFiles = fileStatuses
        .filter(([_path, exists]) => !exists)
        .map(([path, _exists]) => path);

    return missingFiles.length === 0
        ? null
        : `Found missing files: ${missingFiles.join(", ")}`;
}
