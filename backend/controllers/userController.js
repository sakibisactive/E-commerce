import User from '../models/User.js';
import Address from '../models/Address.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
      user,
      addresses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.profilePhoto = req.body.profilePhoto !== undefined ? req.body.profilePhoto : user.profilePhoto;

      // Handle email update validation
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
        user.email = req.body.email;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving addresses' });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res) => {
  const { label, addressLine, city, postalCode, phone, isDefault } = req.body;

  try {
    if (!addressLine || !city || !postalCode || !phone) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    if (isDefault) {
      // Unset previous defaults
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      addressLine,
      city,
      postalCode,
      phone,
      isDefault: !!isDefault,
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding address' });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  const { label, addressLine, city, postalCode, phone, isDefault } = req.body;

  try {
    const address = await Address.findById(req.params.id);

    if (!address || address.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (isDefault) {
      // Unset previous defaults
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address.label = label || address.label;
    address.addressLine = addressLine || address.addressLine;
    address.city = city || address.city;
    address.postalCode = postalCode || address.postalCode;
    address.phone = phone || address.phone;
    address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

    const updatedAddress = await address.save();
    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating address' });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address || address.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.deleteOne();
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting address' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Update user role/status (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = req.body.role || user.role;
    await user.save();
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user role' });
  }
};
