const User = require('../models/User');


//   if (!vendor || !productName) {
//     return res.status(400).json({ message: 'Vendor and product name are required' });
//   }

//   try {
//     const user = await User.findById(req.user._id);

//     // Role-based product limit
//     const maxProducts = user.role === 'pro' ? 10 : 5;

//     // Check if limit reached
//     if (user.products.length >= maxProducts) {
//       return res.status(403).json({
//         message: `Limit reached: ${user.role} users can only add up to ${maxProducts} products.`,
//       });
//     }

//     // Check if product already added (optional, prevent duplicates)
//     const alreadyExists = user.products.some(
//       (p) => p.vendor === vendor && p.productName.toLowerCase() === productName.toLowerCase()
//     );
//     if (alreadyExists) {
//       return res.status(409).json({ message: 'Product already exists for this user' });
//     }

//     user.products.push({ vendor, productName });
//     await user.save();

//     res.status(200).json({
//       message: 'Product added successfully',
//       products: user.products,
//     });
//   } catch (err) {
//     console.error('[Add Product Error]', err.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
exports.addUserProduct = async (req, res) => {
    const productsToAdd = req.body.products; // Expecting array
  
    if (!Array.isArray(productsToAdd) || productsToAdd.length === 0) {
      return res.status(400).json({ message: 'Array of vendor-product pairs is required' });
    }
  
    try {
      const user = await User.findById(req.user._id);
  
      const maxProducts = user.role === 'pro' ? 10 : 5;
      const remaining = maxProducts - user.products.length;
  
      const validToAdd = productsToAdd
        .filter(p => p.vendor && p.productName)
        .filter(p => !user.products.some(
          (existing) =>
            existing.vendor === p.vendor &&
            existing.productName.toLowerCase() === p.productName.toLowerCase()
        ));
  
      if (validToAdd.length === 0) {
        return res.status(409).json({ message: 'No valid new products to add (duplicates or invalid)' });
      }
  
      if (validToAdd.length > remaining) {
        return res.status(403).json({
          message: `Cannot add ${validToAdd.length} product(s). Only ${remaining} slot(s) left.`,
        });
      }
  
      // Add valid products
      validToAdd.forEach(({ vendor, productName }) => {
        user.products.push({ vendor, productName });
      });
  
      await user.save();
  
      res.status(200).json({
        message: `${validToAdd.length} product(s) added successfully`,
        products: user.products,
      });
    } catch (err) {
      console.error('[Add Product Error]', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
exports.viewUserProducts = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const maxProducts = user.role === 'pro' ? 10 : 5;
  
      res.status(200).json({
        products: user.products,
        addedCount: user.products.length,
        remaining: maxProducts - user.products.length,
        maxAllowed: maxProducts,
      });
    } catch (err) {
      console.error('[View Products Error]', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.updateUserRoleToPro = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.role === 'pro') {
        return res.status(400).json({ message: 'User is already a pro' });
      }
  
      user.role = 'pro';
      await user.save();
  
      const io = req.app.get('io');
      io.to(user.email).emit('user_role_updated', {
        userId: user._id,
        newRole: 'pro',
        message: 'User upgraded to pro',
      });

  
      res.status(200).json({ message: 'Role updated to pro', role: user.role });
    } catch (err) {
      console.error('Update Role Error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.deleteUserProduct = async (req, res) => {
  const { vendor, productName } = req.body;

  if (!vendor || !productName) {
    return res.status(400).json({ message: 'Vendor and product name are required' });
  }

  try {
    const user = await User.findById(req.user._id);

    const initialCount = user.products.length;

    user.products = user.products.filter(
      (p) => !(p.vendor === vendor && p.productName.toLowerCase() === productName.toLowerCase())
    );

    if (user.products.length === initialCount) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await user.save();

    res.status(200).json({
      message: 'Product deleted successfully',
      products: user.products,
    });
  } catch (err) {
    console.error('[Delete Product Error]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Don't return password

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      id: user._id,
      email: user.email,
      role: user.role,
      products: user.products,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('[Get User Details Error]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
