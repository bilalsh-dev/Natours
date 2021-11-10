//const fs = require('fs');
const morgan = require('morgan');
const express = require('express');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

const app = express();

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

/*
app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server side', app: 'Natours' });
});
app.post('/', (req, res) => {
  res.send('You can post to this endpoint..');
});
*/

////    route handlersssss
///// tours

/// users

/*

app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);

app.post('/api/v1/tours', createTour);

app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);

*/

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
