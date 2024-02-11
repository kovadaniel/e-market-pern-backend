const Router = require("express");

const router = new Router();
const BasketDeviceController = require("../controllers/basketDeviceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware(), BasketDeviceController.add)
router.delete('/:deviceId', authMiddleware(), BasketDeviceController.remove)

router.get('/:deviceId', authMiddleware(), BasketDeviceController.getAll)


module.exports = router; 