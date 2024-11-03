import { marked } from "marked";
import astroConfig from "../../astro.config.mjs";

export const LINKS = {
    home: astroConfig.base + "/",
    info: astroConfig.base + "/about/",
    index: astroConfig.base + "/links/",
    prints: astroConfig.base + "/prints/",
    palimpsest: astroConfig.base + "/palimpsest/",
    horizons: astroConfig.base + "/horizons/",
    heartland: astroConfig.base + "/heartland/",
    pigeon: astroConfig.base + "/pigeon/",
    lingermyth: astroConfig.base + "/lingermyth/",
    yearn: astroConfig.base + "/on-yearning/",
    wind: astroConfig.base + "/wind/",
    stars: astroConfig.base + "/stars/",
    baron: astroConfig.base + "/baron/",
    upstairs: astroConfig.base + "/man-upstairs/",
    fluffy: astroConfig.base + "/fluffy-cloud/",
    wiki: astroConfig.base + "https://www.youtube.com/watch?v=JRXZAaDxGCQ/",
    pizza: astroConfig.base + "https://youtu.be/-sBHX07eIMY/",
    songs: astroConfig.base + "/unfinished-songs/",
    // website: "/design/",
    email: astroConfig.base + "mailto:duncanpetrie1@gmail.com",
    instagram: astroConfig.base + "https://instagram.com/probablyduncan",
    youtube: astroConfig.base + "https://www.youtube.com/channel/UCdyoMZUOsWzPmZN-H916jxg",
    linkedin: astroConfig.base + "https://www.linkedin.com/in/probablyduncan/",
    github: astroConfig.base + "https://github.com/probablyduncan",
    wrapmap: astroConfig.base + "https://www.google.com/maps/d/viewer?mid=15A5_e_KS2Es4xs3ZhXmYR31dRmc0cpA",
} as const;


export function resolveMarkdownLinks(markdownInput: string) {
    return marked.parseInline(markdownInput, { renderer: markedRendererWithLink() });
}

export function markedRendererWithLink(renderer = new marked.Renderer()) {
    renderer.link = ({ href, title, text }) => {
        const { href: hrefResolved, title: titleResolved, rel, target } = resolveLink({ href, title, innerHtml: text });
        return `<a href="${hrefResolved}" title="${titleResolved}" target="${target}" rel="${rel}">${text}</a>`;
    }
    return renderer;
}

export function resolveLink({ href, title, innerHtml, forceNewTab }: {
    href: string
    title?: string
    innerHtml?: string
    forceNewTab?: boolean
}): {
    href: string,
    title: string,
    target: '_blank' | '_self',
    rel: 'noopener noreferrer' | '',
} {
    const innerText = stripHtmlTags(innerHtml);
    const innerTextLower = innerText.toLowerCase();

    if (!href) {
        if (innerTextLower in LINKS) {
            // if the text fits one of the presets, use that href (prefil links to socials, for example)
            // i.e. "my [Linkedin]()" should go to linkedin.com
            href = LINKS[innerTextLower];
        }
        else {
            // otherwise, assume we're linking to a page that's the same name as the text
            // i.e. "[Writing]()" should go to /writing
            href = innerTextLower.replace(' ', '-');
        }
    }
    else if (href.toLowerCase() in LINKS) {
        // if href exists, but is the key to a preset link, get the real link
        // i.e. "my [Linkedin profile](linkedin)" should go to https://linkedin..etc
        href = LINKS[href.toLowerCase()];
    }

    const isExternalLink = href.startsWith("http") || href.startsWith("mailto") || href.endsWith("pdf");
    const useNewTab = isExternalLink || forceNewTab;

    // basically, if we got the link from the inner text
    // (like "[writing]()", not like "[google.com]()")
    if (!isExternalLink && !href.startsWith("/")) {
        href = "/" + href;
    }

    return {
        href,
        title: title ?? (useNewTab ? href : innerText),
        target: useNewTab ? '_blank' : '_self',
        rel: useNewTab ? 'noopener noreferrer' : '',
    }
}

export function stripHtmlTags(html: string) {

    if (!html || !html.length) {
        return "";
    }

    let text = html;
    while (text.includes("<") || text.includes(">")) {
        const leftIndex = text.indexOf("<");
        const rightIndex = text.indexOf(">");

        if (leftIndex === -1) {
            text = text.substring(rightIndex + 1);
        } else if (rightIndex === -1) {
            text = text.substring(0, leftIndex);
        } else {
            text = text.substring(0, leftIndex) + text.substring(rightIndex + 1);
        }
    }

    return text;
}