
const fs = require('fs');

try {
    const rawData = fs.readFileSync('rentverse-datasets/cleaned_dataset.json', 'utf8');
    const data = JSON.parse(rawData);

    console.log(`Total records: ${data.length}`);

    let withImages = 0;
    let withoutImages = 0;

    for (const item of data) {
        if (item.images && Array.isArray(item.images) && item.images.length > 0) {
            withImages++;
        } else {
            withoutImages++;
        }
    }

    console.log(`Records with images: ${withImages}`);
    console.log(`Records without images: ${withoutImages}`);

} catch (error) {
    console.error('Error reading JSON:', error);
}
