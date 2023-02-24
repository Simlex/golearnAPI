const {craeteCourse,uploadCourseContent, updateCourse, deleteCourse, deleteCourseContent, getCourse, updateCourseContent, getAllcourses, allCourseByAPublisher, uploadCourseImage} = require("../controllers/courseController")
const express = require("express")
const {authorize,access}= require("../middleware/auth")
const upload = require("../utils/upload")
const uploadPicture = require("../utils/courseImage")


const router = express.Router()
const reviewRouter =require("./reviewRoute")
router.use("/:courseId/reviews",reviewRouter)

router.route("/")
.post(authorize,access("publisher","admin"),craeteCourse)
.get(getAllcourses)

router.post("/uploadcontent/:id",authorize,access("publisher","admin"),upload.single("coursecontent"),uploadCourseContent)

router.route("/:id")
.put(authorize,access("publisher","admin"),updateCourse)
.delete(authorize,access("publisher","admin"),deleteCourse)
.get(getCourse)

router.get("/publisher/:id",allCourseByAPublisher)

router.route("/:id/:contentId")
.delete(authorize,access("publisher","admin"),deleteCourseContent)
.put(authorize,access("publisher","admin"),upload.single("coursecontent"),updateCourseContent)

router.post("/uploadcourseimage/:id",authorize,access("publisher","admin"),uploadPicture.single("courseimage"),uploadCourseImage)

module.exports = router