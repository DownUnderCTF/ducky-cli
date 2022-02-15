import { Command } from "@oclif/core";
import { CompletableFlag, ParserOutput } from "@oclif/core/lib/interfaces";
import * as inquirer from "inquirer";

type CommandClass = typeof Command;
type QuestionOpts<T> = Partial<inquirer.DistinctQuestion<T>>
export interface InquiredCommand<T extends inquirer.Answers = inquirer.Answers> extends CommandClass {
    inquiredFlags: { [k in keyof CommandClass['flags']]: QuestionOpts<T> };
}

function getBaseOptions<T>(flag: CompletableFlag<T>): QuestionOpts<T> {
    if(flag.type === 'option') {
        if(flag.options) {
            return {
                type: 'list',
                choices: flag.options
            };
        } else {
            return {
                type: 'input',
            };
        }
    }
    return {type: 'checkbox'};
}

export async function inquiredParse(this: Command, cmd: InquiredCommand): Promise<ParserOutput<any, {[name: string]: any}>> {
    const flags = await this.parse(cmd);
    const parsed = await inquirer.prompt(
        Object.entries(cmd.inquiredFlags).map(([k, v]) => ({
            name: k,
            ...getBaseOptions(cmd.flags[k]),
            ...v,
        })),
        flags,
    );

    return {
        ...flags,
        flags: {...flags.flags, ...parsed},
    };
}
