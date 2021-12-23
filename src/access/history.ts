import IBApi, {
  BarSizeSetting,
  Contract,
  EventName,
  SecType,
} from "@stoqey/ib";
import fs from "fs";
import { v1 } from "uuid";
import { ExportToCsv } from "export-to-csv";

const csvExporter = new ExportToCsv({
  useTextFile: false,
  quoteStrings: '"',
  fieldSeparator: ",",
  title: "MSFT",
});

const ib = new IBApi({
  port: 7497,
});
ib.connect();

function getHistoricalData(contract: Contract): Promise<any[]> {
  const requestId = parseInt(v1().replace(/-/g, ""));
  const bars: any[] = [];

  return new Promise((resolve) => {
    ib.on(
      EventName.historicalData,
      (
        dataRequestId,
        time,
        open,
        high,
        low,
        close,
        volume,
        count,
        WAP,
        hasGaps
      ) => {
        if (time.includes("finished")) {
          console.error("hmm: ", time);
          resolve(bars);
        } else if (dataRequestId === requestId) {
          console.log("Pushing bar", { time });
          bars.push({
            time,
            open,
            high,
            low,
            close,
            volume,
            count,
            WAP,
            hasGaps,
          });
          // console.log({
          //   time,
          //   open,
          //   high,
          //   low,
          //   close,
          //   volume,
          //   count,
          //   WAP,
          //   hasGaps,
          // });
          // const csvData = csvExporter.generateCsv(
          //   [
          //     {
          //       time,
          //       open,
          //       high,
          //       low,
          //       close,
          //       volume,
          //       count,
          //       WAP,
          //       hasGaps,
          //     },
          //   ],
          //   true
          // );
          // fs.writeFileSync("data.csv", csvData);
          // res.json({
          //   name: "drew",
          //   isConnected: ib.isConnected,
          //   data: e,
          // });
          // resolve();
        } else {
          console.error("hmm: ", time);
        }
      }
    );

    ib.reqHistoricalData(
      requestId,
      contract,
      "20211223 00:00:00",
      "5 D",
      BarSizeSetting.MINUTES_ONE,
      "MIDPOINT",
      1,
      1,
      false
    );
  });
}

ib.on(EventName.all, (...args) => {
  console.log(args);
});

ib.once(EventName.connected, async () => {
  const contract: Contract = {
    symbol: "MSFT",
    exchange: "SMART",
    currency: "USD",
    secType: SecType.STK,
  };
  const data = await getHistoricalData(contract);
  console.log({ data });
});
