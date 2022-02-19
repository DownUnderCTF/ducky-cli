import test, { expect } from "@oclif/test";
import * as mockfs from "mock-fs";

import { mockOClifFS } from "../../helpers/fssetup";

import { LintResult } from "../../../src/services/challenge/linters/Linter";
import { FindingSummary } from "../../../src/commands/challenge/lint";

function getFindingByCode(findings: LintResult[], code: string) {
    return findings.find((f) => f.rule.code === code);
}

describe("challenge:lint", () => {
    beforeEach(() => {
        mockfs();
    });
    afterEach(mockfs.restore);

    test.do(() =>
        mockOClifFS({
            test: {},
        })
    )
        .stdout()
        .command([
            "challenge:lint",
            "--directory",
            "test",
            "--format",
            "json",
            "--verbose",
        ])
        .exit(1)
        .it("processes fatal rules", ({ stdout }) => {
            const result: FindingSummary = JSON.parse(stdout);

            expect(result).to.have.all.keys("passed", "ignored", "findings");
            expect(result.ignored).to.be.an("array").that.is.empty;

            expect(result.passed).to.be.an("array");
            expect(
                result.findings.filter(
                    (r: LintResult) => r.rule.level === "fatal"
                )
            ).length.greaterThan(0);
        });

    test.do(() =>
        mockOClifFS({
            test: {
                "ctfcli.yml": "",
                DELETEME: "",
            },
        })
    )
        .stdout()
        .command([
            "challenge:lint",
            "--directory",
            "test",
            "--ignore",
            "C000,C001,C002,C003,C004,C005,C006",
            "--format",
            "json",
            "--verbose",
        ])
        .exit(1)
        .it("checks structural rules", ({ stdout }) => {
            const result: FindingSummary = JSON.parse(stdout);

            expect(result).to.have.all.keys("passed", "ignored", "findings");

            expect(result.ignored).to.be.an("array");
            expect(result.passed).to.be.an("array");

            expect(result.findings).length.greaterThan(0);

            expect(getFindingByCode(result.findings, "S001")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "S002")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "S003")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "S004")).to.not.be
                .undefined;
        });

    test.do(() =>
        mockOClifFS({
            test: {
                "ctfcli.yml": JSON.stringify({}),
            },
        })
    )
        .stdout()
        .command([
            "challenge:lint",
            "--directory",
            "test",
            "--ignore",
            "S001,S002,S003,S004",
            "--format",
            "json",
            "--verbose",
        ])
        .exit(1)
        .it("checks basic configuration rules", ({ stdout }) => {
            const result: FindingSummary = JSON.parse(stdout);

            expect(result).to.have.all.keys("passed", "ignored", "findings");

            expect(result.ignored).to.be.an("array");
            expect(result.passed).to.be.an("array");

            expect(result.findings).length.greaterThan(0);

            expect(getFindingByCode(result.findings, "C000")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C001")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C002")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C003")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C004")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C005")).to.not.be
                .undefined;
        });

    test.do(() =>
        mockOClifFS({
            test: {
                "ctfcli.yml": JSON.stringify({
                    files: ["./test-nonexistant"],
                }),
            },
        })
    )
        .stdout()
        .command([
            "challenge:lint",
            "--directory",
            "test",
            "--ignore",
            "S001,S002,S003,S004,C000,C001,C002,C003,C004,C005",
            "--format",
            "json",
            "--verbose",
        ])
        .exit(1)
        .it("checks fs-touching configuration rules", ({ stdout }) => {
            const result: FindingSummary = JSON.parse(stdout);

            expect(result).to.have.all.keys("passed", "ignored", "findings");

            expect(result.ignored).to.be.an("array");
            expect(result.passed).to.be.an("array");

            expect(result.findings).length.greaterThan(0);

            expect(getFindingByCode(result.findings, "C006")).to.not.be
                .undefined;
            expect(getFindingByCode(result.findings, "C006")).satisfies(
                (f: LintResult) =>
                    f.violation?.message?.includes("test-nonexistant")
            );
        });

    test.do(() =>
        mockOClifFS({
            test: {
                "ctfcli.yml": JSON.stringify({
                    name: "Hello World",
                    category: "web",
                    description: "Hello World\n\nAuthor: ducky",
                    tags: ["easy"],
                    flags: ["DUCTF{}"],
                    files: ["./publish/pub.txt"],
                }),
                solve: {
                    "WRITEUP.md": "Solution",
                },
                publish: {
                    "pub.txt": "",
                },
                "README.md": "Readme",
            },
        })
    )
        .stdout()
        .command([
            "challenge:lint",
            "--directory",
            "test",
            "--format",
            "json",
            "--verbose",
        ])
        .it("can pass all rules", ({ stdout }) => {
            const result: FindingSummary = JSON.parse(stdout);
            expect(result.ignored).to.be.empty;
            expect(result.findings).to.be.empty;
        });
});
