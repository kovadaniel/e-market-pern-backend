const Router = require('express');
const router = new Router();

const TypeController = require("../controllers/typeController");
const checkRole = require('../middleware/authMiddleware');

// with middleware that checkRole('ADMIN') returns we state that only
// a user with a role 'ADMIN' can create new types
router.post('/', checkRole('ADMIN'), TypeController.create);
router.delete('/:id', checkRole('ADMIN'), TypeController.delete)
router.get('/', TypeController.getAll);

module.exports = router;