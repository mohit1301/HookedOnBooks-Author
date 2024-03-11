require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_AUTHOR_URL)
.then(()=>{
    console.log("connected to authors database")
})
.catch((err)=>{
    console.log(err)
})

// dbConfig/authorsDB.js
// const mongoose = require('mongoose');
// require('dotenv').config({ path: './authors-service/.env' });

// const authorsDB = mongoose.createConnection(process.env.MONGODB_AUTHOR_URL);

// authorsDB.on('error', err => {
//     console.error('Authors DB Connection Error:', err);
// });

// authorsDB.once('open', () => {
//     console.log('Connected to Authors DB');
// });

// module.exports = authorsDB;
