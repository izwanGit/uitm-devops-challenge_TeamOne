const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const amenitiesData = [
    // Comfort & Climate
    { name: 'Air Conditioning', category: 'Comfort' },
    { name: 'Central Air Conditioning', category: 'Comfort' },
    { name: 'Heating System', category: 'Comfort' },
    { name: 'Ceiling Fan', category: 'Comfort' },

    // Security & Safety
    { name: '24-Hour Security', category: 'Security' },
    { name: 'CCTV Surveillance', category: 'Security' },
    { name: 'Access Card System', category: 'Security' },
    { name: 'Security Guard', category: 'Security' },
    { name: 'Intercom System', category: 'Security' },
    { name: 'Fire Safety System', category: 'Security' },

    // Recreation & Fitness
    { name: 'Swimming Pool', category: 'Recreation' },
    { name: 'Infinity Pool', category: 'Recreation' },
    { name: "Children's Pool", category: 'Recreation' },
    { name: 'Gymnasium', category: 'Recreation' },
    { name: 'Fitness Center', category: 'Recreation' },
    { name: 'Yoga Studio', category: 'Recreation' },
    { name: 'Tennis Court', category: 'Recreation' },
    { name: 'Badminton Court', category: 'Recreation' },
    { name: 'Basketball Court', category: 'Recreation' },
    { name: 'Jogging Track', category: 'Recreation' },
    { name: "Children's Playground", category: 'Recreation' },
    { name: 'Game Room', category: 'Recreation' },
    { name: 'Pool Table', category: 'Recreation' },

    // Parking & Transportation
    { name: 'Covered Parking', category: 'Parking' },
    { name: 'Open Parking', category: 'Parking' },
    { name: 'Valet Parking', category: 'Parking' },
    { name: 'Electric Car Charging', category: 'Parking' },
    { name: 'Shuttle Service', category: 'Transportation' },
    { name: 'LRT Access', category: 'Transportation' },
    { name: 'MRT Access', category: 'Transportation' },
    { name: 'Bus Stop Nearby', category: 'Transportation' },

    // Amenities & Facilities
    { name: 'Elevator', category: 'Facilities' },
    { name: 'Private Lift Lobby', category: 'Facilities' },
    { name: 'Concierge Service', category: 'Facilities' },
    { name: 'Reception Desk', category: 'Facilities' },
    { name: 'Mail Room', category: 'Facilities' },
    { name: 'Package Receiving', category: 'Facilities' },
    { name: 'Laundry Room', category: 'Facilities' },
    { name: 'Dry Cleaning Service', category: 'Facilities' },

    // Social & Entertainment
    { name: 'BBQ Area', category: 'Social' },
    { name: 'Function Hall', category: 'Social' },
    { name: 'Meeting Room', category: 'Social' },
    { name: 'Business Center', category: 'Social' },
    { name: 'Co-working Space', category: 'Social' },
    { name: 'Library', category: 'Social' },
    { name: 'Sky Lounge', category: 'Social' },
    { name: 'Rooftop Garden', category: 'Social' },
    { name: 'Landscape Garden', category: 'Social' },

    // Connectivity & Technology
    { name: 'High-Speed Internet', category: 'Technology' },
    { name: 'Fiber Internet', category: 'Technology' },
    { name: 'WiFi Coverage', category: 'Technology' },
    { name: 'Smart Home Technology', category: 'Technology' },
    { name: 'Cable TV Ready', category: 'Technology' },

    // Commercial & Retail
    { name: 'Shopping Mall', category: 'Commercial' },
    { name: 'Retail Shops', category: 'Commercial' },
    { name: 'Convenience Store', category: 'Commercial' },
    { name: 'Food Court', category: 'Commercial' },
    { name: 'Restaurant', category: 'Commercial' },
    { name: 'Cafe', category: 'Commercial' },
    { name: 'Bank', category: 'Commercial' },
    { name: 'ATM', category: 'Commercial' },

    // Health & Wellness
    { name: 'Medical Center', category: 'Health' },
    { name: 'Clinic', category: 'Health' },
    { name: 'Pharmacy', category: 'Health' },
    { name: 'Spa & Wellness', category: 'Health' },
    { name: 'Sauna', category: 'Health' },
    { name: 'Steam Room', category: 'Health' },

    // Education & Learning
    { name: 'International School', category: 'Education' },
    { name: 'Kindergarten', category: 'Education' },
    { name: 'Tuition Center', category: 'Education' },
    { name: 'Study Room', category: 'Education' },

    // Environment & Sustainability
    { name: 'Green Building', category: 'Environment' },
    { name: 'Solar Panels', category: 'Environment' },
    { name: 'Rainwater Harvesting', category: 'Environment' },
    { name: 'Waste Management', category: 'Environment' },
    { name: 'Recycling Center', category: 'Environment' },

    // Special Features
    { name: 'Marina Access', category: 'Special' },
    { name: 'Beach Access', category: 'Special' },
    { name: 'Golf Course', category: 'Special' },
    { name: 'Theme Park Access', category: 'Special' },
    { name: 'Convention Center', category: 'Special' },
    { name: 'Hotel Services', category: 'Special' },
];

async function main() {
    console.log('🚀 Starting amenities population...');

    // 1. Ensure all amenities exist
    console.log('1️⃣ Syncing amenities definitions...');
    for (const a of amenitiesData) {
        await prisma.amenity.upsert({
            where: { name: a.name },
            update: { category: a.category },
            create: a,
        });
    }
    const allAmenities = await prisma.amenity.findMany();
    console.log(`✅ Synced ${allAmenities.length} total amenities.`);

    // 2. Fetch all properties
    console.log('2️⃣ Fetching properties...');
    const properties = await prisma.property.findMany({
        include: { amenities: true },
    });
    console.log(`Found ${properties.length} properties.`);

    // 3. Assign random amenities to properties that have none (or few)
    console.log('3️⃣ Assigning random amenities...');
    let updatedCount = 0;

    for (const property of properties) {
        // If property has less than 3 amenities, assume it needs population
        if (property.amenities.length < 3) {

            // Determine random number of amenities (e.g., 5 to 12)
            const count = Math.floor(Math.random() * 8) + 5;

            // Shuffle all amenities and take 'count'
            const shuffled = [...allAmenities].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);

            // Create PropertyAmenity records
            // First delete existing to avoid conflict if any partial data exists
            await prisma.propertyAmenity.deleteMany({
                where: { propertyId: property.id }
            });

            const data = selected.map(a => ({
                propertyId: property.id,
                amenityId: a.id,
            }));

            await prisma.propertyAmenity.createMany({
                data: data,
                skipDuplicates: true
            });

            updatedCount++;
            process.stdout.write('.');
        }
    }

    console.log(`\n✅ Finished! Updated ${updatedCount} properties with random amenities.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
