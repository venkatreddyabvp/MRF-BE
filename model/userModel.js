import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
});
const User = model("User", userSchema);
export default User;
