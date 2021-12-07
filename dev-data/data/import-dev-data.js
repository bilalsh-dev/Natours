const fs = require('fs');

const mongoose = require('mongoose');

const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });
/*
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
*/
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(con => {
    console.log(con.connections);

    console.log('DB connection success');
  });

// read json file

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// import data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data is succesfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete All Data From Collection

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data seccessfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
