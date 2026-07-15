const mongoose=require("mongoose");
const DB_URL = process.env.MONGO_URI || "mongodb://localhost:27017/DB-Ecommerce";

async function connectToDB(){
    try{
        await mongoose.connect(DB_URL);
        console.log("✔️  Connect to db successfully...");
    }
catch(err){
    console.log("✖️   Error Occued while Connecting to db...");
    console.log("error",err);
}
}
module.exports = connectToDB;