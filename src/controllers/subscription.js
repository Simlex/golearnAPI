const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")

const Flutterwave = require('flutterwave-node-v3');
const sendMail = require("../utils/sendMail")
const User = require("../models/UserModel")


const subscribe = asyncHandler(async(req,res,next)=>{
    
    const id = req.user.id
    const isSubscribed = req.user.isSubscribed
   
    const ref = Math.floor(Math.random()*1000000+1)
    
    const mref = `rf${ref}`



    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

    
     if(isSubscribed == true) return next(new ErrorResponse("you have already subscribed",400))
    
        let payload =  {
            card_number: req.body.card_number,
            cvv: req.body.cvv,
            expiry_month: req.body.expiry_month,
            expiry_year: req.body.expiry_year,
            currency: "NGN",
            amount: 1000,
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
                    // console.log(callValidate)
                    if(callValidate.status === 'success') {
                        
                        // change subscription status
                        const user = await User.findById(id)
                       user.isSubscribed = true
                    
                       await user.save()

                       try{
                        await sendMail({
                             email:user.email,
                             subject:"click on this link to join exclusive telegram group",
                             message:"link"
                         })
                     }catch(error){
                         console.log(error.message)
                         
                         next(new ErrorResponse("message could not be sent",500))
                     }
            
                       
                       
                         return res.status(201).json({success:true,msg:"payment successful","flw_ref": reCallCharge.data.flw_ref,link:"link"})
                  
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
        
   
   
   



})

module.exports = subscribe
