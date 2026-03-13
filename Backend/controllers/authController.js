const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

const registerUser = async (req, res) => {
  const { name, email, phone, password, bloodGroup, location, organDonation } = req.body;
  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone,
        password: hashedPassword,
        blood_group: bloodGroup,
        location_city: location?.city,
        location_state: location?.state
      })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, type: 'user', name: data.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token, userType: 'user', userName: data.name });
  } catch (err) {
    console.error('Register user error:', err);
    res.status(500).json({ message: err.message });
  }
};

const registerHospital = async (req, res) => {
  const { email, phone, password, hospitalName, registrationNumber, location, operatingHours, emergencyContact } = req.body;
  try {
    const { data: existingHospital } = await supabase
      .from('hospitals')
      .select('id')
      .eq('email', email)
      .single();

    if (existingHospital) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const { data, error } = await supabase
      .from('hospitals')
      .insert({
        email,
        phone,
        password: hashedPassword,
        hospital_name: hospitalName,
        registration_number: registrationNumber,
        location_city: location?.city,
        location_state: location?.state,
        operating_hours_open: operatingHours?.open || '09:00',
        operating_hours_close: operatingHours?.close || '18:00',
        emergency_contact_name: emergencyContact?.name,
        emergency_contact_phone: emergencyContact?.phone
      })
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, type: 'hospital', name: data.hospital_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'Hospital registered successfully', token, userType: 'hospital', userName: data.hospital_name });
  } catch (err) {
    console.error('Register hospital error:', err);
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({
      id: user.id,
      type: 'user',
      name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userType: 'user', userName: user.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginHospital = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: hospital, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !hospital) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: hospital.id, type: 'hospital', name: hospital.hospital_name }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userType: 'hospital', userName: hospital.hospital_name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerUser, registerHospital, loginUser, loginHospital };
