const { createCart, getCart, emptyCart, removeCourse } = require("../controllers/cart")
const express = require("express")

const {authorize,access}= require("../middleware/auth")

const router = express.Router()

router.route("/")
.post(authorize,createCart)
.get(authorize,getCart)
.delete(authorize,emptyCart)

router.delete("/:courseId",authorize,removeCourse)
module.exports = router
