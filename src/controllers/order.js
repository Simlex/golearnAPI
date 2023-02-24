const Course = require("../models/courseModel")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const User = require("../models/UserModel")
const Cart = require("../models/cartModel")
const Order = require("../models/OrderModel")
const Flutterwave = require('flutterwave-node-v3');

const checkout = asyncHandler(async(req,res,next)=>{
    
    const user = req.user.id
   
    const ref = Math.floor(Math.random()*1000000+1)
    
    const mref = `rf${ref}`

    const cart = await Cart.findOne({user})


    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

    
if(cart){
    if(cart.bill>0){
        let payload =  {
            card_number: req.body.card_number,
            cvv: req.body.cvv,
            expiry_month: req.body.expiry_month,
            expiry_year: req.body.expiry_year,
            currency: "NGN",
            amount: cart.bill,
            redirect_url: "https://www.google.com",
            fullname: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            "phone_number": req.body.phoneNumber,
            "enckey": process.env.FLW_ENCRYPTION_KEY,
            "tx_ref": mref
        
        }
        
    
        try {
            
            const response = await flw.Charge.card(payload)
            //    console.log(response)
               if (response.meta.authorization.mode === 'pin') {
                    let payload2 = payload
                    payload2.authorization = {
                        "mode": "pin",
                        "fields": [
                            "pin"
                        ],
                        "pin": 3310
                    }
                    const reCallCharge = await flw.Charge.card(payload2)
            
                    const callValidate = await flw.Charge.validate({
                        "otp": "12345",
                        "flw_ref": reCallCharge.data.flw_ref
                    })
                    console.log(callValidate)
                    if(callValidate.status === 'success') {
                        
                        // create a new order
                        const order = await Order.create({
                            user,
                            course:cart.course,
                            bill: cart.bill
                        })
            
                        //delete cart
                         await Cart.findByIdAndDelete({_id: cart._id})
                       
                         return res.status(201).json({success:true,msg:"payment successful","flw_ref": reCallCharge.data.flw_ref,data:order})
                  
                        } else {
                       return next(new ErrorResponse("payment failed",500))
                    }
                }
                if( response.meta.authorization.mode === 'redirect') {
            
                    let url = response.meta.authorization.redirect
                    open(url)
                }
        } catch (error) {
            console.log(error.message)
            return next(new ErrorResponse("payment failed",500))
        }
        
    }else{
        const order = await Order.create({
            user,
            course:cart.course,
            bill: cart.bill
        })

        //delete cart
         await Cart.findByIdAndDelete({_id: cart._id}) 

         return res.status(201).json({success:true,data:order})
    }

   
   

} else {
    return next(new ErrorResponse("no cart found",404))
}

})

const getOrder = asyncHandler(async(req,res,next)=>{
   
    const user = req.user.id
    
    const order = await Order.find({user}).sort({ date: -1 })
   
    if(!order) return next(new ErrorResponse("No other found"))
   
    res.status(200).json({success:true,count:order.length,data:order})
})

module.exports = {checkout,getOrder}