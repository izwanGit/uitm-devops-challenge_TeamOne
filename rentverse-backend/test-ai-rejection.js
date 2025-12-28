const axios = require('axios');
const API = 'http://localhost:3001/api';

async function testRejection() {
  const login = await axios.post(`${API}/auth/login`, {
    email: 'tenant@rentverse.com',
    password: 'password123',
    mfaCode: '000000'
  });
  const token = login.data.data.token;
  
  const typesRes = await axios.get(`${API}/property-types`, { headers: { Authorization: `Bearer ${token}` } });
  const types = typesRes.data.data;
  
  // EXTREMELY OVERPRICED property - AI will REJECT this
  const property = {
    title: 'Overpriced Scam Property',
    description: 'Way too expensive for what it is.',
    city: 'Kuala Lumpur',
    propertyType: 'Apartment',
    price: 50000,  // RM 50,000/month for a small apartment = SCAM!
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 400,  // Big enough to pass size check
    furnished: true
  };
  
  try {
    const typeId = types.find(t => t.name === property.propertyType)?.id;
    const res = await axios.post(`${API}/properties`, {
      ...property,
      propertyTypeId: typeId,
      address: 'Test Address, KL',
      state: 'Kuala Lumpur',
      country: 'MY',
      zipCode: '50000',
      latitude: 3.15,
      longitude: 101.71,
      currencyCode: 'MYR',
      isAvailable: true
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    const p = res.data.data.property;
    console.log('\n🧪 AI REJECTION TEST\n');
    console.log(`Property Code: ${p.code}`);
    console.log(`Price: RM ${property.price}/month`);
    console.log(`Status: ${p.status}`);
    console.log(`Approved By: ${p.approvedBy || 'Pending'}`);
    if (p.aiConfidence) {
      console.log(`AI Confidence: ${p.aiConfidence.toFixed(1)}%`);
    }
    console.log('');
    
    if (p.status === 'REJECTED' && p.approvedBy === 'AI_AUTO') {
      console.log('✅ SUCCESS! AI REJECTED the overpriced property!');
    } else {
      console.log('⚠️ Unexpected result');
    }
    
  } catch (err) {
    console.error(`❌ Error: ${err.response?.data?.message || err.message}`);
  }
}

testRejection().catch(console.error);
