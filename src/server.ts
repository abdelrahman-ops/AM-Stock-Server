import app from './app';
// import pool from './config/db';
import connectDB from './config/mongo';

const PORT = process.env.PORT || 8000;

// Test database connection
// pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//         console.error('Error connecting to PostgreSQL:', err);
//     } else {
//         console.log('PostgreSQL connected:', res.rows[0].now);
//     }
// });

connectDB().catch(console.error);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});