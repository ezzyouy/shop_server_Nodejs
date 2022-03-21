
const express = require("express");
const Category=require("../models/category")
const router = express.Router();


router.get('/', async(req,res)=>{
    const categories=await Category.find();
    if(!categories){
        res.status(500).json({success:false})
    }
    res.status(200).json(categories);
})
router.get('/:id', async(req,res)=>{
    const id=req.params.id;
    const category=await Category.findById(id);
    if(!category){
        res.status(500).json({success:false,message:`the category with the ID ${id} was not found`})
    }
    res.status(200).json(category);
})

router.post('/', async (req,res)=>{
   let category=new Category({
       name:req.body.name,
       icon:req.body.icon,
       color:req.body.color
   })
    category = await category.save();
    if(!category){
       return res.status(404).json("the category cannot be created");
    }
    res.json(category)
   
})

router.delete("/:id", (req,res)=>{
     const id= req.params.id;
     Category.findByIdAndDelete(id).then(category=>{
         if(category){
             return res.status(200).json({success:true,message:'the category is deleted'});
         }else{
            return res.status(404).json({success:false,message:'category doesn\'t exist'});
         }
     }).catch((err)=>{
        res.status(400).json({success:false,message:err});
     })

})

router.put("/:id", async(req,res)=>{
    const id= req.params.id;
    const category = await Category.findByIdAndUpdate(
        id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {new:true}
    )

    if(!category){
        return res.status(400).json({success:false,message:'the category cannot be created'});
    }
    res.send(category)
})
module.exports=router