import mongoose from "mongoose";
import { inspect } from "util";
import config from "../config";

const connection = mongoose.connect(config.databaseUri);

connection
  .then(() => console.log("Connected to database"))
  .catch((err: unknown) => console.error(`Error when connecting to database: ${inspect(err)}`));

export default connection;
