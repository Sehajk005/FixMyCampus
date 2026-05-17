const { sequelize } = require('../config/database');

async function migrate() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.addColumn('tickets', 'photo_url', {
      type: require('sequelize').DataTypes.STRING(255),
      allowNull: true,
    });
    console.log('Added photo_url column.');
    
    await queryInterface.addColumn('tickets', 'is_anonymous', {
      type: require('sequelize').DataTypes.BOOLEAN,
      defaultValue: false,
    });
    console.log('Added is_anonymous column.');
    
    console.log('Migration complete.');
  } catch (error) {
    if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration error:', error);
    }
  } finally {
    process.exit();
  }
}

migrate();
