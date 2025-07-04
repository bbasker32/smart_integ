const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authentication");
const projectsRouter = require("./routes/projects");
const usersRouter = require("./routes/users");
const profileRoutes = require("./routes/profiles");
const publicationRoutes = require("./routes/publication");
const postingsRoutes = require("./routes/postings");
const cvUploadRoutes = require("./routes/cvUpload");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve avatars as static files
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads/avatars"))
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/profiles", profileRoutes);
app.use("/api/publications", publicationRoutes);
app.use("/api/postings", postingsRoutes);
app.use("/api", cvUploadRoutes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
