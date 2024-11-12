import { execSync } from "child_process";
import path from "path";
import { cmd } from "../src/lib/cmdHelper";

const srcDir = path.join(process.cwd(), "src/assets/fonts");
const targetDir = path.join(process.cwd(), "public/fonts");

function processFont(name: string, options: {
    text?: string,
    unicode?: string,
    layoutFeatures?: string,

}) {

    const args: Record<string, string> = {
        "output-file": path.join(targetDir, name),
        flavor: "woff2",
        unicodes: options.unicode,
        text: options.text,
        "layout-features": options.layoutFeatures,
    }

    const command = `pyftsubset ` + path.join(srcDir, name) + Object.keys(args).reduce((prev, curr) => {
        if (args[curr]) {
            prev += ` --${curr}="${args[curr]}"`
        }

        return prev;
    }, "");

    console.log('Running:', command);
    cmd(command);
    console.log();
}

processFont("junicode.woff2", {
    text: "☞☜☝☟✝❀⸙☛☚◆◇†※⁜⁘⋗⁇⁈⁉‼‽→�",
    unicode: "U+0020-00BB, U+0298, U+02E0, U+02E4, U+10FB-16f0, U+2000-206F, U+2070-209F, U+20A0-20CF, U+2180-2182, U+2200-22FF, U+FB00-FB4F, U+2190-21BB, U+e270, U+e27d, U+e67d, U+e8b1, U+ef9f, U+f011, U+f01e, U+f1a5, U+f2fd, U+1034a, U+F0030-F0046",
    layoutFeatures: "dlig liga kern cv10", // hlig
});

const interSettings = {
    layoutFeatures: "ccmp locl mark mkmk liga salt aalt ss01 ss02 ss03 ss04 ss07 ss08 cv02 cv03 cv12 cv13 tnum zero calt dlig case kern dlig",
    unicode: "U+0000-017F, U+2000-206F, U+20A0-20CF, U+2100-22FF, U+25A0-27FF, U+2900-2BFF, U+2C60-2C7F",
}

processFont("inter.woff2", interSettings);
processFont("inter-italic.woff2", interSettings);