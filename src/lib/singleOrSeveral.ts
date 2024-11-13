export function toSeveral<T>(i: T | T[]): T[] {
    return Array.isArray(i) ? i : [i];
}

export type SingleOrSeveral<T> = T | T[];
