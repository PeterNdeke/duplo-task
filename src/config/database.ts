import mongoose from "mongoose";

export function dbConnect() {
  mongoose.set("debug", true);
  const mongodbUrl = `${process.env.MONGO_DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
  console.log("MONGO_DB_FULL_URL", mongodbUrl);
  mongoose.connect(mongodbUrl).catch((err) => console.log(err));
  mongoose.Promise = global.Promise;
  let db = mongoose.connection;

  db.on("connected", () => {
    console.log("mongodb conntected");
  });

  db.on("error", (error) => {
    console.error("An error ocured", JSON.stringify(error));
    process.exit(0);
  });
  global.db = db;
}
