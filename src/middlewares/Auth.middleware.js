import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const verifyJwt = asyncHandler(async (req,_, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
       req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid token");
    }

});