import express from "express";

const app = express();

app.use(express.json());

app.get("/data", async (req, res) => {
  res.json({
    name: "drew",
  });
});

app.listen(3000, () => {
  console.log("🚀 Server ready at http://localhost:3000");
});
