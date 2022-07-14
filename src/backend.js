import express from "express";
const app = express();
  
app.get("/", (req, res) => {
  console.log("Connecting to react");
  res.redirect("/");
});
  
const PORT = process.env.PORT || 8080;
  
app.listen(PORT, console.log(`Server started on port ${PORT}`));