const mongoose = require("mongoose")


const cartSchema = mongoose.Schema({
   user:{
       type:mongoose.Schema.ObjectId,
       ref:"User"
   },
   course:[{
       courseId:{
           type:String,
           required:true
       },
       courseTitle:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
   }],
   bill:{
       type:Number,

   }
})

const Cart = mongoose.model("Cart",cartSchema)

module.exports = Cart

