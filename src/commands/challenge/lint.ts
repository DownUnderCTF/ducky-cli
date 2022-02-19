import { Command, Flags } from "@oclif/core";
import * as chalk from "chalk";
import { CHALLENGE_CONFIGURATION_FILE_NAME } from "../../config";
import { OutputFormat, OUTPUT_FORMATS } from "../../ext/types";
import Linter, { LintResult } from "../../services/challenge/linters/Linter";
import { RuleLevel } from "../../services/challenge/linters/rules";
import { findUpWith } from "../../util/fsutil";

export type FindingSummary = {
    passed?: LintResult[];
    ignored?: LintResult[];
    findings: LintResult[];
};

export default class LintCommand extends Command {
    static description = "Lint a challenge for misconfigurations";

    static flags = {
        ignore: Flags.string({
            char: "I",
            description: "Comma separated list of rule ids to ignore",
            default: "",
        }),
        directory: Flags.string({
            char: "D",
            description: "Challenge directory to lint",
            default: async () =>
                await findUpWith(CHALLENGE_CONFIGURATION_FILE_NAME, "./"),
        }),
        verbose: Flags.boolean({
            description: "Verbose mode",
        }),
        format: Flags.enum<OutputFormat>({
            description: "Output Format",
            default: "text",
            options: [...OUTPUT_FORMATS],
        }),
    };

    async run(): Promise<void> {
        const { flags } = await this.parse(LintCommand);
        this.debug("Running linter", flags);

        const ignoredCodes = flags.ignore
            .split(",")
            .map((c) => c.trim().toUpperCase());
        const linter = new Linter(flags.directory);
        const findings = await linter.lint();

        const passedFindings = findings.filter((f) => f.violation === null),
            failedFindings = findings.filter((f) => f.violation !== null);

        const ignoredFindings = failedFindings.filter((f) =>
                ignoredCodes.includes(f.rule.code)
            ),
            actionableFindings = failedFindings.filter(
                (f) => !ignoredCodes.includes(f.rule.code)
            );

        const groupedFindings =
            this.partitionFindingsByLevel(actionableFindings);

        if (flags.format === "text") {
            if (flags.verbose) {
                this.reportFindingsText(passedFindings, "✔️ ", chalk.green);
                this.reportFindingsText(ignoredFindings, "🔇", chalk.gray);
            }

            this.reportFindingsText(
                groupedFindings.fatal,
                "⛔ ",
                chalk.bgRed.whiteBright
            );
            this.reportFindingsText(groupedFindings.error, " ❗", chalk.red);
            this.reportFindingsText(
                groupedFindings.warning,
                "⚠️ ",
                chalk.yellow
            );
            this.reportFindingsText(groupedFindings.notice, "ℹ️", chalk.blue);
        } else if (flags.format === "json") {
            this.reportFindingsJson({
                ...(flags.verbose
                    ? {
                          passed: passedFindings,
                          ignored: ignoredFindings,
                      }
                    : {}),
                findings: actionableFindings,
            });
        }

        if (groupedFindings.fatal.length + groupedFindings.error.length > 0) {
            this.exit(1);
        }
    }

    private partitionFindingsByLevel(
        findingList: LintResult[]
    ): Record<RuleLevel, LintResult[]> {
        const partitioned: Record<RuleLevel, LintResult[]> = {
            fatal: [],
            error: [],
            warning: [],
            notice: [],
        };
        findingList.forEach((f) => partitioned[f.rule.level].push(f));
        return partitioned;
    }

    private reportFindingsText(
        findingList: LintResult[],
        prefix = "",
        color: chalk.Chalk = chalk.reset
    ): void {
        prefix = process.stdout.isTTY ? `${prefix} ` : "";
        findingList.forEach((finding) => {
            this.log(
                color(
                    `${prefix}${finding.rule.level} ${finding.rule.code}: ${finding.rule.description}`
                )
            );
            if (finding.violation?.message) {
                this.log(
                    color(
                        `${" ".repeat(prefix.length + 2)}  ${
                            finding.violation.message
                        }`
                    )
                );
            }
        });
    }

    private reportFindingsJson(findingsSummary: FindingSummary): void {
        this.log(
            JSON.stringify(
                findingsSummary,
                null,
                process.stdout.isTTY ? 2 : undefined
            )
        );
    }
}
