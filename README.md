# BloodBond - Blood Donation Management System

BloodBond is a comprehensive blood donation management platform that connects blood donors with hospitals and those in need. The platform facilitates blood donation requests, hospital inventory management, and emergency blood requirements.
> 🏆 This project won the **Algoconnect Hackathon**, showcasing its real-world utility, impact, and innovation.

## 🌟 Features

### For Users
- User registration and authentication
- Real-time blood availability checking
- Blood donation request management
- Emergency blood requests
- Location-based hospital search
- Blood donation history tracking
- Review and rating system for hospitals
- Smart chatbot assistance

### For Hospitals
- Hospital registration and authentication
- Blood inventory management
- Blood request processing
- Emergency request handling
- Donor management
- Operating hours management
- Blood availability updates

## 🚀 Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer
- Bcrypt.js

## 💻 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/bloodbond.git
cd bloodbond
```

2. Install Frontend Dependencies
```bash
cd Frontend
npm install
```

3. Install Backend Dependencies
```bash
cd Backend
npm install
```

4. Set up Environment Variables
Create `.env` file in the Backend directory with:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
EMAIL_HOST=smtp.gmail.com
```

5. Start the Development Servers
```bash
# Start Backend (from Backend directory)
npm start

# Start Frontend (from Frontend directory)
npm run dev
```

## 📱 Core Functionalities

1. **User Management**
   - Registration and authentication
   - Profile management
   - Blood donation history
   - Health information tracking

2. **Hospital Management**
   - Hospital registration and verification
   - Blood inventory management
   - Request processing
   - Emergency response system

3. **Blood Request System**
   - Regular blood requests
   - Emergency requests
   - Request tracking
   - Status updates

4. **Smart Chatbot**
   - Blood availability queries
   - Hospital information
   - Emergency guidance
   - Document analysis

## 🔒 Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Input validation
- File upload validation
- Rate limiting

## 📄 API Documentation

### Authentication Routes
- POST `/api/auth/register/user` - Register new user
- POST `/api/auth/register/hospital` - Register new hospital
- POST `/api/auth/login/user` - User login
- POST `/api/auth/login/hospital` - Hospital login

### Blood Request Routes
- POST `/api/requests/:hospitalId` - Create blood request
- GET `/api/requests/my-requests` - Get user's requests
- PUT `/api/requests/cancel/:requestId` - Cancel request

### Hospital Routes
- GET `/api/hospitals` - Get all hospitals
- GET `/api/hospitals/:id` - Get hospital details
- PUT `/api/hospitals/inventory` - Update blood inventory

## 📱 Screenshots

![UI/UX](/Frontend/Assets/Screenshot%202025-03-07%20151521.png)



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License

Copyright (c) 2024 BloodBond

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "BloodBond System"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 👥 Team

## 👥 Team Buggi Coders

| Role | Member |
|------|---------|
| Frontend Developer | Kaushik Kumar |
| Backend Developer | Prajjwal Saggar |
| UI/UX Designer | Sameer Senapati |
| Project Manager | Prajjwal Saggar |
| QA Engineer | Akash Singh |

Join our team of passionate developers working to make blood donation more accessible!




