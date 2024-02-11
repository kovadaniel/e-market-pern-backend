const Router = require('express');
const router = new Router();
const userRouter = require('./userRouter');
const typeRouter = require('./typeRouter');
const brandRouter = require('./brandRouter');
const deviceRouter = require('./deviceRouter');
const ratingRouter = require('./ratingRouter');
const basketRouter = require('./basketRouter');
const basketDeviceRouter = require('./basketDeviceRouter');

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/brand', brandRouter)
router.use('/device', deviceRouter)
router.use('/basket', basketRouter)
router.use('/basket_device', basketDeviceRouter)
router.use('/rating', ratingRouter)

module.exports = router;