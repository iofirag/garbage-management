import { Router } from 'express'
import { GarbageCtrl } from './garbage.controller'


export const garbageRouter: Router = Router()

garbageRouter  
    .post('/updateByLocation/:id', GarbageCtrl.updateFieldById)
    .post('/updateByEmptyDate/:id', GarbageCtrl.updateFieldById)

    .get('/getByLocationRange', GarbageCtrl.getByLocationRange)
    .get('/getByEmptyDate', GarbageCtrl.getByEmptyDate)
    
    .put('/createAndFetchTest', GarbageCtrl.createAndFetchTest)
    .put('/', GarbageCtrl.create)
    .get('/:id', GarbageCtrl.search)
    .delete('/:id', GarbageCtrl._delete)