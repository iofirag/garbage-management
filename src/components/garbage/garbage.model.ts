export interface IGarbage {
    id?: string,
    color: string,
    type: number,
    location: {lat: number, lon: number} | string | [number, number],
    emptyDate: number,
    timestamp: number,
}

// export class Garbage implements IGarbage {
//     id?: string
//     color: string
//     type: number
//     location: {lat: number, lon: number} | string | [number, number]
//     emptyDate: number
// }