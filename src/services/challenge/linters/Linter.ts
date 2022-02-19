import { RuleDefinition, rules, RuleViolation } from "./rules";

export type LintResult = {
    rule: RuleDefinition;
    violation: RuleViolation | null;
};

export default class Linter {
    constructor(private challengeDir: string) {}

    public async lint(): Promise<LintResult[]> {
        // 1. Process fatal rules first
        const fatalViolations = await this.processRuleSet(
            rules.filter((r) => r.level === "fatal")
        );
        if (fatalViolations.filter((r) => r.violation !== null).length > 0) {
            return fatalViolations;
        }

        // 2. Process everything else
        return await this.processRuleSet(
            rules.filter((r) => r.level !== "fatal")
        );
    }

    private async processRuleSet(
        rules: RuleDefinition[]
    ): Promise<LintResult[]> {
        return await Promise.all(
            rules.map(async (rule) => ({
                rule,
                violation: await this.processRule(rule),
            }))
        );
    }

    private async processRule(
        rule: RuleDefinition
    ): Promise<RuleViolation | null> {
        const ruleResult = await rule.check(this.challengeDir);
        if (typeof ruleResult === "string") {
            return {
                code: rule.code,
                message: ruleResult,
            };
        } else if (typeof ruleResult === "boolean" && !ruleResult) {
            return { code: rule.code };
        } else {
            return null;
        }
    }
}
