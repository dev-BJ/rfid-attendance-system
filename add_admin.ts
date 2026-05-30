import { createUser } from './lib/auth';

async function add_admin() {
  try {
    await createUser({
      full_name: 'Admin FPI',
      password: '1234567',
      role: 'admin',
      user_id: 'fpi_admin',
      institution: 'fedpolyilaro'
    });
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

add_admin();
