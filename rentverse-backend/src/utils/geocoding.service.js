const axios = require('axios');

/**
 * Geocoding utility using Nominatim (OpenStreetMap)
 * Free service, no API key required
 * Rate limit: 1 request per second
 */
class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org';
    this.userAgent = 'RentVerse/1.0';
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  /**
   * Wait to respect rate limiting
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Geocode an address to get latitude and longitude
   * @param {string} address - Full address string
   * @returns {Promise<{lat: number, lng: number} | null>}
   */
  async geocodeAddress(address) {
    if (!address || typeof address !== 'string') {
      console.error('Invalid address provided:', address);
      return null;
    }

    try {
      await this.respectRateLimit();

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };
      }

      console.log(`No geocoding results for address: ${address}`);
      return null;
    } catch (error) {
      console.error(`Geocoding error for address "${address}":`, error.message);
      return null;
    }
  }

  /**
   * Build full address string from property fields
   * @param {Object} property - Property object with address fields
   * @returns {string}
   */
  buildAddressString(property) {
    const parts = [];

    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zipCode) parts.push(property.zipCode);
    if (property.country) parts.push(property.country);

    return parts.filter(Boolean).join(', ');
  }

  /**
   * Geocode a property object
   * @param {Object} property - Property with address fields
   * @returns {Promise<{lat: number, lng: number} | null>}
   */
  async geocodeProperty(property) {
    const addressString = this.buildAddressString(property);

    if (!addressString) {
      console.error('Cannot build address string for property:', property.id);
      return null;
    }

    console.log(`Geocoding property ${property.id}: ${addressString}`);
    return await this.geocodeAddress(addressString);
  }
}

module.exports = new GeocodingService();
