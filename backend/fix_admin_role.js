const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432, user: 'postgres',
  password: '1234', database: 'crowdfunding',
});

async function main() {
  // 1. Find the superadmin user
  const user = await pool.query("SELECT id FROM users WHERE email = 'superadmin@equipo09.com'");
  if (!user.rows[0]) { console.log('User not found'); process.exit(1); }
  const userId = user.rows[0].id;
  console.log('User ID:', userId);

  // 2. Find the admin role
  const allRoles = await pool.query('SELECT id, name FROM roles');
  console.log('Available roles:', allRoles.rows.map(r => r.name));

  const role = allRoles.rows.find(r => r.name === 'admin');
  if (!role) {
    console.log('Admin role not found! Creating it...');
    const newRole = await pool.query(
      "INSERT INTO roles (name, display_name, description) VALUES ('admin', 'Administrador', 'Administrador del sistema') RETURNING id"
    );
    const roleId = newRole.rows[0].id;
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
      [userId, roleId]
    );
    console.log('Admin role created and assigned!');
  } else {
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
      [userId, role.id]
    );
    console.log('Admin role assigned!');
  }

  // 3. Verify
  const check = await pool.query(
    'SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1',
    [userId]
  );
  console.log('User roles now:', check.rows.map(r => r.name));
  
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
