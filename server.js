require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const activityRoutes = require('./routes/activityRoutes');
const participationRoutes = require('./routes/participationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const changePasswordRoutes = require('./routes/changePasswordRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const pointsConfigRoutes = require('./routes/pointsConfigRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/', (req, res) => {
  res.send('Student Extra-Curricular Activities Management API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/user', changePasswordRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/points-config', pointsConfigRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/user-management', userManagementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
