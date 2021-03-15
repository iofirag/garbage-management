export function parseLocation(location) {
    if (!location) {
        return
    }
    if (Array.isArray(location) && location.length === 2) {
        return {lat: location[0], lon: location[1]}
    } else if (location && 'lat' in location && 'lon' in location) return location
    // else if (location.length && )
    else return
}