import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { TcpGenerator } from "./tcp";

export class PwnGenerator extends TcpGenerator {
    async generate(): Promise<void> {
        await super.generate();

        await fs.writeFile(
            path.join(this.challengePath, 'Dockerfile'),
            this.generateDocker(),
        );
    }

    generateDocker(): string {
        return [
            'FROM ghcr.io/downunderctf/docker-vendor/nsjail:ubuntu-21.04',
        ].join('\n');
    }
}