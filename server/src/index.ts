import express from "express";
import { db } from "./access/db";
import { barsController } from './controllers/barsController';
import { symbolsController } from "./controllers/symbolsController";
import morgan from 'morgan';

db.bar.count().then((res) => {
  console.log("prisma.bar.count(): ", res);
});

const app = express();


app.use(express.json());
app.use(morgan('dev'));

app.use('/bars', barsController);
app.use('/symbols', symbolsController);

app.listen(3000, () => {
  console.log("🚀 Server ready at http://localhost:3000");
});
