const { prisma } = require('../config/database');
const geocodingService = require('../utils/geocoding.service');

/**
 * Geocode all properties that don't have coordinates
 * Usage: node src/scripts/geocodeProperties.js
 */
async function geocodeProperties() {
  console.log('🗺️  Starting property geocoding...\n');

  try {
    // Find properties without coordinates
    const properties = await prisma.property.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
      },
      select: {
        id: true,
        code: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
      },
    });

    console.log(`Found ${properties.length} properties without coordinates\n`);

    if (properties.length === 0) {
      console.log('✅ All properties already have coordinates!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      console.log(
        `[${i + 1}/${properties.length}] Processing ${property.code}: ${property.title}`
      );

      const coordinates = await geocodingService.geocodeProperty(property);

      if (coordinates) {
        // Update property with coordinates
        await prisma.property.update({
          where: { id: property.id },
          data: {
            latitude: coordinates.lat,
            longitude: coordinates.lng,
          },
        });

        console.log(`   ✅ Geocoded: ${coordinates.lat}, ${coordinates.lng}\n`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to geocode\n`);
        failCount++;
      }
    }

    console.log('\n📊 Geocoding Summary:');
    console.log(`   Total properties: ${properties.length}`);
    console.log(`   Successfully geocoded: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log('\n✅ Geocoding complete!');
  } catch (error) {
    console.error('❌ Error during geocoding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  geocodeProperties()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = geocodeProperties;
