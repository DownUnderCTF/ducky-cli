import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { templateFile } from '../../../util/template';

import {ChallengeSetupDescriptor} from '../types';

const CHALLENGE_TMPL = path.join(__dirname, 'templates/challenge.yml');
const README_TMPL = path.join(__dirname, 'templates/README.md');


export class BaseGenerator {
    protected setupDescriptor: ChallengeSetupDescriptor & {nameSlug: string};

    constructor(protected challengePath: string, setupDescriptor: ChallengeSetupDescriptor) {
        this.setupDescriptor = {
            ...setupDescriptor,
            nameSlug: setupDescriptor.id ?? setupDescriptor.name.replaceAll(/\W/g, '-'),
        };
    }

    async generate(): Promise<void> {
        await fs.mkdir(this.challengePath, {recursive: true});
        await fs.writeFile(
            path.join(this.challengePath, 'challenge.yml'),
            await this.generateChallengeYml(),
        );
        await fs.writeFile(
            path.join(this.challengePath, 'README.md'),
            await this.generateReadme(),
        );
    }

    generateChallengeYml(): Promise<string> {
        const {name, nameSlug, category, author, difficulty, tags} = this.setupDescriptor;
        
        return templateFile(CHALLENGE_TMPL, {
            id: nameSlug,
            display_name: name,
            category: category,
            author: author,
            tags: [difficulty, ...tags],
        });
    }

    generateReadme(): Promise<string> {
        const {name, category, author, difficulty} = this.setupDescriptor;
        return templateFile(README_TMPL, {
            name,
            category,
            difficulty,
            author,
        });
    }
}

export class StaticChallenge extends BaseGenerator {
}

export class NetworkChallenge extends BaseGenerator {

}