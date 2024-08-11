const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Working get request for users')
})

module.exports = router;