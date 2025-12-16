
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearProperties() {
    console.log('Starting full property data cleanup...')

    try {
        // Delete related data first to avoid foreign key constraints if cascading isn't set up perfectly in DB
        console.log('Deleting PropertyFavorites...')
        await prisma.propertyFavorite.deleteMany({})

        console.log('Deleting PropertyRatings...')
        await prisma.propertyRating.deleteMany({})

        console.log('Deleting PropertyViews...')
        await prisma.propertyView.deleteMany({})

        console.log('Deleting Leases...')
        await prisma.lease.deleteMany({})

        // Many-to-many relations usually handled by join tables
        // Prisma handles implicit m-n deletion if we delete the parent, but let's be safe.
        // For implicit m-n relations like PropertyAmenity, we can't easily access the table directly via client 
        // unless explicit. If explicit, delete. If implicit, deleting property cleans it up.
        // Assuming standard Prisma behavior for implicit relations.

        console.log('Deleting Properties...')
        const { count } = await prisma.property.deleteMany({})

        console.log(`Deleted ${count} properties.`)
        console.log('Cleanup complete. Database is ready for clean import.')

    } catch (error) {
        console.error('Error during cleanup:', error)
    } finally {
        await prisma.$disconnect()
    }
}

clearProperties()
