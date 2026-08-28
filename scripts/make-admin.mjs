import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
});

async function main() {
  try {
    // First list all users
    const users = await pool.query('SELECT email, role FROM "User"');
    console.log('All users:', users.rows);

    // Make rohithaaa20@gmail.com admin
    const result = await pool.query(
      'UPDATE "User" SET role = $1 WHERE email = $2 RETURNING id, email, role',
      ['admin', 'rohithaaa20@gmail.com']
    );

    if (result.rows.length === 0) {
      console.log('No user found with that email.');
    } else {
      console.log('Updated:', result.rows[0]);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
