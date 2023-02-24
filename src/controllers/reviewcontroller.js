const Review = require("../models/ReviewModel")
const Course = require("../models/courseModel")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")



const createReview = asyncHandler(async(req,res,next)=>{
    
    const course = req.params.courseId
    const user = req.user.id
    const userName = req.user.userName


    // check if course exist
    const checkcourse = await Course.findById(course)
   
    if(!checkcourse) return next(new ErrorResponse(`no course with id ${course}`,404))

    
    // cant make more than one review fora tourist site
   let review = await Review.findOne({course,user})

   if(review)  return next(new ErrorResponse(`you cant make more than one review for ${course}`,400))

  
    req.body.course = course
    req.body.user = user
    req.body.userName = userName

    // create new review
    review = await Review.create(req.body)

    res.status(201).json({success:true,data:review})
})

// desc => get all review
// route => GET/api/v1/reviews &&
// desc => get all review for a course
// route => GET/api/v1/tourist/:touristId/review

const getReviews = asyncHandler(async(req,res,next)=>{
    
    //  get all review for a course 
     if(req.params.courseId){
    const course = req.params.courseId

    // check if course exist
    const checkCourse = await Course.findById(course)
   
    if(!checkCourse) return next(new ErrorResponse(`no course with id ${course}`,404))

    // get all review for a specific course
    const reviews = await Review.find({course}).populate({path:"course",select:"courseTitle courseDescription"})


    return res.status(200).json({success:true,count:reviews.length,data:reviews})
    }
    // get all review in DB
    const reviews =await Review.find({}).populate({path:"course",select:"courseTitle courseDescription"})

    res.status(200).json({success:true,count:reviews.length,data:reviews})
})


// desc => update review
// route => put/api/v1/reviews/:id

const updateReview = asyncHandler(async(req,res,next)=>{

    // get the review from db
    let review = await Review.findById(req.params.id)
   
    // check if the review is in DB
    if(!review) return next(new ErrorResponse(`no review with id ${req.params.id}`,404))

    // check the creator is the one updating
    if(req.user.id!=review.user)return next(new ErrorResponse(`you cant update review you did not create`,401))
    
    // update review
     review = await Review.findByIdAndUpdate(req.params.id,req.body,{new:true})

     res.status(200).json({success:true,data:review})

    
})

const getSingleReview = asyncHandler(async(req,res,next)=>{

    // get the review from db
    let review = await Review.findById(req.params.id)
   
    // check if the review is in DB
    if(!review) return next(new ErrorResponse(`no review with id ${req.params.id}`,404))
    

     res.status(200).json({success:true,data:review})

    
})

const deleteReview = asyncHandler(async(req,res,next)=>{

    // get the review from db
    let review = await Review.findById(req.params.id)
   
    // check if the review is in DB
    if(!review) return next(new ErrorResponse(`no review with id ${req.params.id}`,404))

    // check the creator is the one updating
    if(req.user.id!=review.user && req.user.role != "admin")return next(new ErrorResponse(`you cant delete review you did not create`,401))
    
    // delete review
    review.remove()
    
    res.status(200).json({success:true,msg:`successfully deleted review with id${req.params.id}`})

    
})




module.exports = {createReview,getReviews,updateReview,deleteReview,getSingleReview}
