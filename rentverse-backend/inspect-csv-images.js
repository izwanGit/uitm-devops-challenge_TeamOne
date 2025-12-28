const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvPath = path.join(__dirname, '../rentverse-datasets/rentals.csv');

let count = 0;

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', data => {
    if (count < 5) {
      if (data.images) {
        console.log(
          `Row ${count + 1} images sample (first 100 chars): ${data.images.substring(0, 100)}`
        );
        if (data.images.includes('|')) console.log('  -> Contains PIPE');
        if (data.images.includes(',')) console.log('  -> Contains COMMA');
      }
      count++;
    }
  })
  .on('end', () => {
    console.log('Done inspecting.');
  });
