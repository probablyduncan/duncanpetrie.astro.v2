import fs from "fs";
import { cmd } from "@probablyduncan/common/cmd";

const isWindows = process.platform === 'win32';
const pythonCommand = isWindows ? 'python' : 'python3';

function setupEnv() {

    if (!fs.existsSync(".venv")) {
        cmd(`${pythonCommand} -m venv .venv`);
    }

    cmd(isWindows
        ? `.venv\\Scripts\\activate`
        : `source .venv/bin/activate`);

    cmd(isWindows
        ? `.venv\\Scripts\\pip install -r tools/python_dependencies.txt`
        : `.venv/bin/pip install -r tools/python_dependencies.txt`
    );
}

setupEnv();