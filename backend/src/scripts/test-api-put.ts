import dotenv from 'dotenv';
dotenv.config();

import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';

async function test() {
  try {
    const payload = {
      user: {
        id: 'mock-admin-id',
        role: 'ADMIN',
      },
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // First fetch services to get a valid ID
    console.log('Fetching services from API...');
    const servicesRes = await axios.get('http://localhost:5001/api/services');
    console.log(`Fetched ${servicesRes.data.length} services.`);
    if (servicesRes.data.length === 0) {
      console.log('No services found.');
      return;
    }

    const service = servicesRes.data[0];
    console.log('Testing update on service:', service);

    const price = service.price + 15;
    console.log(`Updating price to ${price}...`);

    const res = await axios.put(
      `http://localhost:5001/api/services/${service.id}`,
      { price },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('API Response status:', res.status);
    console.log('API Response data:', res.data);
  } catch (error: any) {
    if (error.response) {
      console.error('API Response Error Status:', error.response.status);
      console.error('API Response Error Data:', error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  }
}

test().then(() => process.exit(0));
