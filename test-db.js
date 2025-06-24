const { Sequelize } = require('sequelize');

const passwords = ['', 'root', 'password', 'admin', '123456'];

async function testConnection(password) {
  const sequelize = new Sequelize(
    'palahian',
    'root',
    password,
    {
      host: 'localhost',
      dialect: 'mysql',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log(`✅ Connection successful with password: "${password}"`);
    return true;
  } catch (error) {
    console.log(`❌ Failed with password: "${password}" - ${error.message}`);
    return false;
  } finally {
    await sequelize.close();
  }
}

async function testAllPasswords() {
  for (const password of passwords) {
    const success = await testConnection(password);
    if (success) {
      console.log(`\n🎉 Found working password: "${password}"`);
      return password;
    }
  }
  console.log('\n❌ None of the common passwords worked. You may need to check your MySQL root password.');
  return null;
}

testAllPasswords(); 