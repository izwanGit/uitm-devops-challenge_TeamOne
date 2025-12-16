
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkImages() {
    try {
        // Find a property that has 'fazwaz' in its images
        // We'll search for one where the images array might be "weird"
        // Since we can't easily search inside array elements for partial matches with standard prisma without raw query sometimes,
        // let's just get a few properties and inspect them via JS.

        const properties = await prisma.property.findMany({
            take: 20,
            where: {
                images: {
                    isEmpty: false
                }
            }
        })

        console.log('Checking first 20 properties for image data structure...')

        let foundIssue = false

        for (const p of properties) {
            if (p.images.length > 0) {
                // Check first image
                const firstImg = p.images[0]
                if (firstImg.includes(',') && firstImg.includes('http')) {
                    console.log(`\n[!] FOUND POTENTIAL ISSUE with Property ID: ${p.id}`)
                    console.log(`Title: ${p.title}`)
                    console.log(`Images Array Length: ${p.images.length}`)
                    console.log(`First Element (truncated): ${firstImg.substring(0, 100)}...`)
                    console.log(`Does it look like multiple URLs? ${firstImg.split('http').length > 2}`)
                    foundIssue = true
                }
            }
        }

        if (!foundIssue) {
            console.log('\nNo obvious comma-separated URLs found in the first 20 records. checking specifically for Fazwaz...')
            // Try raw query to find specific one if possible, or just scan more
            // Let's just scan all properties with a cursor if needed, but 20 might hit it if it's common.
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkImages()
