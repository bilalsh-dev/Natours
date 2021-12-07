const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeature');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // try {
  //Build Query
  // // 1A) Filtering
  // const queryObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach(el => delete queryObj[el]);

  // // 1A) Advanced filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // let query = Tour.find(JSON.parse(queryStr));

  // 2)

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');

  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // 3) Feild limiting

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query.select('-_v');
  // }

  // 4) Pagination

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) {
  //     throw new Error('This page does not exist');
  //   }
  // }

  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError(`No tour found with thst id`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour= new Tour({})
  //newTour.save()
  // console.log(req.body);

  const newTour = await Tour.create(req.body);
  //try {
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError(`No tour found with thst id`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`No tour found with thst id`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { avgPrice: 1 } }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: {
          $sum: 1
        }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStats: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: err
  //   });
  // }
});
