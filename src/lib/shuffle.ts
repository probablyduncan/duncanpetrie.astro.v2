/**
 * shuffles input array and returns same array.
 */
export function shuffleRef<T>(a: T[], i?: number, j?: number, e?: T): T[] {
    j = a.length;
    while (j) (i = (Math.random() * j--) | 0), (e = a[j]), (a[j] = a[i]), (a[i] = e);
    return a;
}

/**
 * Returns new shuffled array, leaving input array unchanged.
 */
export function shuffle<T>(arr: T[]): T[] {
    return arr.map(e => ({ value: e, sort: Math.random() }))
        .sort((i, j) => i.sort - j.sort)
        .map(({ value: e }) => e);
}