const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    course:{
        type:Array
    },
    bill:{
        type:String
    }
},{timestamps:true})

const Order = mongoose.model("Order",orderSchema)

module.exports = Order