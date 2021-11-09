const express = require('express');
const tourController = require('./../controllers/tourController');
const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .patch(tourController.updateTour)
  .get(tourController.getTour)
  .delete(tourController.deleteTour);

module.exports = router;
