const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const Product = require("../models/productModel");
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

// get user detail
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    });
});

// Update user password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched =await  user.comparePassword(req.body.oldPassword); 
    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));
    } 

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password doesn't match",400));
    }

    user.password = req.body.newPassword;
    await user.save();


    sendToken(user,200,res);
});

// Update user profile
exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{

    const newUserData ={
        name:req.body.name,
        email:req.body.email,

    }

    // we will add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
    });
    sendToken(user,200,res);
});


// get all  Users (admin)
exports.getAllUser = catchAsyncErrors(async (req,res,next)=>{
    
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    });
});

// get single  User (admin)
exports.getSingleUser = catchAsyncErrors(async (req,res,next)=>{
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User doesn't exixt with ID : ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user
    });
});



//update user Role --admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    if (!req.body.name || !req.body.email) {
        return next(new ErrorHandler("Enter the name and email", 400));
    }

    //req.user.id is inbuilt
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});


//delete User Profile --admin
exports.deleteProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    //we will remove cloudinary change avatar later
    //req.user.id is inbuilt

    if (!user) {
        next(new ErrorHandler(`User not found with id : ${req.params.id}`, 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "User deleted Successfully",
    });
});





//Create new Review or update Review --user or admin
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    //if the user is aldready reviwed the product;
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString()) {
                (rev.rating = rating), (rev.comment = comment);
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({
        validateBeforeSave: false,
    });

    res.status(200).json({
        success: true,
    });
});


//GET all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler(`Product not found`, 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});


//delete review
exports.deleteProductReviews = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler(`Product not found`, 404));
    }
    //query -> ? after
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    const numOfReviews = reviews.length;

    const ratings =  avg / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
    });
});