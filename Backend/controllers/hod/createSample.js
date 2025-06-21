import asyncHandler from "express-async-handler";
import event from "../../models/eventModel.js";
import user from "../../models/userModel.js";

export const createEvent = asyncHandler(async(req, res)=>{
  const config = req.body;
  try{

    const result = await event.create(config);
    res.status(200).send({msg: "created"});
      
  }catch(error){
    res.status(500);
    throw new Error(error.message);
  }
});

export const createUser = asyncHandler(async(req, res)=>{
  const config = req.body;
  try{

    const result = await user.create(config);
    res.status(200).send({msg: "created"});
      
  }catch(error){
    res.status(500);
    throw new Error(error.message);
  }
});