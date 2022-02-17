import * as path from 'node:path';

import * as fs from 'fs-extra';
import * as mockfs from 'mock-fs';
import { expect, test } from '@oclif/test';

describe('challenge:init', () => {
    beforeEach(() => {
        mockfs();
    });

    const TEST_ID = 'test_challenge',
        TEST_CATEGORY = 'web',
        TEST_NAME = 'test-challenge',
        TEST_AUTHOR = 'test-author#1337',
        TEST_DIFFICULTY = 'easy',
        TEST_HOSTING = 'http';

    test
        .do(() => mockfs({
            '.': mockfs.load(path.resolve(__dirname, '../../../')),
            '.template': {
                'test.yml.tpl': '{{id}} {{name}} {{category}} {{author}} {{difficulty}}'
            },
        }, {createCwd: false}))
        .command([
            'challenge:init',
            '--id', TEST_ID,
            '-c', TEST_CATEGORY,
            '-n', TEST_NAME,
            '-a', TEST_AUTHOR,
            '-d', TEST_DIFFICULTY,
            '-t', TEST_HOSTING,
        ])
        .it('correctly substitutes tpl files', () => {
            const artifactPath = path.join(TEST_CATEGORY, TEST_NAME, 'test.yml');

            expect(fs.pathExistsSync(artifactPath)).to.be.true;

            expect(fs.readFileSync(artifactPath, 'utf-8')).to.equal(
                `${TEST_ID} ${TEST_NAME} ${TEST_CATEGORY} ${TEST_AUTHOR} ${TEST_DIFFICULTY}`,
            );
        });
    
    test
        .do(() => mockfs({
            '.': mockfs.load(path.resolve(__dirname, '../../../')),
            '.template': {
                'unchanged.yml': '{{id}}',
            },
        }, {createCwd: false}))
        .command([
            'challenge:init',
            '--id', TEST_ID,
            '-c', TEST_CATEGORY,
            '-n', TEST_NAME,
            '-a', TEST_AUTHOR,
            '-d', TEST_DIFFICULTY,
            '-t', TEST_HOSTING,
        ])
        .it('doesnt substitute files not-ending in tpl', () => {
            const artifactPath = path.join(TEST_CATEGORY, TEST_NAME, 'unchanged.yml');
            expect(fs.pathExistsSync(artifactPath)).to.be.true;

            expect(fs.readFileSync(artifactPath, 'utf-8')).to.equal('{{id}}');
        });

    test
        .do(() => mockfs({
            '.': mockfs.load(path.resolve(__dirname, '../../../')),
            '.template': {
                'unchanged.yml': '{{id}}',
            },
            [TEST_CATEGORY]: {
                [TEST_NAME]: {},
            }
        }, {createCwd: false}))
        .command([
            'challenge:init',
            '--id', TEST_ID,
            '-c', TEST_CATEGORY,
            '-n', TEST_NAME,
            '-a', TEST_AUTHOR,
            '-d', TEST_DIFFICULTY,
            '-t', TEST_HOSTING,
        ])
        .catch(err => expect(err.message).to.match(/already exists/))
        .it('refuses to overwrite existing paths');
    
    afterEach(mockfs.restore);
});