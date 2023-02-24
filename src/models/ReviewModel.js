const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema({
    review:{
        type:String,
        required:true,
        maxLength:100
    },
    rating:{
        type:Number,
        min:1,
        max:10,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
     },
     course:{
        type:mongoose.Schema.ObjectId,
        ref:"Course"
    },
    userName:{
      type:String
    }

},{timestamps:true})



// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(courseId) {
    const obj = await this.aggregate([
      {
        $match: { course: courseId }
      },
      {
        $group: {
          _id: '$course',
          averageRating: { $avg: '$rating' }
        }
      }
    ])
  
    try {
      await this.model('Course').findByIdAndUpdate(courseId, {
        averageRating:Math.floor(obj[0].averageRating) 
      })
    } catch (err) {
      console.error(err);
    }
  }
  
  // Call getAverageCost after save
  reviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.course);
  })
  
  // Call getAverageCost before remove
  reviewSchema.post('remove', async function() {
    await this.constructor.getAverageRating(this.course);
  })

  const Review = mongoose.model("Review",reviewSchema)


module.exports = Review