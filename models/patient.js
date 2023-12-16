let mongoose = require("mongoose")

let patientSchema = mongoose.Schema({

    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],      //it should be one of the option else it will give an error
        required: true
    },
    date_of_birth: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact_number: {  
        type: Number,
        required: true
    },

    reason_of_visit: {
        type: String,
        required: true
    },
    posted_by_id: {          //posted by is the user who logged in and added the patient
        type: String,
        required: true
    },
    posted_by_name: {          //posted by is the user who logged in and added the patient
        type: String,
        required: true
    }


});

module.exports = mongoose.model("Patient", patientSchema, "patients");