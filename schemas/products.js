let mongoose = require('mongoose');
let productSchema = new mongoose.Schema({
    title:{
        type:String,
        unique:[true,"title khong duoc trung"],
        required:[true,"title khong duoc rong"]
    },
    slug:{
        type:String,
        unique:[true,"slug khong duoc trung"],
        required:[true,"slug khong duoc rong"]
    },
    price:{
        type:Number,
        default:0,
        min:[0,"gia khong duoc nho hon 0"],
    },
    description:{
        type:String,
        default:""
    },
    images:{
        type:[String],
        default:["https://i.imgur.com/ZANVnHE.jpeg"]
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    }
    ,
    isDeleted:{
        type:Boolean,
        default:false
    }
})
module.exports = new mongoose.model(
    'product',productSchema
)