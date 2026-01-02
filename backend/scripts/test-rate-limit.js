const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function testRateLimiting() {
    console.log('Testing Rate Limiting System...\n');
    
    try {
        // Test 1: Check initial status
        console.log('1. Checking initial login status...');
        const statusResponse = await axios.get(`${BASE_URL}/auth/login-status`);
        console.log('Initial status:', statusResponse.data);
        
        // Test 2: Make 5 failed login attempts
        console.log('\n2. Making 5 failed login attempts...');
        for (let i = 1; i <= 5; i++) {
            try {
                await axios.post(`${BASE_URL}/auth/login`, {
                    username: 'wronguser',
                    password: 'wrongpass'
                });
            } catch (error) {
                console.log(`Attempt ${i}: ${error.response?.status} - ${error.response?.data?.error}`);
            }
        }
        
        // Test 3: Check status after failed attempts
        console.log('\n3. Checking status after failed attempts...');
        const statusAfterFails = await axios.get(`${BASE_URL}/auth/login-status`);
        console.log('Status after fails:', statusAfterFails.data);
        
        // Test 4: Try to login when blocked
        console.log('\n4. Trying to login when blocked...');
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                username: 'admin',
                password: 'correctpass'
            });
        } catch (error) {
            console.log(`Blocked login attempt: ${error.response?.status} - ${error.response?.data?.error}`);
            console.log('Remaining time:', error.response?.data?.remainingTime);
        }
        
        console.log('\nRate limiting test completed!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testRateLimiting();