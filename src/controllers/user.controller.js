import { asyncHandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

 



const generateAccessAndRefreshToken= async(userId)=>{
    try {
        const user = await User.findById(userId);
         const accessToken =  user.generateAccessToken();
         const refreshToken =  user.generateRefreshToken();
        console.log(refreshToken);

         user.refreshToken = refreshToken ;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh Token");
    }
}





const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User or email is already exist");
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
   console.log(avatarLocalPath);
    //const coverImageLocalpath=req.files?.coverImage[0].path;
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalpath = req.files.coverImage[0].path
    };

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    //console.log(avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullname,
        password,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log(createdUser);
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));

})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "usename or password is required");

    }
    const registerdUser = await User.findOne({
        $or:[{email},{password}]
    });
  //  console.log(registerdUser);
    if (!registerUser) {
        throw new ApiError(400, "user dosesn't exist");
    }

     const isCorrect = await registerdUser.isPasswordCorrect(password);
    

     if (!isCorrect) {
         throw new ApiError(400, "password is incorrect");
     }

     const { accessToken, refreshToken } = await generateAccessAndRefreshToken(registerdUser._id);
     console.log(accessToken);
     const loggedInuser = await User.findById(registerdUser._id).select("-password -refreshToken");
     console.log(loggedInuser);

     const options = {
         httpOnly: true,
         secure: true
     }
     return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(
             new ApiResponse(200, { registerdUser: loggedInuser, accessToken, refreshToken }, "User loggedIn Succesfully")
         )

 });

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
    {
        $unset: { 
            refreshToken:1
        }
    },
        {
            new: true
        });

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken ;
if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request");
}
try {
    const decodedToken= jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken);
    const user=await User.findById(decodedToken?._id);
    console.log(user);
    if(!user){
        throw new ApiError(401, "Invalid refresh Token");
    }
    
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh Token is expired or user");
    }
    
    const options={
        httpOnly:true,
        secure:true
    }
     const {newRefreshToken,accessToken}=await generateAccessAndRefreshToken(user._id);
    
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
         new ApiResponse(200, {accessToken,refreshToken:newRefreshToken},"Access  token refreshed")
     )
}catch(error) {
   throw new ApiError(401,"Invalid refreshToken");
}
});

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
};
