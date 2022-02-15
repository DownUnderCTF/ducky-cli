export const CHALLENGE_CATEGORIES = [
    'cloud',
    'crypto',
    'forensics',
    'misc',
    'osint',
    'pwn',
    'rev',
    'web',
] as const;

export const CHALLENGE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const CHALLENGE_HOSTING_TYPE = ['none', 'static', 'pwn', 'tcp', 'http'] as const;

export type ChallengeCategory = typeof CHALLENGE_CATEGORIES[number];
export type ChallengeDifficulty = typeof CHALLENGE_DIFFICULTIES[number];
export type ChallengeHostingType = typeof CHALLENGE_HOSTING_TYPE[number];

export type ChallengeSetupDescriptor = {
    id: string | undefined,
    name: string,
    category: ChallengeCategory,
    author: string,
    difficulty: ChallengeDifficulty,
    tags: string[]
};
