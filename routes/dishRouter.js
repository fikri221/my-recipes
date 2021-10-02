const express = require("express");
const bodyParser = require('body-parser');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .get((req, res, next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish Created ', dish);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            });
    })

    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.send('PUT operation not supported on /dishes');
    })

    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            });
    })

dishRouter.route('/:dishId')
    // /dishes/:dishId
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.send('POST operation not supported on /dishes/' + req.params.dishId);
    })

    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findOneAndRemove(req.params.dishId)
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

// Route for Comment
dishRouter.route('/:dishId/comments')
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .post(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish) {
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish.comments);
                                })
                        }, (err) => {
                            next(err);
                        })
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            });
    })

    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.send('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
    })

    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish) {
                    for (let i = (dish.comments.length - 1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => {
                            next(err);
                        })
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

dishRouter.route('/:dishId/comments/:commentId')
    // /dishes/:dishId/comments/:commentId
    .get((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish && dish.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments.id(req.params.commentId));
                } else if (!dish) {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.send('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
    })

    .put(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish && dish.comments.id(req.params.commentId)) {
                    let authorId = dish.comments.id(req.params.commentId).author;
                    if (authorId == req.user._id) {
                        // check if rating exist
                        if (req.body.rating) {
                            dish.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        // check if comment exist
                        if (req.body.comment) {
                            dish.comments.id(req.params.commentId).comment = req.body.comment;
                        }
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish.comments);
                                    })
                            }, (err) => next(err));
                    } else {
                        let err = new Error('You are not allowed to perform this operation!');
                        err.status = 403;
                        return next(err);
                    }
                } else if (!dish) {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

    .delete(authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => {
                if (dish && dish.comments.id(req.params.commentId)) {
                    let authorId = dish.comments.id(req.params.commentId).author;
                    if (authorId == req.user._id) {
                        dish.comments.id(req.params.commentId).remove();
                        dish.save()
                            .then((dish) => {
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(dish.comments);
                                    })
                            }, (err) => {
                                next(err);
                            })
                    } else {
                        let err = new Error('You are not allowed to perform this operation!');
                        err.status = 403;
                        return next(err);
                    }
                } else if (!dish) {
                    err = new Error('Dish ' + req.params.dishId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                } else {
                    err = new Error('Comment ' + req.params.commentId + ' Not Found');
                    err.statusCode = 404;
                    return next(err);
                }
            }, (err) => {
                next(err);
            })
            .catch((err) => {
                next(err);
            })
    })

module.exports = dishRouter;