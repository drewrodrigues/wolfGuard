import express from "express";
import { Contract, SecType, EventName } from "@stoqey/ib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma.bar.count().then((res) => {
  console.log("prisma.bar.count(): ", res);
});

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  // if (!ib.isConnected) {
  //   res.sendStatus(500);
  // } else {
  //   next();
  // }
});

// ib.on(EventName.all, (e, args) => {
//   if (e === EventName.error) {
//     console.error({ error: e, args }, "🚨 Error hit");
//   } else {
//     console.info({ e, args }, "ℹ️ Event came through: ");
//   }
// });

app.get("/data", (req, res) => {
  const contract: Contract = {
    symbol: "MSFT",
    exchange: "SMART",
    currency: "USD",
    secType: SecType.STK,
  };
});

app.listen(3000, () => {
  console.log("🚀 Server ready at http://localhost:3000");
});
