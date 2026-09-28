const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/utils/db");
const materialRoutes = require("./src/routes/materialRoutes");
const authRoutes = require("./src/routes/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "AI StudyBuddy API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});