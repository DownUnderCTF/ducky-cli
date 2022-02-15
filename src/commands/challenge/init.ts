import {Command, Flags} from '@oclif/core';
import * as path from 'node:path';
import { inquiredParse } from '../../ext/InquiredCommand';
import { BaseGenerator } from '../../services/challenge/generators/base';
import { PwnGenerator } from '../../services/challenge/generators/pwn';
import { TcpGenerator } from '../../services/challenge/generators/tcp';
import { WebGenerator } from '../../services/challenge/generators/web';
import {
    ChallengeCategory,
    ChallengeDifficulty,
    ChallengeHostingType,
    CHALLENGE_CATEGORIES,
    CHALLENGE_DIFFICULTIES,
    CHALLENGE_HOSTING_TYPE
} from '../../services/challenge/types';

export default class ChallengeInit extends Command {
    static description = 'Bootstrap and initialize a challenge';

    static inquiredFlags = {
        category: {
            message: 'Category',
        },
        name: {
            message: 'Name',
        },
        author: {
            message: 'Author',
        },
        difficulty: {
            message: 'Difficulty',
        },
        type: {
            message: 'Hosting Type',
        }
    }

    static flags = {
        category: Flags.enum<ChallengeCategory>({
            char: 'c',
            description: 'Challenge category',
            options: [...CHALLENGE_CATEGORIES],
        }),
        name: Flags.string({
            char: 'n',
            description: 'Challenge name',
        }),
        author: Flags.string({
            char: 'a',
            description: 'Handle or name of challenge author',
            default: 'anonymous',  // TODO: read from config
        }),
        difficulty: Flags.enum<ChallengeDifficulty>({
            char: 'd',
            description: 'Challenge difficulty',
            options: [...CHALLENGE_DIFFICULTIES],
        }),
        type: Flags.enum<ChallengeHostingType>({
            char: 'T',
            description: 'Type of hosting required (none - description only, static file, tcp, http)',
            options: [...CHALLENGE_HOSTING_TYPE],
            default: 'http',
        }),
        dir: Flags.string({
            char: 'D',
            description: 'Root challenge repository directory',
            default: './',
            parse: async d => d.trim().length === 0 ? './' : d,
        }),
        id: Flags.string({
            hidden: true,
        }),
    };

    async run(): Promise<void> {
        const { flags } = await inquiredParse.bind(this)(ChallengeInit);

        const {
            dir: rootDir,
            category,
            name,
            difficulty,
            author,
            type,
            id,
        } = flags;

        const challengePath = path.join(rootDir, category, name);

        this.debug('Creating a new challenge', {flags});

        const generatorType = this.getGenerator(type);
        const generator = new generatorType(challengePath, {
            id,
            name,
            category,
            author,
            difficulty: difficulty,
            tags: [],
        });

        await generator.generate();
    }

    getGenerator(hostingType: ChallengeHostingType): typeof BaseGenerator {
        switch(hostingType) {
        case 'none':
            return BaseGenerator;
        case 'static':
            return BaseGenerator;
        case 'pwn':
            return PwnGenerator;
        case 'tcp':
            return TcpGenerator;
        case 'http':
            return WebGenerator;
        }
    }
}
