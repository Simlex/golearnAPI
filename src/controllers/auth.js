const User = require("../models/UserModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const fs = require("fs")
const cloudinary = require("../utils/cloudinary")

const register = asyncHandler( async(req,res,next)=>{
    
    let {firstName,lastName,userName,email,password,role,phoneNumber} = req.body

    
    // check if email exist
    const checkMail = await User.findOne({email})
    if(checkMail) return next(new ErrorResponse(`${email} has already been used by another user`,400))

    
    // check if username is already in use
    const checkUserName = await User.findOne({userName})
    if(checkUserName) return next(new ErrorResponse(`${userName} has already been used by another user`,400))
    
    // hash password
    password = await bcrypt.hash(password,12)

    const user =await User.create({firstName,lastName,userName,email,password,role,phoneNumber})

    if(!user)  return next(new ErrorResponse(`user could not be created`,500))

    // res.status(201).json({success:true,data:user})
    sendCookie(user,200,res)
})

const login = asyncHandler( async(req,res,next)=>{
    const {email,password,userName} = req.body
    
    // check for empty fields
    if(!email && !userName) return next(new ErrorResponse("please enter your email or username",400))

    if(!password) return next(new ErrorResponse("please enter your password",400))


    const user = await User.findOne(email ? { email } : { userName }).select("+password")

    if(!user) return next(new ErrorResponse("invalid credentials",400))

    const validPassword = await bcrypt.compare(password,user.password)

    if(!validPassword) return next(new ErrorResponse("invalid credentials",400))

    sendCookie(user,200,res)


})

// cookie function
const sendCookie = (user,statusCode,res)=>{
    const token = jwt.sign({id:user._id,email:user.email,userName:user.userName,role:user.role,firstName:user.firstName,lastName:user.lastName,isSubscribed:user.isSubscribed},process.env.JWT_SECRET,{expiresIn:"30d"})
     const options = ({
         expires: new Date(Date.now()+2592000000),
         httpOnly:true
     })
     res.status(statusCode).cookie("token",token,options).json({success:true,token})
}


const getMe = asyncHandler( async(req,res,next)=>{
    const id = req.user.id

    const user = await User.findById(id)

    if(!user) return next(new ErrorResponse("user not found",404))

    res.status(200).json({success:true,data:user})
})

// desc => change password
// route => Put/api/v1/auth/changepassword

const changePassword = asyncHandler(async(req,res,next)=>{
    let {password,newPassword} = req.body
    const id = req.user.id

    let user = await User.findById(id).select("+password")

    // compare old password
    const validPassword = await bcrypt.compare(password,user.password)
    if(!validPassword) return next(new ErrorResponse("invalid password",400))

    newPassword = await bcrypt.hash(newPassword,12)

user = await User.findByIdAndUpdate(id,{password:newPassword},{new:true})

    res.status(200).json({success:true,msg:`password successfully changed`})
})

// desc => generate reset token for password reset
// route => post/api/v1/auth/generatetoken

const generateToken = asyncHandler(async(req,res,next)=>{
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user) return next (new ErrorResponse(`user with ${email} does not exist`,404))

    const resetToken = jwt.sign({email:user.email},process.env.JWT_SECRET)

    // set token to expire in 10 minutes
    const resetTokenExpire = Date.now()+600000

    user.resetToken = resetToken

    user.resetTokenExpire = resetTokenExpire

   await user.save()

    
    //   create a message 
    // const message = `click on the link to reset password :\n\n ${req.protocol}://${req.get("host")}/api/v1/auth/resettoken/${user.resetToken}`

   const message = `<h1>Password Reset</h1>
            <h2>Hello ${user.firstName}</h2>
            <p>Please reset your password by clicking on the following link</p>
            <a href=http://localhost:3000/resetpassword/${user.resetToken}> Click here</a>
            </div>`

    // send token to email
    try{
       await sendMail({
            email:user.email,
            subject:"click on this link to reset your password",
            message
        })
    }catch(error){
        console.log(error.message)
        user.resetToken = undefined
        user.resetTokenExpire = undefined
        await user.save()
        next(new ErrorResponse("message could not be sent",500))
    }
   
res.status(200).json({success:true,msg:"We have sent you an email to reset your password. Please check your email and follow the directions provided to retrieve your password."})

})

// desc => reset password
// route => PUT/api/v1/auth/resetpassword
const resetPassword = asyncHandler(async(req,res,next)=>{
   
    const resetToken = req.params.resetToken

    let password = req.body.password

    const user = await User.findOne({resetToken,resetTokenExpire:{$gt:Date.now()}})

    // check if token is valid   
    if(!user) return next(new ErrorResponse("Invalid token",400))

    password = await bcrypt.hash(password,12)

    user.password = password

    user.resetToken = undefined

    user.resetTokenExpire = undefined

    await user.save()

    res.status(200).json({success:true,msg:"password reset successful"})
    
})

const uploadDisplayPicture = asyncHandler(async(req,res,next)=>{

    const id = req.user.id

    const user = await User.findById(id)

    if(!user) return next(new ErrorResponse("No user found",404))

    const uploader = async (path) => await cloudinary.uploads(path , 'displaypicture')
    
    let url;
 
    const file = req.file
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    fs.unlinkSync(path)

    user.displayPicture = url.toString()

    await user.save()

    res.status(200).json({success:true,msg:"successfully uploaded display picture",data:user})

})

module.exports = {register,login,getMe,changePassword,generateToken,resetPassword,uploadDisplayPicture}



