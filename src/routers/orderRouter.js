const {checkout,getOrder} = require("../controllers/order")
const express = require("express")

const {authorize,access}= require("../middleware/auth")

const router = express.Router()



router.use(authorize)
router.post("/checkout",checkout)
router.get("/",getOrder)

module.exports = router