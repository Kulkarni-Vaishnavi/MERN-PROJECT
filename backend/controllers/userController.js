const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");


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

