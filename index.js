/**
 * Google Cloud Function to convert XLSX to CSV
 * 
 * This function is designed to be triggered by Cloud Storage events
 * and read from one bucket and write to another
 * 
 * @author Ray Dollete <ray@raytalkstech.com>
 */

'use strict';

const fs = require('fs');
const {promisify} = require('util');
const path = require('path');

// instantiate Google Cloud Storage object
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

// get destination bucket from ENV
const {CSV_BUCKET_NAME} = process.env;

// main conversion function
exports.convertSheet = async (event) => {
    
    // the event represents the triggering Cloud Storage object
    const object = event;

    // get the file from the event object
    const file = storage.bucket(object.bucket).file(object.name);
    const filePath = `gs://${object.bucket}/${object.name}`;

    console.log(`Processing ${file.name}.`);

    try {
        // ensure file type based on extension
        const ext = path.extname(file.name);
        if (ext.toUpperCase() !== '.XLSX') {
            throw new Error(`Incorrect file type: ${ext}.`);
        }

        // download source file into local temp
        const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

        try {
            await file.download({destination: tempLocalPath});
            console.log(`Downloaded ${file.name} to ${tempLocalPath}.`);
        }
        catch (err) {
            throw new Error(`File download failed: ${err}`);
        }

        // process file (should just copy with nothing here)

        // create destination bucket object
        const csvBucket = storage.bucket(CSV_BUCKET_NAME);

        // upload new file into the bucket
        const gcsPath = `gs://${CSV_BUCKET_NAME}/${file.name}`;
        try {
            await csvBucket.upload(tempLocalPath, {destination: file.name});
            console.log(`Uploaded CSV to: ${gcsPath}`);
        }
        catch (err) {
            throw new Error(`Unable to upload CSV to ${gcsPath}: ${err}`);
        }

        // Delete temp file
        const unlink = promisify(fs.unlink);
        return unlink(tempLocalPath);
    } 
    catch (err) {
        console.error(`Failed to process ${file.name}.`, err);
        throw err;
    }

};
