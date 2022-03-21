
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const User=require("../models/user")
const router = express.Router();


router.get('/', async(req,res)=>{
    const userList=await User.find();
    if(!userList){
        res.status(500).json({success:false})
    }
    res.json(userList);
})

router.get('/:id', async(req,res)=>{
    const id=req.params.id;
    const user=await User.findById(id).select('-passwordHash');
    if(!user){
        res.status(500).json({success:false,message:`the user with the ID ${id} was not found`})
    }
    res.status(200).json(user);
})

router.post('/', (req,res)=>{
   const user=new User({
       name:req.body.name,
       email:req.body.email,
       passwordHash:bcrypt.hashSync(req.body.passwordHash,10),
       phone:req.body.phone,
       street:req.body.street,
       city:req.body.city,
       country:req.body.country,
       zip:req.body.zip,
       apartment:req.body.apartment,
       isAdmin:req.body.isAdmin
   })
   user.save().then((user)=>{
       res.status(201).json(user)
   }).catch((err)=>{
       res.status(500).json({
           error:err,
           success:false
       })
   })
   
})
router.post('/login', async(req,res)=>{
    const user=await User.findOne({email:req.body.email});
    const secret=process.env.secret;
    if(!user){
        return res.status(400).send("the user not found");
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token =jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin
            },
            secret,
            {
                expiresIn:'1d'
            }
        )
         res.status(200).send({user:user.email, token:token})
    }else{
         res.status(400).send("password is wrong ");
    }
})
router.post('/', (req,res)=>{
    const user=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.passwordHash,10),
        phone:req.body.phone,
        street:req.body.street,
        city:req.body.city,
        country:req.body.country,
        zip:req.body.zip,
        apartment:req.body.apartment,
        isAdmin:req.body.isAdmin
    })
    user.save().then((user)=>{
        res.status(201).json(user)
    }).catch((err)=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
    
 })
 router.get(`/get/count`, async(req,res)=>{
    const countUser = await User.countDocuments();
    if(!countUser){
         res.status(500).json({success:false})
    }
    res.send({
        countUser:countUser
    })
})
router.delete("/:id", async(req,res)=>{
    const id= req.params.id;
    
    User.findByIdAndRemove(id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:"the user is deleted"});
        }else{
            return res.status(404).json({success:false, message:"the user not found"});
        }
    }).catch((err)=>{
       return res.status(500).json({success:false, error:err})
    })
})
module.exports=router