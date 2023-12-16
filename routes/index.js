var express = require('express');
var router = express.Router();
const Patient = require("../models/patient");

/* GET add_patient page with patients list. */
router.get('/add_patient', async function(req, res, next) {
  try {
    const patients = await Patient.find();
    res.render('add_patient', { title: 'Add Patient', patients });
  } catch (error) {
    next(error);
  }
});

router.get('/', async function(req, res, next) {
  res.render('index');
})


module.exports = router;
