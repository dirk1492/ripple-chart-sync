import { RippleDataClient, Filter } from "./lib/client"
import { Provider, Currency } from "./lib/provider"
import { CSVExport } from "./lib/export"
import fs = require('fs')

import { Database } from "./lib/db"
import { Timeseries } from './lib/timeseries'
 
class Main {
    private client: RippleDataClient

    private fields:Array<string>;

    async run() {
        this.client = new RippleDataClient("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36");


        var db = new Database("RippleExchangeData") 
        await db.connect();


        await this.client.syncAll(db)


        var timeseries = new Timeseries("RippleTimeSeries")
        await timeseries.connect();

        await timeseries.create(db, Provider.Gatehub, Currency.XRP, Currency.USD)


        await db.close(false)

        process.exit()

        //ex.export(res, "./gatehub_xrp_usd.csv")

        //var res = await this.client.getExchanges(Provider.Bitstamp, Currency.XRP, Currency.USD, filter)

        //ex.export(res, "./bistamp_xrp_usd.csv")


        /*
        this.client.getExchanges(Provider.Gatehub, Currency.XRP, Currency.USD, filter).then(res => {
            var ex = new CSVExport()
            ex.export(res, "./gatehub_xrp_usd.csv")
        }).then(res=>{    

        }).catch(err => {
            console.log("error: " + err)
        })
        */
    }
}

var main = new Main();
main.run();


