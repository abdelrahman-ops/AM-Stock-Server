import app from './app';
import express, { Request, Response } from 'express';
import connectDB from './config/mongo';

const PORT = process.env.PORT || 8000;


connectDB().catch(console.error);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});