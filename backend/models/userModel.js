const mongoose = require("mongoose");
const validator = require("validator");
const  bcrypt =  require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        requires :[true, "Please enter your name"],
        maxLength:[30,"Cannot exceed 30 characters"],
        minLength:[4, "Name should have more than 4 characters"]
    },
    email :{
        type: String,
        requires :[true, "Please enter your email"],
        unique : true,
        validate :[validator.isEmail, "Please enter valid email"]
    },
    password :{
        type: String,
        requires :[true, "Please enter your password"],
        minLength:[6, "Name should have more than 6 characters"],
        select : false

    },
    avatar:{
        
            public_id :{
                type: String,
                required: true
            },
            url :{
                type: String,
                required: true
            }
        
    },
    role:{
        type : String,
        default: "user"
    },

    resetPasswordToken : String,
    resetPasswordExpire : Date,
});
//pre is an event that is before save run this
//we cant use this keyword in nrml type like '=>' so we use function keyword

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password =await  bcrypt.hash(this.password,10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
    //random key given to the user separetely
    return jwt.sign({id : this._id},process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRE,
    });
};

// compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//forgot passwoord logic (generating password reset token)
userSchema.methods.getResetPasswordToken = function(){

    const resetToken = crypto.randomBytes(20).toString("hex");
    //hashing and adding to user Schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15*60*1000;//expire of reset password

    return resetToken;
}


module.exports = mongoose.model("User",userSchema)