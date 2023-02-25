import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    products: Array,
});

const SaveProduct = mongoose.model('Dummy-Products', ProductSchema);

export default SaveProduct;