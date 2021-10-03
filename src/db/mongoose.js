const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL).catch((e) => console.log(e));
