import config from "./config.js"

/**
 * Search movies by OMDb API at http://www.omdbapi.com/
 * @param {*} query Query string to search for
 * @param {*} page Page to search for
 */
export function searchMovie (query, page) {
    return fetch(`http://www.omdbapi.com/?s=${query}&page=${page}&type=movie&r=json&apikey=${config.OMDBAPI_KEY}`,
    {
        method: "GET",
        headers: {
            Accept: "application/json",
            Host: "www.omdbapi.com"
        }
    }
    ).then(resp=>resp.json())
}