const multer = require('multer')
const path = require ('path')
const storage = multer.diskStorage({
    destination: './uploads/coursecontent' , 
    filename: (req , file , cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})


const fileFilter = (req , file , cb) => {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mwv') {
        cb(null , true)
    } else {
        cb(new Error(`file format must be either mp4 or wmv`) , false)
    }
}

const upload = multer({
    storage: storage ,
    fileFilter: fileFilter
})

module.exports = upload