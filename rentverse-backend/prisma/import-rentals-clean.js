
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, '../../rentverse-datasets/rentals.csv');

async function importRentals() {
    console.log('Starting robust CSV import...');

    // 1. Ensure System Admin User exists
    let adminUser = await prisma.user.findFirst({ where: { email: 'admin@rentverse.com' } });
    if (!adminUser) {
        console.log('Creating system admin user...');
        adminUser = await prisma.user.create({
            data: {
                email: 'admin@rentverse.com',
                name: 'System Admin',
                password: 'hashed_placeholder',
                role: 'ADMIN'
            }
        });
    }
    console.log(`Assigning properties to Admin User ID: ${adminUser.id}`);

    const results = [];

    fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`Parsed ${results.length} rows from CSV.`);

            let successCount = 0;
            let errorCount = 0;

            for (const row of results) {
                try {
                    // --- DATA SANITIZATION & MAPPING ---

                    // 1. Price: "RM 500" -> 500.0
                    let price = 0;
                    if (row.price) {
                        const cleanPrice = row.price.replace(/[^\d.]/g, ''); // Remove non-digits
                        price = parseFloat(cleanPrice) || 0;
                    }

                    // 2. Area: "500 Sqft" -> 500.0 (Assuming sqft for now, backend might expect sqm or just number)
                    let area = 0;
                    if (row.area) {
                        const cleanArea = row.area.replace(/[^\d.]/g, '');
                        area = parseFloat(cleanArea) || 0;
                    }

                    // 3. Images: Split by comma (confirmed by inspection)
                    let images = [];
                    if (row.images) {
                        // Split by comma
                        // Also trim separate http links just in case
                        images = row.images.split(',')
                            .map(url => url.trim())
                            .filter(url => url.startsWith('http'));
                    }

                    // 4. Property Type
                    let propTypeStr = row.property_type ? row.property_type.trim() : 'Apartment';
                    // Upsert PropertyType
                    // We need the ID for the connection
                    // To optimize, maybe fetch all types first, but upsert per row is safer for consistency
                    let typeRecord = await prisma.propertyType.upsert({
                        where: { code: propTypeStr.toUpperCase().replace(/\s+/g, '_') },
                        update: {},
                        create: {
                            name: propTypeStr,
                            code: propTypeStr.toUpperCase().replace(/\s+/g, '_'),
                            description: `Type ${propTypeStr}`
                        }
                    });

                    // 5. Code (Listing ID)
                    const code = row.listing_id || `GEN-${Date.now()}-${Math.random()}`;

                    // --- DB INSERTION ---
                    await prisma.property.upsert({
                        where: { code: code },
                        update: {
                            title: row.title || 'Untitled Property',
                            description: row.description || '',
                            price: price,
                            areaSqm: area, // Mapping 'area' from CSV to 'areaSqm' in DB
                            bedrooms: parseInt(row.bedrooms) || 0,
                            bathrooms: parseInt(row.bathrooms) || 0,
                            furnished: row.furnished === 'Fully Furnished', // Simple boolean mapping
                            images: images,
                            address: row.location || '', // Using location as address
                            city: (row.location || '').split(',')[0] || 'Johor Bahru', // Naive parse
                            state: 'Johor', // Dataset seems to be Johor based
                            country: 'Malaysia',
                            zipCode: '80000', // Placeholder
                            status: 'APPROVED', // FIXED: Use valid ListingStatus enum
                            propertyTypeId: typeRecord.id,
                            ownerId: adminUser.id
                        },
                        create: {
                            code: code,
                            title: row.title || 'Untitled Property',
                            description: row.description || '',
                            price: price,
                            currencyCode: 'MYR',
                            areaSqm: area,
                            bedrooms: parseInt(row.bedrooms) || 0,
                            bathrooms: parseInt(row.bathrooms) || 0,
                            furnished: row.furnished === 'Fully Furnished',
                            images: images,
                            address: row.location || '',
                            city: (row.location || '').split(',')[0] || 'Johor Bahru',
                            state: 'Johor',
                            country: 'Malaysia',
                            zipCode: '80000',
                            status: 'APPROVED', // FIXED: Use valid ListingStatus enum
                            propertyTypeId: typeRecord.id,
                            ownerId: adminUser.id
                        }
                    });

                    successCount++;
                    if (successCount % 100 === 0) process.stdout.write('.');

                } catch (err) {
                    errorCount++;
                    console.error(`\nSkipping row ${row.listing_id || 'unknown'}:`);
                    console.error(err); // Log full error object
                }
            }

            console.log(`\nImport completed.`);
            console.log(`Success: ${successCount}`);
            console.log(`Errors: ${errorCount}`);
            await prisma.$disconnect();
        });
}

importRentals();
