import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { templateFile } from '../../../util/template';


import { BaseGenerator } from "./base";

const PROJECT_ID = '...';  // TODO

const TMPL_KUBE = path.join(__dirname, 'templates/web/kube.yml');
const TMPL_KUSTOMIZATION = path.join(__dirname, 'templates/web/kustomization.yml');


export class WebGenerator extends BaseGenerator {
    async generate(): Promise<void> {
        await super.generate();

        const kube = await this.generateKube();
        const kustomization = await this.generateKustomization();

        await fs.writeFile(
            path.join(this.challengePath, 'kube.yml'),
            kube,
        );

        await fs.writeFile(
            path.join(this.challengePath, 'kustomization.yml'),
            kustomization,
        );
    }

    async generateKube(): Promise<string> {
        const {nameSlug, category} = this.setupDescriptor;
        return await templateFile(TMPL_KUBE, {
            NAME_SLUG: nameSlug,
            CATEGORY: category,
            IMAGE: `gcr.io/${PROJECT_ID}/challenge/${nameSlug}:\${}`,
            // TODO
            LIMIT_CPU:  '500m',
            LIMIT_MEM:  '1024Mi',
            LIMIT_RCPU: '72m',
            LIMIT_RMEM: '256Mi',
            PORT: '8080',
        });
    }

    async generateKustomization(): Promise<string> {
        return await templateFile(TMPL_KUSTOMIZATION);
    }
}
