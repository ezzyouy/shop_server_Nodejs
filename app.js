const express = require("express");
const  mongoose  = require("mongoose");
const morgan = require("morgan");
const productRouter=require("./routers/products")
const categoryRouter=require("./routers/categories")
const orderRouter=require("./routers/orders")
const userRouter=require("./routers/users")
const cors=require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

const app=express();

app.use(cors());
app.options('*',cors());

 require("dotenv/config");

 const api=process.env.API_URL

 //Middleware
 app.use(express.json());
 app.use(morgan('tiny'));
 app.use(authJwt());
 app.use(errorHandler)
 app.use('/public/uploads', express.static(__dirname+'/public/uploads'))

 app.use(`${api}/products`,productRouter);
 app.use(`${api}/categories`,categoryRouter);
 app.use(`${api}/orders`,orderRouter);
 app.use(`${api}/users`,userRouter);
 
mongoose.connect(process.env.CONNEXION_STRING)
.then(()=>{
    console.log("BD ready");
}).catch((err)=>{
    console.log(err);
});
//  app.listen(3000, ()=>{
//      console.log("server runing in the port http://localhost:3000");
//  })

 var server= app.listen(process.env.PORT || 3000, function(){
     var port = server.address().port;
     console.log("Express is workimg on port "+ port);
 })