
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JSON_PATH = path.join(__dirname, '../../rentverse-datasets/cleaned_dataset.json');

async function importCleanedJson() {
    console.log('Starting Cleaned JSON Import...');

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

    try {
        const rawData = fs.readFileSync(JSON_PATH, 'utf8');
        const properties = JSON.parse(rawData);
        console.log(`Loaded ${properties.length} properties from JSON.`);

        let successCount = 0;
        let errorCount = 0;

        for (const prop of properties) {
            try {
                // 1. Property Type Handling
                let typeStr = prop.property_type ? prop.property_type.trim() : 'Apartment';
                const typeCode = typeStr.toUpperCase().replace(/\s+/g, '_');

                let typeRecord = await prisma.propertyType.upsert({
                    where: { code: typeCode },
                    update: {},
                    create: {
                        name: typeStr,
                        code: typeCode,
                        description: `Type ${typeStr}`
                    }
                });

                // 2. Data Preparation
                const code = prop.listing_id || `GEN-${Date.now()}-${Math.random()}`;
                const images = prop.images || [];

                // Safe boolean conversion
                let isFurnished = false;
                if (prop.furnished && typeof prop.furnished === 'string') {
                    isFurnished = prop.furnished.toLowerCase().includes('fully');
                }

                // 3. Upsert Property
                await prisma.property.upsert({
                    where: { code: code },
                    update: {
                        title: prop.title || 'Untitled Property',
                        description: prop.description || '',
                        price: prop.price || 0,
                        areaSqm: prop.area || 0,
                        bedrooms: prop.bedrooms || 0,
                        bathrooms: prop.bathrooms || 0,
                        furnished: isFurnished,
                        images: images,
                        address: prop.location || '',
                        city: (prop.location || '').split(',')[0] || 'Johor Bahru',
                        state: prop.source_state || 'Johor',
                        country: 'Malaysia',
                        zipCode: '80000',
                        status: 'APPROVED',
                        propertyTypeId: typeRecord.id,
                        ownerId: adminUser.id
                    },
                    create: {
                        code: code,
                        title: prop.title || 'Untitled Property',
                        description: prop.description || '',
                        price: prop.price || 0,
                        currencyCode: 'MYR',
                        areaSqm: prop.area || 0,
                        bedrooms: prop.bedrooms || 0,
                        bathrooms: prop.bathrooms || 0,
                        furnished: isFurnished,
                        images: images,
                        address: prop.location || '',
                        city: (prop.location || '').split(',')[0] || 'Johor Bahru',
                        state: prop.source_state || 'Johor',
                        country: 'Malaysia',
                        zipCode: '80000',
                        status: 'APPROVED',
                        propertyTypeId: typeRecord.id,
                        ownerId: adminUser.id
                    }
                });

                successCount++;
                if (successCount % 100 === 0) process.stdout.write('.');

            } catch (err) {
                errorCount++;
                console.error(`\nSkipping ${prop.listing_id}:`);
                console.error(err.message);
            }
        }

        console.log(`\nImport Process Finished.`);
        console.log(`Successfully Imported: ${successCount}`);
        console.log(`Failed: ${errorCount}`);

    } catch (e) {
        console.error('Fatal Error reading/parsing JSON:', e);
    } finally {
        await prisma.$disconnect();
    }
}

importCleanedJson();
