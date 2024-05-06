import { Schema,model } from "mongoose";
const tyreSchema=new Schema({
    date:{type:Date,required:true},
    tyreSize:{type:String,required:true},
    noOfTyres:{type:String,required:true},//..
    comment:{type:String,required:true},
    vehicle:{type:String,required:true},//
    location:{type:String,required:true},
    amount:{type:Number,required:true}
})
const Tyre=model("Tyre",tyreSchema)
export default Tyre
