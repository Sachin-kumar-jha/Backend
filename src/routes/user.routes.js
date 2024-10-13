import {Router} from "express";
import  {loginUser, registerUser,logOutUser}  from "../controllers/user.controller.js";
import {verifyJwt} from "../middlewares/Auth.middleware.js";
import {upload} from "../middlewares/multer.js"
import { refreshAccessToken } from "../controllers/user.controller.js";

const router=Router();

//router.route("/register").post(registerUser);
router.route("/register").post(
    upload.fields([
        {
           name:"avatar" ,
           maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser,
);
router.route("/login").post(loginUser);

//Secured routs
router.route("/logout").post(verifyJwt,logOutUser);
router.route("/refresh-token").post(refreshAccessToken);





export default router;
