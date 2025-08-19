import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "admin@example.com";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }
    const admin = new User({
        name:"Admin",
        email:"admin@123",
        password: "admin123",
        role:"admin",
    });

    await admin.save();
    console.log("Admin user created:", admin.email);
    process.exit(0);
    }catch(err){
        console.error("Error seeding admin",err);
        process.exit(1);
    }
}

seedAdmin();