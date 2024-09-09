import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" ;


    // Configuration

    cloudinary.config({ 
        cloud_name:`${process.env.CLOUD_NAME}`, 
        api_key:`${process.env.API_KEY}`, 
        api_secret: `${process.env.API_SECRET}`
    });


    const uploadOnCloudinary=async(localFilepath)=>{
        try {
            if (!localFilepath) return null;
            // Upload an image
            const response = await cloudinary.uploader.upload(localFilepath, {
                resource_type: "auto"
            });
            // console.log("files is uploaded on cloudinary",
            //      response.url
            //     );
        
            fs.unlinkSync(localFilepath);
            return response;
        }catch(error){
            fs.unlinkSync(localFilepath) //remove the 
            // locally saved temporary file as 
            // the uploaded operation is failed
            return null;
        }
    }
    
 export  {uploadOnCloudinary};