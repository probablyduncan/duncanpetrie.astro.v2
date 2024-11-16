/**
 * 
 * LIGHTROOM/EXPORT/IMPORT NOTES
 * 
 * Caption: 
 *  - should be the name of the photo, like 'Pole over field, St. Mawes'
 *  - first letter capitalized, comma, location
 *  - should not end in period
 * 
 * Location, City, State/Province, Country are all added to Keywords (Tags)
 *  - duplicates will be removed
 *  - all will be lowercase
 *  - use spaces/punctuation when necessary
 *  - these tags will be used for filters in ui
 * 
 * Run `npm run photoimport` to generate images and metadata
 * 
 * 
 * 
 * DITHERING POSSIBLE LIBRARIES:
 *  - Vibrant (only generates palette) https://www.npmjs.com/package/@behold/sharp-vibrant
 *  - RgbQuant (needs virtual canvas?) https://www.npmjs.com/package/rgbquant
 *  - Virtual canvas https://www.npmjs.com/package/canvas
 *  - GraphicsMagick has an orderedDither fn https://www.npmjs.com/package/gm
 * 
 */


import fs from 'fs';
import path from 'path';
import exifr from 'exifr'
import sharp from 'sharp'
import { PHOTO_NAMES, type PhotoName, type PhotoTag } from '../data/photoTypes.generated';
import astroConfig from '../../astro.config.mjs';
import { toSeveral, type SingleOrSeveral } from './singleOrSeveral';

//#region PhotoData types

export const SIZE_DATA = {
    large: {
        ext: '_l.webp',
        width: 2000,
        webp: {
            quality: 80,
            effort: 6,
        },
    },
    medium: {
        ext: '_m.webp',
        width: 800,
        webp: {
            quality: 80,
            effort: 6,
        },
    },
    small: {
        ext: '_s.webp',
        width: 400,
        webp: {
            quality: 80,
            effort: 6
        },
    }
} as const;

export type ImageSize = keyof typeof SIZE_DATA;
export type SizeData = typeof SIZE_DATA[ImageSize];

interface IPhotoDataBase {

    name: PhotoName;
    paths: Record<ImageSize, string>

    caption: string;
    datestring: string;
    tags: PhotoTag[];
    rating: number;

    camera: string;
    lens: string;
    focallength: string;
    aperture: number;
    shutter: number;
    iso: number;

    ratio: number;
}

interface PhotoDataJSONEntry extends IPhotoDataBase { }
class PhotoDataJSONEntry implements IPhotoDataBase {

    constructor(name: string, paths: Record<ImageSize, string>, exif: any, sharpMetadata: sharp.Metadata) {

        this.name = name as PhotoName;
        this.paths = paths;

        this.caption = exif.ImageDescription;
        this.datestring = exif.DateTimeOriginal;
        this.rating = exif.Rating ?? 0;

        this.camera = exif.Model;
        this.lens = exif.LensModel;
        this.focallength = exif.FocalLength;
        this.aperture = exif.FNumber;
        this.shutter = exif.ExposureTime;
        this.iso = exif.ISO;

        this.ratio = sharpMetadata.width / sharpMetadata.height;

        // add explicit tags and additional tags
        this.tags = [];
        this.addTagsIfExist(exif.Keywords);
        this.addTagsIfExist(exif.XPKeywords);
        this.addTagsIfExist(PhotoDataJSONEntry.additionalTags.map(t => exif[t]));
    }

    private static additionalTags: string[] = ['Sublocation', 'City', 'State', 'Country', 'Location'] as const;

    private addTagsIfExist(tags: SingleOrSeveral<string>) {

        toSeveral(tags).forEach(tag => {
            if (!tag) {
                return;
            }

            tag = tag.toLowerCase();
            if (!this.tags.includes(tag as PhotoTag)) {
                this.tags.push(tag as PhotoTag);
            }
        })
    }
}

interface IPhotoDataEnhanced extends IPhotoDataBase {

    date: Date;
    joinedCaption: string;
    joinedSettings: string;
    joinedCamLens: string;
}

export interface PhotoData extends IPhotoDataEnhanced { }
export class PhotoData implements IPhotoDataEnhanced {

    constructor(json: PhotoDataJSONEntry) {
        Object.assign(this, json);

        this.date = new Date(json.datestring);
        this.joinedCaption = json.caption ? `${json.caption}. ${this.date.getFullYear()}.` : '';
        this.joinedSettings = `1/${1 / json.shutter} sec, f/${json.aperture}, ISO ${json.iso}.`;
        this.joinedCamLens = `${json.lens}. ${json.camera}.`;
    }
}

//#endregion










//#region public photo getters

export function getPhotoByName(name: PhotoName): PhotoData {
    return getPhotosByKeyValue('name', name).find(() => true);
}

// export function getPhotoByTitle(title: string): PhotoData {
//     return getPhotosByKeyValue('title', title).find(e => true);
// }

export function getPhotosByMonth(dateInMonth: Date): PhotoData[] {
    const month = dateInMonth.getMonth();
    return getPhotos((photo) => photo.date.getMonth() === month);
}

export function getPhotosByTags(...searchTags: string[]): PhotoData[] {

    if (!searchTags || !searchTags.length) {
        return [];
    }

    return getPhotos((photo) => photo.tags.some(tag => searchTags.includes(tag)));
}

export function getPhotosByRating(rating: number): PhotoData[] {
    return getPhotos((photo) => photo.rating >= rating);
}

/**
 * @returns all photos which either have a name in `names` or a tag in `tags`, which do not also have a name in `excludeNames` or a tag in `excludeTags`
 */
export function getPhotosByNamesAndTags({ names = [], tags = [], excludeNames = [], excludeTags = [] }: { names?: PhotoName[], tags?: PhotoTag[], excludeNames?: PhotoName[], excludeTags?: PhotoTag[] }): PhotoData[] {

    if (!names?.length && !tags?.length) {
        return [];
    }

    return getPhotos((photo) => (tags.some(tag => photo.tags.includes(tag)) || names.includes(photo.name)) && !(excludeNames.includes(photo.name) || excludeTags.some(tag => photo.tags.includes(tag))));
}

//#endregion

//#region private photo getters

function getPhotosByKeyValue(key: string, value: any) {
    return getPhotos((photo) => photo[key as keyof PhotoData] === value);
}

function getPhotos(filter: (photoData: PhotoData) => boolean): PhotoData[] {
    return getAllPhotoData().filter(filter);
}

let _photoData: PhotoData[];
function getAllPhotoData(): PhotoData[] {

    if (!_photoData) {
        _photoData = readPhotoDataJSON().map((data: PhotoDataJSONEntry) => new PhotoData(data));
        _photoData.forEach(p => {
            p.paths.small = astroConfig.base + p.paths.small;
            p.paths.medium = astroConfig.base + p.paths.medium;
            p.paths.large = astroConfig.base + p.paths.large;
        });
    }

    return _photoData;
}

function readPhotoDataJSON(): PhotoDataJSONEntry[] {

    if (!fs.existsSync(PHOTO_DATA_PATH)) {
        return [];
    }

    const jsonBuffer = fs.readFileSync(PHOTO_DATA_PATH);
    return JSON.parse(jsonBuffer.toString()) as PhotoDataJSONEntry[];
}
//#endregion




//#region img/photo helpers

export async function getImgSize(src?: string): Promise<{ width: number; height: number; ratio: number; }> {

    const nogood: any = { width: 0, height: 0, ratio: 0 };

    if (!src) {
        return nogood;
    }

    const fullPath = path.join(process.cwd(), 'public', src);

    if (!fullPath || !fs.existsSync(fullPath)) {
        return nogood;
    }

    const buffer = fs.readFileSync(fullPath)

    if (!buffer) {
        return nogood;
    }

    const metadata = await sharp(buffer).metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        ratio: metadata.width / metadata.height,
    }
}

export interface Image {
    photoName?: PhotoName;
    photoData?: PhotoData;
    src?: string;
    alt?: string;
    style?: string;
    ratio?: number;
    frame?: ImageFrame;
    size?: ImageSize
}

export interface ImageFrame {
    type?: "border" | "shadow" | "none";
    size?: number;   // px
    color?: string;  // hex or rgba or whatever
}

const IMAGE_FRAME_DEFAULTS: ImageFrame = {
    type: "none",
    size: 2,
    color: "black",
} as const;

export async function resolveImage(img: Image): Promise<Image> {

    if (img.src) {

        if (PHOTO_NAMES.includes(img.src as PhotoName)) {
            img.photoName ??= img.src as PhotoName;
            img.src = null;
        }
        else {
            img.ratio ??= (await getImgSize(img.src)).ratio;
        }
    }

    // try set photodata
    if (img.photoName) {
        img.photoData ??= getPhotoByName(img.photoName);
    }

    // now we can set from photodata
    if (img.photoData) {
        img.src ??= img.photoData.paths[img.size ?? "medium"];
        img.ratio ??= img.photoData.ratio;
        img.alt ??= img.photoData.joinedCaption;
    }

    // if no src, invalid image
    if (!img.src) {
        console.log(img);
        throw "Image object does not contain valid src!"
    }

    // set image frame defaults
    img.frame = Object.assign({...IMAGE_FRAME_DEFAULTS}, img.frame);

    img.style = resolveImageStyle(img);

    // temp fix for beta deployment
    if (!img.src.includes(astroConfig.base.replaceAll("\\", "").replaceAll("/", ""))) {
        img.src = path.join(astroConfig.base, img.src);
    }

    return img;
}

export function resolveImageStyle(img: Image): string {

    let style: any = {};

    switch (img.frame.type) {
        case "border":
            style.border = `${img.frame.size}px solid ${img.frame.color}`;
            break;
        case "shadow":
            style["box-shadow"] = `${img.frame.size}px ${img.frame.size}px 0px ${img.frame.color ?? "black"}`;
            style.width = `calc(100% - ${(img.frame.size)}px)`;
            style["margin-bottom"] = `${img.frame.size}px`;
            style["margin-right"] = `${img.frame.size}px`;
            break;
    }

    if (img.ratio) {
        style["aspect-ratio"] = img.ratio;
    }

    return [...Object.keys(style).map(prop => `${prop}: ${style[prop]};`), img.style].join(" ");
}

//#endregion



//#region image/json creation

const GENERATED_IMG_DIR = 'photos'
const PHOTO_SRC_DIR = path.join(process.cwd(), 'src', 'assets', 'photos');
const IMG_DEST_DIR = path.join(process.cwd(), 'public', GENERATED_IMG_DIR);
const PHOTO_DATA_PATH = path.join(process.cwd(), 'src', 'data', 'photoData.generated.json');
const PHOTO_TYPES_PATH = path.join(process.cwd(), 'src', 'data', 'photoTypes.generated.ts');

export async function importPhotos(generateAll: boolean = false) {

    const log = (m: string) => console.log('\x1b[33m', "IMAGE_SETUP >>", "\x1b[0m", m);

    log('beginning image setup');

    const errors = [];

    // get all image names in /assets
    const imgFileNames = fs.readdirSync(PHOTO_SRC_DIR);
    const photoData: PhotoDataJSONEntry[] = [];

    // [generated path, img buffer]
    const imagesToWrite: [string, Promise<Buffer>][] = [];

    if (!fs.existsSync(IMG_DEST_DIR)) {
        fs.mkdirSync(IMG_DEST_DIR);
        generateAll = true;
    }
    else if (generateAll) {
        // if dir exists and we're regenerating, first delete all generated images
        fs.rmSync(IMG_DEST_DIR, { recursive: true, force: true });
        fs.mkdirSync(IMG_DEST_DIR);
    }

    log('');
    log('👀  reading photo metadata');
    const allNamesForType: string[] = [];
    const allTagsForType = new Set<string>();
    for (let i = 0; i < imgFileNames.length; i++) {

        const sourcePath = path.join(PHOTO_SRC_DIR, imgFileNames[i]);

        // start get exif/metadata
        const buffer = fs.readFileSync(sourcePath);
        const exif = await exifr.parse(buffer, true);
        const metadata = await sharp(buffer).metadata();

        const name = safeFilename(path.parse(imgFileNames[i]).name, exif.ImageDescription, exif.DateTimeOriginal);

        // iterate through sizes and determine what to generate
        let paths: Record<ImageSize, string> = {} as Record<ImageSize, string>;;
        for (const size in SIZE_DATA) {

            const sizeData: SizeData = SIZE_DATA[size as ImageSize];
            const filename = name + sizeData.ext;
            const filepath = path.join(IMG_DEST_DIR, filename);

            if (generateAll || !fs.existsSync(filepath)) {
                imagesToWrite.push([filepath, sharp(buffer)
                    .resize(sizeData.width, sizeData.width, { fit: 'inside' })
                    .webp(sizeData.webp)
                    .toBuffer()
                ]);
            }

            paths[size as ImageSize] = path.normalize(path.join('/', GENERATED_IMG_DIR, filename));
        }

        photoData[i] = new PhotoDataJSONEntry(name, paths, exif, metadata);

        // this stuff will be added to a generated types file
        allNamesForType.push(name);
        photoData[i].tags.forEach(t => allTagsForType.add(t));

        log(`(${i + 1}/${imgFileNames.length}) \t${name}`);
    }

    // check if duplicate filenames
    const duplicateChecker = new Set();
    photoData.forEach((data) => {
        if (duplicateChecker.has(data.name)) {
            errors.push("duplicate caption: ", data.name);
        } else {
            duplicateChecker.add(data.name);
        }
    });

    if (errors.length > 0) {
        log("errors found:")
        errors.forEach(e => { log(e) });
        return;
    }

    log('');
    log(`✍   writing photo types to ${PHOTO_TYPES_PATH}`);
    const typeTS =
        `export const PHOTO_NAMES = ["${allNamesForType.join('", "')}"] as const;`
        + '\n\n'
        + `export type PhotoName = typeof PHOTO_NAMES[number];`
        + '\n\n'
        + `export const PHOTO_TAGS = ["${[...allTagsForType].join('", "')}"] as const;`
        + '\n\n'
        + `export type PhotoTag = typeof PHOTO_TAGS[number];`;

    fs.writeFileSync(PHOTO_TYPES_PATH, typeTS);
    log('complete 📄');

    log('');
    log(`✍   writing metadata to ${PHOTO_DATA_PATH}`);

    // first, get existing data ?? merge with added stuff ??
    // const existingData = getPhotoDataJSON();

    fs.writeFileSync(PHOTO_DATA_PATH, JSON.stringify(photoData.sort((a, b) => Date.parse(b.datestring) - Date.parse(a.datestring)), null, 4));
    log('complete 📄');

    if (imagesToWrite.length > 0) {

        log('');
        log(`📸  writing images to ${IMG_DEST_DIR}`);
        log('');

        let count = 0;
        imagesToWrite.forEach(async ([filepath, bufferPromise]) => {
            const start = performance.now();
            const buffer = await bufferPromise;
            fs.writeFileSync(filepath, buffer)
            const end = performance.now();
            const elapsed = (end - start);
            log(`(${++count}/${imagesToWrite.length}) \t${elapsed.toPrecision(4)}ms${elapsed > 100 ? ' ⏰' : ''} \t${path.basename(filepath)}`)
        });
    }
}

/**
 * @returns an image filename like {date}-{caption}, or {date}-{filename} if no caption
 */
function safeFilename(filename: string, caption: string, date: Date) {

    let safeFilename = filename;

    // if the image had a caption, we can turn that into the filename
    if (caption) {

        // normalize the string
        let normalized = caption.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
        // remove non-alphanumeric characters (keeping spaces)
        let alphanumericOnly = normalized.replace(/[^a-zA-Z0-9 ]/g, "");
    
        // replace spaces with dashes and trim any extra spaces
        safeFilename = alphanumericOnly.trim().replace(/\s+/g, "-");
    }

    if (date && date.getTime() !== 0) {
        safeFilename = date.toISOString().split('T')[0] + "-" + safeFilename;
    }

    return safeFilename.toLowerCase();
}

//#endregion