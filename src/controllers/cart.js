const Course = require("../models/courseModel")
const Cart = require("../models/cartModel")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")

const createCart = asyncHandler(async(req,res,next)=>{
    const courseId = req.body.courseId

     const user = req.user.id

     const course = await Course.findById(courseId)
     if(!course) return next(new ErrorResponse(`course with id ${courseId} not found`,404))

     const cart = await Cart.findOne({user})

     if(cart){
         const index = cart.course.findIndex(course=>course.courseId==courseId)
         if(index>-1) {
            return next(new ErrorResponse(`Course already in cart`,400))
         }else{
            cart.course.push({courseId,courseTitle:course.courseTitle,price:course.price})
            
            cart.bill = cart.course.reduce((acc, curr) => {
                return acc + curr.price
             },0)

             await cart.save()

             return res.status(201).json({success:true,data:cart})
         }
     }else{
        const newCart = await Cart.create({user,course:[{courseId,courseTitle:course.courseTitle,price:course.price}],bill:course.price})

        return res.status(201).json({success:true,data:newCart})
     }
     

})

const getCart = asyncHandler(async(req,res,next)=>{
   
    const user = req.user.id
    const cart = await Cart.findOne({user})

    if(!cart) return next(new ErrorResponse(`No cart found`,404))

    return res.status(201).json({success:true,data:cart})
})

const removeCourse = asyncHandler(async(req,res,next)=>{

    const courseId = req.params.courseId

    const user = req.user.id


    const cart = await Cart.findOne({user})

    if(!cart) return next(new ErrorResponse(`No cart found`,404))

    const index = cart.course.findIndex(course=>course.courseId==courseId)
    console.log(index)
   
    if(index<0) return next(new ErrorResponse('No course in cart',400))

    cart.course.splice(index,1)

    cart.bill = cart.course.reduce((acc,curr)=>{
       return acc + curr.price
    },0)

    await cart.save()

    res.status(200).json({success:true,message:`course with id ${courseId} removed from cart`,data:cart})
    
})


// empty cart
const emptyCart = asyncHandler(async(req,res,next)=>{
    const user = req.user.id
    
    const cart = await Cart.findOne({user})

    if(!cart) return next(new ErrorResponse(`No cart found`,404))
    
    if(cart.course.length<1) return next(new ErrorResponse("No course in the cart",400))
   
    cart.course = []
   
    cart.bill = cart.course.reduce((acc,curr)=>{
        return acc + curr.price
    },0)
    await cart.save()

    res.status(200).json({success:true,message:"successfully emptied cart",data:cart})
    

}) 
module.exports = {createCart,getCart,removeCourse,emptyCart}
