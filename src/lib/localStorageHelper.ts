export type LocalStorageTypes = boolean | string | number | string[];

export function getFromLocalStorage<T extends LocalStorageTypes>(key: string, defaultValue: T): T {
    const val = localStorage.getItem(key);
    
    if (val === null) {
        return defaultValue;
    }

    return JSON.parse(val) as T;
}

export function setLocalStorage<T extends LocalStorageTypes>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}