const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id : "this is sampleid",
            url : "profileurl"
        },
    });

    const token = user.getJWTToken();

    sendToken(user,200,res);
});

// login user
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{

    const {email,password} = req.body;

    // checking if user has given email nd paswd both

    if(!email || !password){
        return next(new ErrorHandler("Please enter email nd password",400));
    }

    // for matching the pswd with mail use select
    const user = await User.findOne({email }).select("+password");
    if(!user){
        return next(new ErrorHandler("invalid email or password",401));
    }

    const isPasswordMatched =await  user.comparePassword(password); 
    if(!isPasswordMatched){
        return next(new ErrorHandler("invalid email or password",401));
    }

    const token = user.getJWTToken();

    sendToken(user,200,res);
});

// logout user
exports.logout = catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token", null,{
        expires:new Date(Date.now()),
        httpOnly : true
    })

    res.status(200).json({
        success:true,
        message:"loggedOut"
    });
});

//  forget  password
exports.forgetPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

    // get reset pswd token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset toekn is :- \n\n ${resetPasswordUrl} \n\n If you are not requested this email , please ignore it`;

    try {
        await sendEmail({
            email : user.email,
            subject:`Ecommerce PAssword Recovery`,
            message,
        });

        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} successfully`
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    };
});

// reset password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
     //accessing the email url sent (hashing the token)
     const resetPasswordToken = crypto
     .createHash("sha256")
     .update(req.params.token)
     .digest("hex");
     
    //now find the user who is trying to reset password
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire :{$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("reset password  token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("password dosen't match",400));
    }

    user.password = req.body.password;
     //make undefined and save in DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user,200,res);
});