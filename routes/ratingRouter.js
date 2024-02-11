const Router = require('express');
const router = new Router();

const RatingController = require("../controllers/ratingController")
const authMiddleware = require('../middleware/authMiddleware');

// with middleware that checkRole('ADMIN') returns we state that only
// a user with a role 'ADMIN' can create new brands
router.post('/', authMiddleware(), RatingController.create);
router.patch('/', authMiddleware(), RatingController.change);
router.delete('/', authMiddleware('ADMIN'), RatingController.delete);

router.get('/check', authMiddleware(), RatingController.check);
router.get('/', RatingController.get);

module.exports = router;