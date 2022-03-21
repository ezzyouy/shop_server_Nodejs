const { default: mongoose } = require("mongoose");

const cagegorySchema = mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    icon: {
        type:String
    },
    color: {
        type:String
    },
    
  });

  const Category = mongoose.model('Category',cagegorySchema);

  module.exports=Category;