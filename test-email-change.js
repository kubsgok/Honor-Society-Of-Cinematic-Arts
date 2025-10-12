/**
 * Test script for debugging email change issues
 * 
 * Usage:
 * 1. Start your Next.js dev server: `npm run dev`
 * 2. Get a valid session token (login to your app and check browser dev tools)
 * 3. Run: `node test-email-change.js`
 */

const BASE_URL = 'http://localhost:3000';
const NEW_EMAIL = 'test-new-email@example.com';

// You need to replace this with a real session token from your browser
const SESSION_TOKEN = 'YOUR_SESSION_TOKEN_HERE';

async function testEmailChange() {
  console.log('🧪 Testing email change route...');
  console.log('Target URL:', `${BASE_URL}/api/changeEmail`);
  console.log('New email:', NEW_EMAIL);
  
  try {
    const response = await fetch(`${BASE_URL}/api/changeEmail`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SESSION_TOKEN}`,
        'Cookie': `sb-access-token=${SESSION_TOKEN}` // Adjust based on your cookie name
      },
      body: JSON.stringify({ email: NEW_EMAIL })
    });

    console.log('\n📡 Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('\n📦 Response body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Email change successful!');
    } else {
      console.log('❌ Email change failed');
      console.log('Error details:', data.error);
      if (data.code) console.log('Error code:', data.code);
      if (data.details) console.log('Error details:', data.details);
    }

  } catch (error) {
    console.error('🚨 Network/fetch error:', error.message);
  }
}

// Instructions for getting session token
console.log(`
📋 To test this script:

1. Start your app: npm run dev
2. Login to your app in the browser
3. Open browser dev tools → Application/Storage → Cookies
4. Find your Supabase session cookie (usually starts with 'sb-')
5. Copy the token value and replace 'YOUR_SESSION_TOKEN_HERE' above
6. Run: node test-email-change.js

Alternatively, check the Network tab when making the request from your frontend
to see the exact headers and cookies being sent.
`);

if (SESSION_TOKEN !== 'YOUR_SESSION_TOKEN_HERE') {
  testEmailChange();
} else {
  console.log('⚠️  Please set a valid SESSION_TOKEN first');
}