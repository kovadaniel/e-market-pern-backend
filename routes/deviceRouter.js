const Router = require('express');
const router = new Router();

const DeviceController = require("../controllers/deviceController")
const checkRole = require('../middleware/authMiddleware');

// with middleware that checkRole('ADMIN') returns we state that only
// a user with a role 'ADMIN' can create new devices
router.post('/', checkRole('ADMIN'), DeviceController.create)
router.get('/', DeviceController.getAll)
router.get('/:id', DeviceController.getOne)
router.delete('/:id', checkRole('ADMIN'), DeviceController.delete)


module.exports = router;