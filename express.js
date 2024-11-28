const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

// MySQL Connection
const sequelize = new Sequelize('tech_summit_db', 'your_username', 'your_password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Registration Model
const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tickets: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 5
    }
  },
  dietaryRestrictions: {
    type: DataTypes.ENUM('none', 'vegetarian', 'vegan', 'gluten-free'),
    defaultValue: 'none'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2)
  }
});

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Sync Database
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
})();

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      company, 
      jobTitle, 
      tickets, 
      dietaryRestrictions 
    } = req.body;

    const TICKET_PRICE = 499;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for existing registration
    const existingRegistration = await Registration.findOne({ 
      where: { email },
      transaction 
    });

    if (existingRegistration) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create registration
    const newRegistration = await Registration.create({
      firstName,
      lastName,
      email,
      phone,
      company: company || null,
      jobTitle: jobTitle || null,
      tickets: tickets || 1,
      dietaryRestrictions: dietaryRestrictions || 'none',
      totalAmount: TICKET_PRICE * (tickets || 1)
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    res.status(201).json({ 
      message: 'Registration successful',
      registrationId: newRegistration.id,
      totalAmount: newRegistration.totalAmount
    });

  } catch (error) {
    // Rollback transaction if error occurs
    await transaction.rollback();
    console.error('Registration Error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Get All Registrations (Admin Endpoint)
app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.findAll();
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ 
      message: 'Could not retrieve registrations' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;