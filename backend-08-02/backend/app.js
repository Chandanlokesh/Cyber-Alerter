const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // ✅ For creating HTTP server
const socketIo = require('socket.io'); // ✅ WebSocket

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));

app.use('/',  require('./routes/userRoutes'));
app.use('/', require('./routes/viewRoutes'));
app.use('/', require('./routes/dashboardRoutes'));

// ✅ Create HTTP Server
const server = http.createServer(app);

// ✅ Attach socket.io to server
const io = socketIo(server, {
  cors: {
    origin: '*', // Adjust if needed
    methods: ['GET', 'POST'],
  },
});

// ✅ Attach io instance to app so other modules can access
app.set('io', io);

// ✅ Optional: basic connection log
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // adjust path

io.on('connection', async (socket) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log('❌ No token provided');
      socket.disconnect();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('❌ User not found');
      socket.disconnect();
      return;
    }

    const roomId = user.email; 
    socket.join(roomId);

    socket.emit('joined-room', { room: roomId });

    socket.on('disconnect', () => {
    });

  } catch (err) {
    console.error('WebSocket Auth Error:', err.message);
    socket.disconnect();
  }
});

const cron = require('node-cron');
const { collectAllData } = require('./services/collector');
let nextRunTime = null;

function calculateNextRun() {
  const now = new Date();

const next = new Date(now.getTime() + 1 * 60 * 1000);
  nextRunTime = next;

  app.get('io').emit('cron-next-run', {
    nextRunTime: next.toISOString(),
  });
}

calculateNextRun();

cron.schedule('*/3 * * * *', async () => {
    app.get('io').emit('cron-active', {
    active:true,
  });
    console.log('⏱️ Cron job running every 3 minutes...');
    await collectAllData(app);
    calculateNextRun();
  });

app.get('/api/cron-next-run', (req, res) => {
  if (!nextRunTime) {
    return res.status(500).json({ message: 'Next cron time not calculated yet' });
  }
  res.json({ nextRunTime: nextRunTime.toISOString() });
});

const resetScanCountJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await User.updateMany({}, { scanCount: 0 });
      console.log('[Cron] ✅ scanCount reset to 0 for all users');
    } catch (err) {
      console.error('[Cron Error] ❌ Failed to reset scanCount:', err.message);
    }
  });
};

resetScanCountJob()
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        server.listen(process.env.PORT || 5000, '0.0.0.0',() => {
            console.log("Server running on port", process.env.PORT || 5000);
        });
    })
    .catch(err => console.log(err));

    //192.168.1.11