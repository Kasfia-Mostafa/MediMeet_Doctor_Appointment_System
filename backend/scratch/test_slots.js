const axios = require('axios');

const testSlots = async () => {
  try {
    const doctorId = '6634e0e5a6f2b3c4d5e6f7a1'; // Example ID, might need a real one
    const date = '2026-05-10'; // A Sunday (check DB)
    const url = `http://localhost:5001/api/doctors/${doctorId}/slots?date=${date}`;
    console.log('Fetching:', url);
    const { data } = await axios.get(url);
    console.log('SUCCESS:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('ERROR:', err.response?.data || err.message);
  }
};

testSlots();
