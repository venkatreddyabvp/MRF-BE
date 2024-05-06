import { Schema,model } from "mongoose";

const vehicleSchema=new Schema({
    date:{type:Date,required:true},
    comment:{type:String,required:true},
    vehicleName:{type:String,required:true},
    vehicleModel:{type:String,required:true},
    location:{type:String,required:true},
    amount:{type:Number,required:true},
})
const Vehicle=model("Vehicle",vehicleSchema)
export default Vehicle


