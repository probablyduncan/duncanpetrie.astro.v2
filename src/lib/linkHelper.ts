import { marked } from "marked";

export const LINKS = {
    home: "/",
    info: "/about/",
    index: "/links/",
    work: "/links/",
    prints: "/prints/",
    palimpsest: "/palimpsest/",
    horizons: "/horizons/",
    heartland: "/heartland/",
    pigeon: "/pigeon/",
    lingermyth: "/lingermyth/",
    yearn: "/on-yearning/",
    wind: "/wind/",
    stars: "/stars/",
    baron: "/baron/",
    upstairs: "/man-upstairs/",
    fluffy: "/fluffy-cloud/",
    wiki: "https://www.youtube.com/watch?v=JRXZAaDxGCQ/",
    pizza: "https://youtu.be/-sBHX07eIMY/",
    songs: "/unfinished-songs/",
    // website: "/design/",
    email: "mailto:duncanpetrie1@gmail.com",
    mailto: "mailto:duncanpetrie1@gmail.com",
    instagram: "https://instagram.com/probablyduncan",
    youtube: "https://www.youtube.com/channel/UCdyoMZUOsWzPmZN-H916jxg",
    linkedin: "https://www.linkedin.com/in/probablyduncan/",
    github: "https://github.com/probablyduncan",
    wrapmap: "https://www.google.com/maps/d/viewer?mid=15A5_e_KS2Es4xs3ZhXmYR31dRmc0cpA",
    mnhp: "https://www.falmouth.ac.uk/study/undergraduate/marine-natural-history-photography",
    source: "https://github.com/probablyduncan/duncanpetrie.astro.v2",
    bsky: "https://bsky.app/profile/duncanpetrie.com",
    sancho: "/sancho",
    rats: "/rats",
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
    if (!isExternalLink && !href.startsWith("/") && !href.startsWith("#")) {
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

    // ok new strategy
    // we find the first closing bracket and get the opening bracket that's closest to it
    // if none then 

    let result = "";
    let cursor = 0;
    while (true) {

        // go through string and find the next <tag> tag. There could also be rogue < or > in there

        let nextOpening = html.indexOf("<", cursor);
        let nextClosing = html.indexOf(">", cursor);

        // if no more complete tags, we are done
        if (nextOpening === -1 || nextClosing === -1) {
            result += html.substring(cursor);
            break;
        }

        if (nextOpening < nextClosing) {
            // proper tag order, we just have to make sure there's not a closer "<" to the nearest ">"
            nextOpening = html.lastIndexOf("<", nextClosing);
        }
        else {
            // this means there's a ">" tag we need to skip
            nextClosing = html.indexOf(">", nextOpening);
        }

        result += html.substring(cursor, nextOpening) + html.substring(nextClosing + 1);
        cursor = nextClosing + 1;

    }

    return result;
}