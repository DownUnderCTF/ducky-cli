import * as path from 'node:path';
import { templateFile } from '../../../util/template';


import { BaseGenerator } from "./base";

const PROJECT_ID = '...';  // TODO

const TMPL_KUBE = path.join(__dirname, 'templates/tcp/kube.yml');
const TMPL_KUSTOMIZATION = path.join(__dirname, 'templates/tcp/kustomization.yml');


export class TcpGenerator extends BaseGenerator {
    async generate(): Promise<void> {
        await super.generate();

        await Promise.all([
            this.generateKube(),
            this.generateKustomization(),
        ]);
    }

    async generateKustomization(): Promise<string> {
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
            PORT: '31337',
        });
    }

    async generateKube(): Promise<string> {
        return await templateFile(TMPL_KUSTOMIZATION);
    }
}
