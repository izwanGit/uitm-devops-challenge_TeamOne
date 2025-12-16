const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DATA_FILE = '/Users/izwan/UiTM-SecOps-Challenge/rentverse-datasets/rentals.csv';

// Helper to clean price "RM508" -> 508.00
const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
};

// Helper to clean area "555 Sqft" -> 51.56
const parseArea = (areaStr) => {
    if (!areaStr) return 0;
    // If it contains "Sqft", "sqft", etc.
    const clean = areaStr.replace(/[^0-9.]/g, '');
    const val = parseFloat(clean) || 0;
    // Convert sqft to sqm
    return val * 0.092903;
};

// Helper to parse Python list string "['url1', 'url2']" -> JSON array
const parseImages = (imgStr) => {
    if (!imgStr) return [];
    try {
        // Replace python single quotes with double quotes for valid JSON
        const jsonStr = imgStr.replace(/'/g, '"');
        return JSON.parse(jsonStr);
    } catch (e) {
        // Fallback: simple split if simple string
        if (imgStr.startsWith('[')) return []; // Failed parse
        return [imgStr];
    }
};

// Helper to slugify property type
const slugify = (text) => {
    return text
        .toString()
        .toUpperCase()
        .replace(/\s+/g, '_')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\_\_+/g, '_')   // Replace multiple - with single -
        .trim();
};

async function main() {
    console.log('🚀 Starting import...');

    // 1. Get or Create Admin User
    let admin = await prisma.user.findFirst({
        where: { email: 'admin@rentverse.com' }
    });

    if (!admin) {
        console.log('Creating admin user...');
        admin = await prisma.user.create({
            data: {
                email: 'admin@rentverse.com',
                firstName: 'System',
                lastName: 'Admin',
                password: 'hashed_password_placeholder', // Should be hashed in real app
                role: 'ADMIN',
                isActive: true,
                verifiedAt: new Date()
            }
        });
    }

    console.log(`Using Admin ID: ${admin.id}`);

    const results = [];

    // 2. Read CSV
    fs.createReadStream(DATA_FILE)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`Parsed ${results.length} rows. Processing...`);

            let successCount = 0;
            let errorCount = 0;

            for (const row of results) {
                try {
                    // Skip if no code
                    if (!row.listing_id) continue;

                    // 3. Handle Property Type
                    const typeName = row.property_type || 'Other';
                    const typeCode = slugify(typeName);

                    const propertyType = await prisma.propertyType.upsert({
                        where: { code: typeCode },
                        update: {},
                        create: {
                            code: typeCode,
                            name: typeName,
                            isActive: true
                        }
                    });

                    // 4. Parse Location
                    // "Bandar Johor Bahru, Johor Bahru, Johor"
                    const locParts = (row.location || '').split(',').map(s => s.trim());
                    const state = locParts.length > 0 ? locParts[locParts.length - 1] : 'Unknown';
                    const city = locParts.length > 1 ? locParts[locParts.length - 2] : (locParts[0] || 'Unknown');

                    // 5. Parse Images
                    const images = parseImages(row.images);

                    // 6. Upsert Property
                    await prisma.property.upsert({
                        where: { code: row.listing_id },
                        update: {
                            // Update basic fields if it exists to keep data fresh
                            title: row.title || 'Untitled Property',
                            description: row.description || '',
                            price: parsePrice(row.price),
                            isAvailable: true // Assume available if in feed
                        },
                        create: {
                            code: row.listing_id,
                            title: row.title || 'Untitled Property',
                            description: row.description || '',
                            // Clean price
                            price: parsePrice(row.price),
                            currencyCode: 'MYR',
                            // Clean area
                            areaSqm: parseArea(row.area),
                            // Rooms
                            bedrooms: parseInt(row.bedrooms) || 0,
                            bathrooms: parseInt(row.bathrooms) || 0,
                            furnished: (row.furnished || '').toLowerCase().includes('fully'),
                            // Location
                            address: row.location || '',
                            city: city,
                            state: state,
                            zipCode: '00000', // Default
                            country: 'MY',
                            // Relations
                            ownerId: admin.id,
                            propertyTypeId: propertyType.id,
                            status: 'APPROVED', // Auto-approve imported listings
                            images: images
                        }
                    });

                    successCount++;
                    if (successCount % 50 === 0) {
                        process.stdout.write(`Processed ${successCount} records...\r`);
                    }

                } catch (err) {
                    console.error(`Error processing ${row.listing_id}:`, err.message);
                    errorCount++;
                }
            }

            console.log(`\nImport completed!`);
            console.log(`✅ Success: ${successCount}`);
            console.log(`❌ Errors: ${errorCount}`);

            await prisma.$disconnect();
        });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
