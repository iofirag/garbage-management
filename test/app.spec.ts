import axios from 'axios';


const newGarbageObj = {color:'red',type:4,location:{lat:33,lon:44},emptyDate:Date.now()}
const updateGarbageLocationObj = {field: 'location', value: {lat:22.5, lon:22.6}}
const updateGarbageEmptyDateObj = {field: 'emptyDate', value: Date.now()+10000}
const getByLocationRangeObj = {location: newGarbageObj.location, distance:100000}
const getByEmptyRangeObj = {emptyDate: updateGarbageEmptyDateObj.value}


describe('Testing api', () => {

    test('Insert/Delete/update location by id api', async () => {
        // Insert
        const insertRes: any = await insertGarbage(newGarbageObj)
        expect(insertRes.data.result).toEqual('created')
        
        // Update
        const updateLocationRes: any = await updateGarbage('location', insertRes.data._id, updateGarbageLocationObj)
        expect(updateLocationRes.data.result).toEqual('updated')
        const updateEmptyDateRes: any = await updateGarbage('emptyDate', insertRes.data._id, updateGarbageEmptyDateObj)
        expect(updateEmptyDateRes.data.result).toEqual('updated')

        // Get
        const getGarbageRes: any = await getByLocationRange(getByLocationRangeObj)
        expect(getGarbageRes.data[0]._source).toBeTruthy()
        const getByEmptyDateRes: any = await getByEmptyDate(getByEmptyRangeObj)
        expect(getByEmptyDateRes.data[0]._source).toBeTruthy()
        const getByIdRes: any = await getById(insertRes.data._id)
        expect(getByIdRes.data[0]._source).toBeTruthy()

        // Delete
        const deleteRes: any = await deleteGarbage(insertRes.data._id)
        expect(deleteRes.data.result).toEqual('deleted')
    })
})

function insertGarbage(data: {color: string, type: number, location: {lat:number,lon:number}, emptyDate: number}) {
    return axios({
        method: 'PUT',
        url: 'http://localhost:8810/garbage/',
        data
    })
}
function getByLocationRange(data: {location: {lat:number,lon:number}, distance: number}) {
    return axios({
        method: 'GET',
        url: `http://localhost:8810/garbage/getByLocationRange?lat=${data.location.lat}&lon=${data.location.lon}&kmDistance=${data.distance}`,
    }) 
}

function getByEmptyDate(data: {emptyDate: number}) {
    return axios({
        method: 'GET',
        url: `http://localhost:8810/garbage/getByEmptyDate?emptyDate=${data.emptyDate}`,
    }) 
}

function getById(id: string) {
    return axios({
        method: 'GET',
        url: `http://localhost:8810/garbage/${id}`
    })
}

function deleteGarbage(id: string) {
    return axios({
        method: 'DELETE',
        url: `http://localhost:8810/garbage/${id}`
    })
}

function updateGarbage(updateType: 'location'|'emptyDate', id: string, updateData: {field: string, value: any, }) {
    let url
    if (updateType === 'location') {
        url = `http://localhost:8810/garbage/updateByLocation/${id}`
    } else if (updateType === 'emptyDate') {
        url = `http://localhost:8810/garbage/updateByEmptyDate/${id}`
    } else {
        throw 'wrong update type'
    }
    return axios({
        method: 'POST',
        url,
        data: updateData
    })
}
