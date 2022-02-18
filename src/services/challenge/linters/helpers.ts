import * as path from 'node:path';

import * as fs from 'fs-extra';
import * as YAML from 'yaml';
import { ChallengeDescriptor } from '../types';

export async function hasArtifact(
    artifactPath: string,
    rsrcType: 'file' | 'directory' | null = null,
    minSize = 0,
): Promise<string | null> {
    if(!await fs.pathExists(artifactPath)) {
        return `No such path ${artifactPath}`;
    }
    const lstat = await fs.lstat(artifactPath);
    if(rsrcType) {
        if(rsrcType === 'file' && !lstat.isFile()) {
            return `Path ${artifactPath} exists but is not a file`;
        }
        if(rsrcType == 'directory' && !lstat.isDirectory())  {
            return `Path ${artifactPath} exists but is not a directory`;
        }
    }

    if(lstat.size < minSize) {
        return minSize === 1
            ? `File ${artifactPath} must not be empty`
            : `File ${artifactPath} must be >= ${minSize} bytes`;
    }

    return null;
}

export async function getCtfcliSpec(challengeDir: string): Promise<ChallengeDescriptor> {
    const ctfcliPath = path.join(challengeDir, 'ctfcli.yml');
    return YAML.parse(await fs.readFile(ctfcliPath, 'utf-8')) ?? {};
}
