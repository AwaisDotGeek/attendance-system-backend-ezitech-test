const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, studentId, email, password } = req.body;
    const { file } = req;

    if (!username || !studentId || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      username,
      studentId,
      email,
      photo_path: file ? file.path : null,
      password
    });
    await user.save();
    res.status(201).send('User registered');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { idOrEmail, password } = req.body;
    const user = await User.findOne({ $or: [{ email: idOrEmail }, { studentId: idOrEmail }] });
    if (!user) return res.status(400).send('Invalid username or password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send('Invalid username or password');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    let user = await User.findById(userId).select('-password'); // exclude password from the response

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.photo_path = transformPhotoPath(req, user.photo_path);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "attendances",
          localField: '_id',
          foreignField: 'userId',
          as: "attendances",
        }
      }
    ]);

    // Transform photo paths for each user
    const transformedUsers = users.map(user => {
      user.photo_path = transformPhotoPath(req, user.photo_path);
      return user;
    });

    res.status(200).json(transformedUsers);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


const transformPhotoPath = (req, photoPath) => {
  if (!photoPath) return null;
  
  const fullPath = `${req.protocol}://${req.get('host')}/${photoPath.replace(/\\/g, '/')}`;

  const relevantPath = fullPath.replace('src/', ''); 
  return relevantPath;
};
