// Test script to create valid Telegram WebApp initData
const crypto = require('crypto');

const BOT_TOKEN = '8180571940:AAG8TLcs6ILfmPRFTN9cK14rVl11_n1PSOI';

// Test user data
const testUser = {
  id: 987654321,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en'
};

// Create initData string
const authDate = Math.floor(Date.now() / 1000);
const userData = JSON.stringify(testUser);

const params = new URLSearchParams({
  user: userData,
  auth_date: authDate.toString()
});

// Create data-check-string
const dataCheckString = Array.from(params.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Create secret key
const secretKey = crypto
  .createHmac('sha256', 'WebAppData')
  .update(BOT_TOKEN)
  .digest();

// Calculate hash
const hash = crypto
  .createHmac('sha256', secretKey)
  .update(dataCheckString)
  .digest('hex');

// Add hash to params
params.set('hash', hash);

const initData = params.toString();

console.log('Test initData:');
console.log(initData);
console.log('\nTest API call:');
console.log(`curl -X POST "https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v2/auth/telegram" -d '{"initData":"${initData}"}' -H 'Content-Type: application/json'`);