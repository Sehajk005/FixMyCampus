const { User } = require('../models');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'department', 'phone']
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role, department } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      name,
      email,
      role,
      department: department || null,
      password_hash: 'Test@1234',
      is_verified: true, // auto-verified since created by admin
      status: 'active'
    });

    const userInfo = user.toJSON();
    delete userInfo.password_hash;
    
    res.status(201).json(userInfo);
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['student', 'technician', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated', user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated', user });
  } catch (err) {
    next(err);
  }
};
