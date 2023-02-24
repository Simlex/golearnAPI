const multer = require('multer')
const path = require ('path')
const storage = multer.diskStorage({
    destination: './uploads/courseimage' , 
    filename: (req , file , cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})


const fileFilter = (req , file , cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null , true)
    } else {
        cb(new Error(`file format must be either jpeg or png`) , false)
    }
}

const uploadPicture = multer({
    storage: storage ,
    fileFilter: fileFilter
})

module.exports = uploadPicture