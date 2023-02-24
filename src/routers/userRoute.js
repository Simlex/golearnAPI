const express = require("express")
const subscribe = require("../controllers/subscription")
const {getAllUsers, allPublishers, getPublisher} = require("../controllers/user")

const {authorize,access}= require("../middleware/auth")


const router = express.Router()

router.get("/publishers",allPublishers)

router.get("/publishers/:id",getPublisher)


router.post("/subscribe",authorize,subscribe)


router.use(authorize,access("admin"))


router.get("/",getAllUsers)

module.exports = router