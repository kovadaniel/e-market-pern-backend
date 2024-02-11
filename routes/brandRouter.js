const Router = require('express');
const router = new Router();

const BrandController = require("../controllers/brandController")
const checkRole = require('../middleware/authMiddleware');

// with middleware that checkRole('ADMIN') returns we state that only
// a user with a role 'ADMIN' can create new brands
router.post('/', checkRole('ADMIN'), BrandController.create);
router.delete('/:id', checkRole('ADMIN'), BrandController.delete)
router.get('/', BrandController.getAll); 

module.exports = router;