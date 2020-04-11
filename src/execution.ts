import * as exec from "@actions/exec";


export async function executeInit(root: string, commandLine: string | null): Promise<number> {

    if (commandLine == null) {
        return 0
    }

    const status: number = await exec.exec(commandLine, undefined, {
        cwd: root,
        ignoreReturnCode: true,
        listeners: undefined
    });

    return status
}

export async function execute(executable: string, root: string, argv: string[]): Promise<BuildResult> {

    let publishing = false;
    let buildScanUrl: string | undefined;

    const status: number = await exec.exec(executable, argv, {
        cwd: root,
        ignoreReturnCode: true,
        listeners: {
            stdline: (line: string) => {
                if (line.startsWith("Publishing build scan...")) {
                    publishing = true;
                }
                if (publishing && line.length == 0) {
                    publishing = false
                }
                if (publishing && line.startsWith("http")) {
                    buildScanUrl = line.trim();
                    publishing = false
                }
            }
        }
    });

    return new BuildResultImpl(status, buildScanUrl);
}

export interface BuildResult {
    readonly status: number
    readonly buildScanUrl?: string
}

class BuildResultImpl implements BuildResult {
    constructor(
        readonly status: number,
        readonly buildScanUrl?: string
    ) {
    }
}
