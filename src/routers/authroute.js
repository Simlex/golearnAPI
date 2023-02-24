const express = require("express")
const { register,login, getMe, generateToken, resetPassword, uploadDisplayPicture, } = require("../controllers/auth")
const {authorize,access}= require("../middleware/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/login",login)

router.route("/")
.post(register)
.get(authorize,getMe)

router.post("/generatetoken",generateToken)

router.put("/resetpassword/:resetToken",resetPassword)

router.post("/uploaddisplaypicture",authorize,uploadPicture.single("displaypicture"),uploadDisplayPicture)


module.exports = router