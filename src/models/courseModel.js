const mongoose = require("mongoose")


const courseSchema = mongoose.Schema({
    publisher:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    publisherName:{
        type:String,
        required:true
    },
    courseTitle:{
        type:String,
        required:true
    },
    courseDescription:{
        type:String,
        required:true
    },
    courseDuration:{
        type:String,
        required:true
    },
    averageRating:{
        type:Number
    },
    category:{
        type:String,
        required:true,
    },
    courseContent:[{
        title:{
            type:String
        },
        content:{
            type:String
        },
        youtube:{
            type:String
        }
    }],
    whatToLearn:{
        type:Array,
        required:true
    },
    requirement:{
        type:[String],
        required:true
    },
    audience:{
        type:[String],
        required:true
    },
    materials:{
        type:[String],
        required:true
    },
    price:{
        type:Number,
        required:true,
        default:0
    },
    link:String,
    tags:{
        type:[String],
        required:true
    },
    courseImage:{
        type:String
    },
},{timestamps:true})

const Course = mongoose.model("Course",courseSchema)

module.exports = Course