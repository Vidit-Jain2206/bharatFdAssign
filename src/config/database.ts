import mongoose from "mongoose";

export const connection = async () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGODB_URI!)
      .then(() => {
        resolve(true);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};
