const axios = require('axios');

/**
 * AI Service Client for RentVerse
 * Handles communication with the AI microservice
 */
class AIService {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    }

    /**
     * Check if a property listing should be approved using AI
     * @param {Object} propertyData - Property data for classification
     * @returns {Promise<{approved: boolean, confidence: number, reason: string}>}
     */
    async classifyPropertyApproval(propertyData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/classify/approval`,
                {
                    property_type: propertyData.propertyType || 'Condominium',
                    location: propertyData.city || propertyData.address || 'Unknown',
                    bedrooms: propertyData.bedrooms || 0,
                    bathrooms: propertyData.bathrooms || 0,
                    area: propertyData.areaSqm || 0,
                    furnished: propertyData.furnished || false,
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

            // Map AI response to our format
            return {
                approved: result.approval_status === 'approved',
                needsReview: result.approval_status === 'needs_review',
                rejected: result.approval_status === 'rejected',
                confidence: result.confidence_score || 0,
                reason: result.reasons?.join(', ') || 'AI classification completed',
                predictedPrice: result.predicted_market_price || null,
                priceDeviation: result.price_deviation_percentage || null,
                recommendations: result.recommendations || []
            };
        } catch (error) {
            console.error('AI Service Error:', error.message);

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
                `${this.baseUrl}/classify/price`,
                {
                    property_type: propertyData.propertyType || 'Condominium',
                    location: propertyData.city || 'Unknown',
                    bedrooms: propertyData.bedrooms || 0,
                    bathrooms: propertyData.bathrooms || 0,
                    area: propertyData.areaSqm || 0,
                    furnished: propertyData.furnished || false
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
