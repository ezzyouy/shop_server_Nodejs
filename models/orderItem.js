const { default: mongoose } = require("mongoose");

const orderItemsSchema = mongoose.Schema({
    product: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity: {
        type:Number,
        required:true
    }
  });

  const OrderItem = mongoose.model('OrderItem',orderItemsSchema);

  module.exports=OrderItem;