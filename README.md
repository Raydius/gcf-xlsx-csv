# gcf-xlsx-csv
Google Cloud Function to convert XLSX to CSV within Google Cloud Storage

Sample Deploy from CLI:

gcloud functions deploy convertSheet --runtime=nodejs10 --trigger-bucket=[sourceBucket] --set-env-vars CSV_BUCKET_NAME=[destinationBucket]
