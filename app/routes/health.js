import {Router} from "express";


const healthRoute = Router()


healthRoute.get('/', async (req, res) => {
    try {
        return res.status(200).send('Success')
    } catch (error) {
        console.log(error)
    }

})


export default healthRoute