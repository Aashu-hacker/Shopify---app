import mongoose from "mongoose";
const Schema = new mongoose.Schema({
    url: String,
});
const SaveURL = mongoose.model('URL', Schema);
export default SaveURL;