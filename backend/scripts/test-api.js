import axios from 'axios';

async function run() {
  try {
    const base = process.env.BASE_URL || 'http://localhost:4000';
    // login
    const loginResp = await axios.post(`${base}/auth/login`, { username: 'host', password: 'hostpass123' });
    console.log('login:', loginResp.data.user.username, loginResp.data.token ? 'token received' : 'no token');
    const token = loginResp.data.token;

    // create call
    const callPayload = {
      customerName: 'Test Customer',
      phone: '9999999999',
      email: 'test@example.com',
      address: '123 Test Ave',
      problem: 'Test problem',
      category: 'Technical Issue',
      assignedTo: '',
      status: 'PENDING'
    };

    const callResp = await axios.post(`${base}/calls`, callPayload, { headers: { Authorization: `Bearer ${token}` } });
    console.log('created call id:', callResp.data.id);
  } catch (err) {
    console.error('test failed', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
