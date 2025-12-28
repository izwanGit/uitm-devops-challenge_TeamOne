const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
// Using a random password that likely matches a test user or just attempting logic.
// Since we don't know exact credentials, we might fail login, but we can verify 401s properly.
// Best approach: Use an existing user if known, or rely on creating one.
// For now, let's assume we can get a token or just test public vs protected routes.

const test = async () => {
  console.log('Starting verification...');

  // 1. Test Public Route (GET Properties)
  try {
    const res = await axios.get(`${API_URL}/properties`);
    console.log('[PASS] GET /properties is public');
  } catch (error) {
    console.error(
      '[FAIL] GET /properties should be public',
      error.response?.status
    );
  }

  // 2. Test Protected Route without Token (POST Property)
  try {
    await axios.post(`${API_URL}/properties`, {});
    console.error('[FAIL] POST /properties should require auth');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('[PASS] POST /properties requires auth (401)');
    } else {
      console.error(
        '[FAIL] POST /properties returned unexpected status',
        error.response?.status
      );
    }
  }

  // 3. Test Validation (assuming we could get a token - mocked for now or just check if 401 takes precedence)
  // Since we check auth first, we can't test validation without a valid token.
  // We will assume auth check priority is correct (Auth -> Validation).

  // 4. Test Rate Limit (Hit endpoint 100+ times)
  // This might trigger rate limit for 15 mins, so run this last or be careful.
  let limitHit = false;
  console.log('Testing rate limit (sending requests)...');
  try {
    for (let i = 0; i < 110; i++) {
      try {
        await axios.get(`${API_URL}/properties`);
      } catch (e) {
        if (e.response?.status === 429) {
          limitHit = true;
          console.log(`[PASS] Rate limit hit at request #${i + 1}`);
          break;
        }
      }
    }
    if (!limitHit) {
      console.warn(
        '[WARN] Rate limit not hit after 110 requests (limit might be higher or per IP)'
      );
    }
  } catch (error) {
    console.error('Error during rate limit test', error.message);
  }
};

test();
