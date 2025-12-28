const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
  console.log('Starting image data repair...');

  try {
    // Fetch all properties - treating this as a batch job.
    // Ensure we handle pagination if the dataset is huge, but for 23k records it might fit in memory or we can use cursor.
    // Let's use a cursor-based approach for safety.

    let cursor = undefined;
    const batchSize = 1000;
    let totalProcessed = 0;
    let totalFixed = 0;

    while (true) {
      const properties = await prisma.property.findMany({
        take: batchSize,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: { id: true, images: true },
      });

      if (properties.length === 0) break;

      const updates = [];

      for (const p of properties) {
        let needsFix = false;
        let newImages = [];

        if (Array.isArray(p.images) && p.images.length === 1) {
          const firstImg = p.images[0];
          // Detection logic: contains comma and looks like it has multiple http/https
          if (
            typeof firstImg === 'string' &&
            firstImg.includes(',') &&
            (firstImg.match(/http/g) || []).length > 1
          ) {
            // It's a corrupted string!
            // Split by comma, but be careful if URLs technically could contain commas (unlikely for standard URLs but possible in query params)
            // For this dataset, simple split by ',' seems appropriate given the inspect output.
            // Trimming whitespace is important.
            newImages = firstImg
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            needsFix = true;
          }
        } else if (Array.isArray(p.images) && p.images.length > 1) {
          // Rare case: mixed bad data? probably fine, but let's check if ANY element is a comma-list
          const fixedArray = [];
          let arrayModified = false;
          for (const img of p.images) {
            if (
              typeof img === 'string' &&
              img.includes(',') &&
              (img.match(/http/g) || []).length > 1
            ) {
              const splitImgs = img
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);
              fixedArray.push(...splitImgs);
              arrayModified = true;
            } else {
              fixedArray.push(img);
            }
          }
          if (arrayModified) {
            newImages = fixedArray;
            needsFix = true;
          }
        }

        if (needsFix) {
          // Push update promise
          updates.push(
            prisma.property.update({
              where: { id: p.id },
              data: { images: newImages },
            })
          );
          totalFixed++;
        }
      }

      if (updates.length > 0) {
        await prisma.$transaction(updates);
        console.log(`Fixed ${updates.length} properties in this batch...`);
      }

      totalProcessed += properties.length;
      cursor = properties[properties.length - 1].id;

      if (totalProcessed % 5000 === 0) {
        console.log(`Processed ${totalProcessed} records...`);
      }
    }

    console.log(`\nJob Complete!`);
    console.log(`Total properties processed: ${totalProcessed}`);
    console.log(`Total properties fixed: ${totalFixed}`);
  } catch (error) {
    console.error('Error during repair:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();
