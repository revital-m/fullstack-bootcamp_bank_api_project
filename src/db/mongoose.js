require('dotenv').config({ path: 'ENV_FILENAME' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {}, (error, client) => {
    if (error) {
        console.log(error.message);
    }
});