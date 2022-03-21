const express = require("express");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const router = express.Router();

router.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.json(orderList);
});

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });
  if (!order) {
    res.status(500).json({ success: false });
  }
  res.json(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItems = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });

      newOrderItems = await newOrderItems.save();

      return newOrderItems._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;
  const totalPrices= await Promise.all(orderItemsIdsResolved.map(async (orderItemsId)=>{
      const orderItem= await OrderItem.findById(orderItemsId).populate('product','price');
      const totalPrice= orderItem.product.price * orderItem.quantity;
      return totalPrice;
  }))
  const totalPrice= totalPrices.reduce((a,b)=> a+b,0);
  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order
    .save()
    .then((createOrder) => {
      res.status(201).json(createOrder);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

router.put("/:id", async(req,res)=>{
    const id= req.params.id;
    const order = await Order.findByIdAndUpdate(
        id,
        {
            status:req.body.status
        },
        {new:true}
    )

    if(!order){
        return res.status(400).json({success:false,message:'the order cannot be created'});
    }
    res.send(order)
})
router.delete("/:id", (req,res)=>{
    const id= req.params.id;
    Order.findByIdAndDelete(id).then(async order=>{
        if(order){
            await order.orderItems.map(async orderItem=>{
                await OrderItem.findByIdAndRemove(orderItem)
        })
            return res.status(200).json({success:true,message:'the order is deleted'});
        }else{
           return res.status(404).json({success:false,message:'order doesn\'t exist'});
        }
    }).catch((err)=>{
       res.status(400).json({success:false,message:err});
    })

})

router.get('/get/totalSales', async (req, res)=>{
    const totalSales= await Order.aggregate([
        {$group:{ _id:null , totalsales:{$sum: '$totalPrice'}}}
    ])
    if(!totalSales){
        return res.status(400).send('The order sales cannot be generated');
    }
    res.send({totalSales:totalSales.pop().totalsales});
})

router.get(`/get/count`, async(req,res)=>{
    const orderCount = await Order.countDocuments();
    if(!orderCount){
         res.status(500).json({success:false})
    }
    res.send({
        orderCount:orderCount
    })
})
router.get("/get/userOrders/:userId", async (req, res) => {
    const userOrderList = await Order.find({user:req.params.userId})
    .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ dateOrdered: -1 });
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.json(userOrderList);
  });
module.exports = router;
