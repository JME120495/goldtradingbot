const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/auth/register', {
      name: 'test',
      email: 'test' + Date.now() + '@test.com',
      password: 'password'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.data : err.message);
  }
}

test();
