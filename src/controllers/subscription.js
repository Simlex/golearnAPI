const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const axios = require("axios");
const { sendMail } = require("../utils/sendMail");
const User = require("../models/UserModel");

const subscribe = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const isSubscribed = req.user.isSubscribed;

  if (isSubscribed)
    return next(new ErrorResponse("You have already subscribed", 400));

  // Check if the user's subscription is still active
  // In this example, we assume users subscribe for 1 year
  const currentYear = new Date().getFullYear();
  const expiryYear = new Date(req.user.subscriptionExpires).getFullYear();

  if (expiryYear >= currentYear) {
    return next(
      new ErrorResponse(
        "You already have an active subscription that expires on " +
          req.user.subscriptionExpires.toDateString(),
        400
      )
    );
  }

  // Get the Paystack reference number from the frontend
  const reference = req.body.reference;
  const user = await User.findById(userId);

  try {
    // Verify the Paystack transaction using the reference number
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    console.log(paystackResponse);

    console.log(paystackResponse.data);

    const { status } = paystackResponse.data.data;

    console.log(status);

    if (status !== "success") {
      return next(new ErrorResponse("Payment failed", 500));
    }

    // Update the user's subscription status
    user.isSubscribed = true;
    user.subscriptionExpires = new Date(Date.now() + 31536000000); // Set the subscription to expire in 1 year

    await user.save();

    // Send a subscription confirmation email to the user
    try {
      sendMail(
        user.email,
        "Click on this link to join exclusive telegram group",
        "Link"
      );
    } catch (error) {
      console.log(error.message);

      return next(new ErrorResponse("Message could not be sent", 500));
    }
  } catch (err) {
    console.log(err.message);
    return next(new ErrorResponse("Payment failed", 500));
  }

  return res.status(201).json({
    user: user,
    success: true,
    msg: "Payment successful",
    link: "Link",
  });
});

module.exports = { subscribe };
