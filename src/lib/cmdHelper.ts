import { execSync } from "child_process";

export function cmd(cmd: string) {
    try {
        execSync(cmd, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Failed to execute: ${cmd}`);
        process.exit(1);
    }
}