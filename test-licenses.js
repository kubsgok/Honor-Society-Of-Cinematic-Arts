// Simple test script to check fetchLicenses API
// Run with: node test-licenses.js

const fetch = require('node-fetch');

async function testFetchLicenses() {
    console.log('=== Testing fetchLicenses API ===\n');
    
    try {
        // Test the API endpoint
        const response = await fetch('http://localhost:3000/api/fetchLicenses');
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
            console.log('❌ API call failed');
            const errorText = await response.text();
            console.log('Error response:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('\n=== RAW API RESPONSE ===');
        console.log(JSON.stringify(data, null, 2));
        
        console.log('\n=== ANALYSIS ===');
        console.log('Response has licensesData property:', 'licensesData' in data);
        console.log('licensesData is array:', Array.isArray(data.licensesData));
        console.log('Number of licenses:', data.licensesData?.length || 0);
        
        if (data.licensesData && data.licensesData.length > 0) {
            console.log('\n=== LICENSE DETAILS ===');
            data.licensesData.forEach((license, index) => {
                console.log(`License ${index + 1}:`);
                console.log(`  ID: ${license.id}`);
                console.log(`  Chapter ID: "${license.chapter_id}" (type: ${typeof license.chapter_id})`);
                console.log(`  Chapter Fee: $${license.chapter_fee}`);
                console.log(`  Member Fee: $${license.member_fee}`);
                console.log(`  Chapter Fee Paid: ${license.chapter_fee_paid}`);
                console.log(`  License Paid: ${license.license_paid}`);
                console.log(`  Created: ${license.created_at}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No licenses found in response');
        }
        
        console.log('✅ Test completed successfully');
        
    } catch (error) {
        console.log('❌ Test failed with error:');
        console.error(error);
    }
}

// Run the test
testFetchLicenses();