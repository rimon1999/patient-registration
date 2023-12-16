const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Patient = require('../models/patient');
const passport = require('passport');
const ensureAuthenticated = require('./authMiddleware');


router.post('/login', passport.authenticate('local', {
    successRedirect: '/patients',  // Redirect to a page that requires authentication
    failureRedirect: '/users/login',
    failureFlash: true
}));

router.get('/profile', ensureAuthenticated, function(req, res) {
    console.log('Profile route - User:', req.user);
    res.render('profile', { user: req.user });
  });

// Route to view a single patient
router.get('/:id', ensureAuthenticated, async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.render('error', { error: 'Patient not found' });
        }
        return res.render('patient', { patient, user: req.user }); // Pass the user to the template
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});


// Route to edit patient information
router.get('/edit/:id', ensureAuthenticated, async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.render('error', { error: 'Patient not found' });
        }
        return res.render('edit_patient', { patient });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.post('/edit/:id', ensureAuthenticated, async (req, res) => {
    const patientId = req.params.id;

    try {
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.render('error', { error: 'Patient not found' });
        }

        // Update patient details
        patient.first_name = req.body.first_name;
        patient.last_name = req.body.last_name;
        patient.gender = req.body.gender;
        patient.date_of_birth = req.body.date_of_birth;
        patient.address = req.body.address;
        patient.contact_number = req.body.contact_number;
        patient.reason_of_visit = req.body.reason_of_visit;

        // Save the updated patient
        await patient.save();

        // Redirect to the patient details page or another route
        return res.redirect(`/patients/${patientId}`);
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.get('/', ensureAuthenticated, async (req, res, next) => {
    try {
        const patients = await Patient.find();
        const specificPatient = patients.length > 0 ? patients[0] : null;
        return res.render('add_patient', { patients, patient: specificPatient });
    } catch (error) {
        console.error(error);
        return res.render('error', { error });
    }
});

router.route('/add')
    .get(ensureAuthenticated, (req, res) => {
        res.render('add_patient');
    })
    .post(
        ensureAuthenticated,
        body("first_name", "First name is required").notEmpty(),
        body("last_name", "Last name is required").notEmpty(),
        body("gender", "Gender is required").notEmpty(),
        body("date_of_birth", "Date of birth is required").notEmpty(),
        body("address", "Address is required").notEmpty(),
        body("contact_number", "Contact number is required").notEmpty(),
        body("reason_of_visit", "Reason of visit is required").notEmpty(),
        async (req, res) => {
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                console.log(req.user)
                const newPatient = new Patient({
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    gender: req.body.gender,
                    date_of_birth: req.body.date_of_birth,
                    address: req.body.address,
                    contact_number: req.body.contact_number,
                    reason_of_visit: req.body.reason_of_visit,
                    posted_by_id: req.user._id, // Use req.user.id to store the user ID
                    posted_by_name: req.user.name,
                });

                try {
                    await newPatient.save();
                    console.log(newPatient);
                    return res.redirect("/patients"); // Redirect to a success page or another route
                } catch (error) {
                    console.error(error);
                    return res.render('add_patient', { errors: [{ msg: 'Failed to save patient.' }]});
                }
            } else {
                const patients = await Patient.find();
                const specificPatient = patients.length > 0 ? patients[0] : null;
                return res.render('add_patient', { errors: errors.array(), patients, patient: specificPatient  });
            }
        }
    );


router.delete('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (deletedPatient) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'Patient not found' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Error deleting patient' });
    }
});


module.exports = router;