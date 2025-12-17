const axios = require('axios');

/**
 * AI Service Client for RentVerse
 * Handles communication with the AI microservice
 */
class AIService {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

        // Map database property types to AI-expected enum values
        // AI expects: 'Apartment', 'Condominium', 'Service Residence', 'Townhouse'
        this.propertyTypeMap = {
            'condo': 'Condominium',
            'condominium': 'Condominium',
            'apartment': 'Apartment',
            'apt': 'Apartment',
            'service residence': 'Service Residence',
            'serviced residence': 'Service Residence',
            'townhouse': 'Townhouse',
            'town house': 'Townhouse',
            'terrace': 'Townhouse',
            'landed': 'Townhouse',
            // Add more mappings as needed
        };
    }

    /**
     * Normalize property type to AI-expected enum value
     */
    normalizePropertyType(propertyType) {
        if (!propertyType) return 'Condominium'; // Default

        const normalized = propertyType.toLowerCase().trim();

        // Direct match in map
        if (this.propertyTypeMap[normalized]) {
            return this.propertyTypeMap[normalized];
        }

        // Check if it contains any known keywords
        if (normalized.includes('condo')) return 'Condominium';
        if (normalized.includes('apartment') || normalized.includes('apt')) return 'Apartment';
        if (normalized.includes('service') && normalized.includes('residence')) return 'Service Residence';
        if (normalized.includes('town') || normalized.includes('terrace') || normalized.includes('landed')) return 'Townhouse';

        // If already a valid AI enum value, use it
        const validTypes = ['Apartment', 'Condominium', 'Service Residence', 'Townhouse'];
        for (const validType of validTypes) {
            if (propertyType.toLowerCase() === validType.toLowerCase()) {
                return validType;
            }
        }

        // Default to Condominium if unknown
        console.log(`⚠️ Unknown property type "${propertyType}", defaulting to Condominium`);
        return 'Condominium';
    }

    /**
     * Check if a property listing should be approved using AI
     * @param {Object} propertyData - Property data for classification
     * @returns {Promise<{approved: boolean, confidence: number, reason: string}>}
     */
    async classifyPropertyApproval(propertyData) {
        try {
            // Normalize property type to AI-expected enum
            const normalizedPropertyType = this.normalizePropertyType(propertyData.propertyType);

            console.log('🤖 AI Service - Sending request to:', `${this.baseUrl}/api/v1/classify/approval`);
            console.log('🤖 AI Service - Property type mapping:', propertyData.propertyType, '->', normalizedPropertyType);
            console.log('🤖 AI Service - Request payload:', {
                property_type: normalizedPropertyType,
                location: propertyData.city || propertyData.address || 'Unknown',
                bedrooms: propertyData.bedrooms || 0,
                bathrooms: propertyData.bathrooms || 0,
                area: propertyData.areaSqm || 0,
                furnished: propertyData.furnished ? 'Yes' : 'No',
                asking_price: parseFloat(propertyData.price) || 0
            });

            const response = await axios.post(
                `${this.baseUrl}/api/v1/classify/approval`,
                {
                    property_type: normalizedPropertyType,
                    location: propertyData.city || propertyData.address || 'Unknown',
                    bedrooms: propertyData.bedrooms || 0,
                    bathrooms: propertyData.bathrooms || 0,
                    area: propertyData.areaSqm || 0,
                    furnished: propertyData.furnished ? 'Yes' : 'No',
                    asking_price: parseFloat(propertyData.price) || 0
                },
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const result = response.data;
            console.log('🤖 AI Service - Response:', result);

            // Map AI response to our format (using correct field name 'approval_reasons')
            return {
                approved: result.approval_status === 'approved',
                needsReview: result.approval_status === 'needs_review',
                rejected: result.approval_status === 'rejected',
                confidence: result.confidence_score || 0,
                reason: result.approval_reasons?.join(', ') || 'AI classification completed',
                predictedPrice: result.predicted_price || null,
                priceDeviation: result.price_deviation || null,
                recommendations: result.recommendations || []
            };
        } catch (error) {
            console.error('❌ AI Service Error:', error.message);
            if (error.response) {
                console.error('❌ AI Service Error Response:', error.response.data);
            }

            // Fallback to manual review if AI service fails
            return {
                approved: false,
                needsReview: true,
                rejected: false,
                confidence: 0,
                reason: 'AI service unavailable - requires manual review',
                error: error.message
            };
        }
    }

    /**
     * Get predicted price for a property
     * @param {Object} propertyData - Property data
     * @returns {Promise<number>}
     */
    async predictPrice(propertyData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/classify/price`,
                {
                    property_type: propertyData.propertyType || 'Condominium',
                    location: propertyData.city || 'Unknown',
                    bedrooms: propertyData.bedrooms || 0,
                    bathrooms: propertyData.bathrooms || 0,
                    area: propertyData.areaSqm || 0,
                    furnished: propertyData.furnished ? 'Yes' : 'No'
                },
                {
                    timeout: 10000
                }
            );

            return response.data.predicted_price || 0;
        } catch (error) {
            console.error('AI Price Prediction Error:', error.message);
            return null;
        }
    }

    /**
     * Check if AI service is healthy
     * @returns {Promise<boolean>}
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: 5000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new AIService();
