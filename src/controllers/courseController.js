const Course = require("../models/courseModel")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const User = require("../models/UserModel")
const fs = require("fs")
const cloudinary = require("../utils/cloudinary")

const craeteCourse = asyncHandler(async(req,res,next)=>{

    const publisher = req.user.id
   
    const publisherName = `${req.user.firstName} ${req.user.lastName}`

    req.body.publisherName = publisherName

    req.body.publisher = publisher

    const course = await Course.create(req.body)

    res.status(201).json({success:true,data:course})

})


const uploadCourseContent = asyncHandler(async(req,res,next)=>{
   
    const id = req.params.id
   
    const course = await Course.findById(id)

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    // if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    const title = req.body.title
    const youtube = req.body.youtube
    const file = req.file
    

    
if(file){
    const uploader = async (path) => await cloudinary.uploads(path , 'coursecontent')
    
    let url;
 
   
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    
    fs.unlinkSync(path)

    course.courseContent.push({title,youtube,content:url.toString()})
    
    await course.save()

}else{
    course.courseContent.push({title,youtube})

    await course.save()
}
    

  

    res.status(200).json({success:true,msg:"successfully uploaded course content",data:course})
})

const uploadCourseImage = asyncHandler(async(req,res,next)=>{
   
    const id = req.params.id
   
    const course = await Course.findById(id)

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    const uploader = async (path) => await cloudinary.uploads(path , 'courseimage')
    
    let url;
 
    const file = req.file
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    fs.unlinkSync(path)

    course.courseImage = url.toString()

    await course.save()

    res.status(200).json({success:true,msg:"successfully uploaded course image",data:course})
})

const updateCourse = asyncHandler(async(req,res,next)=>{

    let course = await Course.findById(req.params.id)

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))
    
    if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    course = await Course.findByIdAndUpdate(req.params.id,req.body,{new:true})

    res.status(200).json({success:true,data:course})
})

const deleteCourse = asyncHandler(async(req,res,next)=>{
   
    let course = await Course.findById(req.params.id)

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    course = await Course.findByIdAndDelete(req.params.id)
   
    res.status(200).json({success:true,data:{}})
})

const getCourse = asyncHandler(async(req,res,next)=>{

    const course = await Course.findById(req.params.id)

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    res.status(200).json({success:true,data:course})
})

const deleteCourseContent = asyncHandler(async(req,res,next)=>{

    const course = await Course.findById(req.params.id)

    const contentId = req.params.contentId

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    const index = course.courseContent.findIndex(courseContent=>courseContent._id==contentId)

    if(index<0) return next(new ErrorResponse("No content found"))


    course.courseContent.splice(index,1)

    await course.save()

    res.status(200).json({success:true,msg:"content successfully deleted",data:{}})
    
})

const updateCourseContent = asyncHandler(async(req,res,next)=>{

    const course = await Course.findById(req.params.id)

    const contentId = req.params.contentId

    if(!course) return next(new ErrorResponse(`No course with the id of ${req.params.id}`,404))

    if(course.publisher != req.user.id && req.user.role !== "admin") return next(new ErrorResponse("you cannot carry out this action",400))

    const index = course.courseContent.findIndex(courseContent=>courseContent._id==contentId)

    if(index<0) return next(new ErrorResponse("No content found"))

    const content = course.courseContent[index]

    content.title = req.body.title
    content.youtube = req.body.youtube

    const uploader = async (path) => await cloudinary.uploads(path , 'coursecontent')
    
    let url;
 
    const file = req.file
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    fs.unlinkSync(path)

    content.content = url.toString()

    await course.save()

    res.status(200).json({success:true,msg:"content successfully updated",data:course})
    
})

const getAllcourses = asyncHandler(async(req,res,next)=>{
    
    let query;
  
    //   make a copy of req.query
    const reqQuery = {...req.query}
   
    const remove = ["select","sort","page","limit"]
   
    remove.forEach(params=> delete reqQuery[params])
    
    let querystring = JSON.stringify(reqQuery)
    
    querystring = querystring.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)
   
    querystring = JSON.parse(querystring)
    
    query = Course.find(querystring)
   
    if(req.query.select){
        const variables = req.query.select.split(",").join(" ")
        query = query.select(variables)
    }
  
    if(req.query.sort){
     const variables = req.query.sort.split(",").join(" ")
     query = query.sort(variables)
  }else{
     query = query.sort("-createdAt")
  }
    
     const page = parseInt(req.query.page,10) || 1
    
     const limit = parseInt(req.query.limit,50)||100
    
     const startIndex = (page-1)*limit
    
     const endIndex = page*limit
    
     const total =await Course.countDocuments()
    
     query = query.skip(startIndex).limit(limit)

    const course = await query
    
    const pagination = {}
     if(endIndex<total){
         pagination.next={
             page:page + 1,
             limit
         }
     }
     if(startIndex>0){
         pagination.previous={
             page:page - 1,
             limit
         }
     }

      
   res.status(200).json({success:true,Total:course.length,pagination,data:course})
})

const allCourseByAPublisher = asyncHandler(async (req,res,next)=>{
   
    const { page = 1, limit = 10 } = req.query
   
    const course = await Course.find({publisher:req.params.id})
      .sort("CreatedAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

      if(course.length < 1) return next(new ErrorResponse("No course created by this publisher",404))
  
    res.status(200).json({success:true,Total:course.length,data:course})
})

   

module.exports = {craeteCourse,uploadCourseContent,updateCourse,deleteCourse,deleteCourseContent,getCourse,updateCourseContent,getAllcourses,allCourseByAPublisher,uploadCourseImage} 