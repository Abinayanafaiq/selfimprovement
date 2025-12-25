const mongoose = require('mongoose');

const uri = "mongodb+srv://abinayanafaiq550:GRu3y5kH8XDTYDGD@selfimprovement.d8oboxb.mongodb.net/?appName=selfimprovement";

async function run() {
  try {
    console.log("Attempting to connect...");
    await mongoose.connect(uri);
    console.log("Reference: Connection SUCCESSFUL!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Reference: Connection FAILED!");
    console.error(err);
  }
}

run();
