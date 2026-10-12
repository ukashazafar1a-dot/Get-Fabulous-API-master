const express = require('express')
const router = express.Router()

const {getVariantID} = require('../controllers/variantController')

router.post('/',getVariantID)

module.exports = router;