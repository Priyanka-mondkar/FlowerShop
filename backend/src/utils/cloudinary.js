import dotenv from "dotenv"
dotenv.config()
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDIANRY_CLOUD_NAME,
  api_key: process.env.CLOUDIANRY_API_KEY,
  api_secret: process.env.CLOUDIANRY_API_SECRET,
});


 export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(file.path, {
    folder: "uploads",
    resource_type: "auto"
  });
     
    if(result){
   console.log("response of cloudinary:",result)
   fs.unlinkSync(file.path);
    return result
    }
    else{
      console.log("error to upload image to cloudinary",)
      throw new Error("error to upload image to cloudinary")
    }
}
   
   





export const deleteFromCloudinary=async(publicIds)=>{
  if(!publicIds) return null
   for(const id of publicIds){
   await cloudinary.uploader.destroy(id,(err,result)=>{
    if(err) {
      console.log("error to delete image from cloudinary",err)
      throw new Error("error to delete image from cloudinary")
    }
    if(result) console.log("delete image from cloudinary") 
   })
   }
}


