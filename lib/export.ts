import { ExchangeDataSet, ExchangeResponse } from "./data"
import fs = require('fs')

export class CSVExport {
    private fields:Array<string> = null

    constructor() {
    }

    public export(resp:ExchangeResponse, filename:string) {

        if (resp.result == 'success' && resp.exchanges.length>0) {

            console.log("export data...")

            if (this.fields==null) {
                this.fields = new Array<string>()

                for (let p in resp.exchanges[0]) {
                    this.fields.push(p)
                }
            }

            var strm = fs.createWriteStream(filename)

            for (let f of this.fields) {
                strm.write(f + "\t")    
            }

            strm.write('\n')

            for (let ex of resp.exchanges) {
                for (let f of this.fields) {
                    let v = ex[f]

                    if (v instanceof Date) {
                        strm.write(v.toISOString() + "\t")
                    } else {
                        strm.write(v + "\t")
                    }

                }
                
                strm.write('\n')
            }   

            strm.close();
            console.log("export finished.")
        
        } else {
            console.log("don't export data: result=" + resp.result )
        }
    }


}