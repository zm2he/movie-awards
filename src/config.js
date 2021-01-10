let config = {
    MAX_NOMINATIONS: 5,
    OMDBAPI_KEY: process.env.REACT_APP_OMDBAPI_KEY
}

// get key-value pair from local storage
export function getFromLocalStorage(key, defaultVal) {
    if (key) {
        const strVal = window.localStorage?.getItem(key);
        if (strVal) {
            return JSON.parse(strVal);
        }
    }
    return defaultVal;
}

// set key-value pair from local storage
export function setFromLocalStorage(key, value) {
    if (key !== undefined && key !== null) {
        window.localStorage?.setItem(key, JSON.stringify(value));
    }
}

// delete key-value pair from local storage
export function removeFromLocalStorage(key) {
    if (key) {
        window.localStorage?.removeItem(key);
    }
}

export default config;