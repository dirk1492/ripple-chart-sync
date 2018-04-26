import { Currency, Provider } from "./provider";

export enum Interval {
    min1 = "1minute", 
    min5 = "5minute", 
    min15 = "15minute", 
    min30 = "30minute", 
    h1 =  "1hour", 
    h2 = "2hour", 
    h4 = "4hour", 
    d1 = "1day", 
    d3 = "3day", 
    d7 = "7day", 
    mon1 = "1month",
    none = "none"
}

export class ExchangeResponse {
    "result": string
    "count": number
    "marker": string
    "exchanges": Array<ExchangeDataSet>
    "provider": Provider
    "from": Currency
    "to": Currency
    start: Date
    interval: Interval

    constructor(rc, provider:Provider, from:Currency, to:Currency, interval: Interval) {
        this.result = rc.result
        this.count = rc.count
        this.marker = rc.marker
        this.exchanges = []
        this.provider = provider
        this.from = from
        this.to = to
        this.interval = interval

        for (let ex of rc.exchanges) {
    
            let set: ExchangeDataSet = new ExchangeDataSet({
                _id: this.getID(ex),
                base_volume: +ex.base_volume,
                buy_volume: +ex.buy_volume,
                close: +ex.close,
                close_time: new Date(ex.close_time),
                count: +ex.count,
                counter_volume: +ex.counter_volume,
                high: +ex.high,
                low: +ex.low,
                open: +ex.open,
                open_time: new Date(ex.open_time),
                start: new Date(ex.start),
                vwap: +ex.vwap,
                base_currency: Currency[ex.base_currency as string],
                counter_currency: Currency[ex.counter_currency as string],
                counter_issuer: ex.counter_issuer,
                provider: this.provider
            })
    
            this.exchanges.push(set)
        } 
        
        if (this.exchanges.length>0) {
            this.start = this.exchanges[0].start
        }

    }
    

    public append(rc) {
        this.result = rc.result
        this.count += rc.count
        this.marker = rc.marker

        for (let ex of rc.exchanges) {
    
            let set: ExchangeDataSet = new ExchangeDataSet({
                _id: this.getID(ex),
                base_volume: +ex.base_volume,
                buy_volume: +ex.buy_volume,
                close: +ex.close,
                close_time: new Date(ex.close_time),
                count: +ex.count,
                counter_volume: +ex.counter_volume,
                high: +ex.high,
                low: +ex.low,
                open: +ex.open,
                open_time: new Date(ex.open_time),
                start: new Date(ex.start),
                vwap: +ex.vwap,
                base_currency: Currency[ex.base_currency as string],
                counter_currency: Currency[ex.counter_currency as string],
                counter_issuer: ex.counter_issuer,
                provider: this.provider
            })
    
            this.exchanges.push(set)
        }  
        
    }

    public getCollectionName(ex) : string {
        return ""
    }


    public getID(ex) : number {
        return  new Date(ex.start).getTime() //Provider[this.provider] + '_' + Currency[this.from] + '_' + Currency[this.to] + '_' + this.interval + '_'+ new Date(ex.start).getTime()/1000
    }
    
}  
  
export class ExchangeDataSet {
    "_id": any
    "base_volume": number
    "buy_volume": number
    "close": number
    "close_time": Date
    "count": number
    "counter_volume": number
    "high": number
    "low": number
    "open": number
    "open_time": Date
    "start": Date
    "vwap": number
    "base_currency": Currency
    "counter_currency": Currency
    "counter_issuer": string
    "provider": Provider
    "ctime": Date

    constructor(init?:Partial<ExchangeDataSet>) {
        if (init !=null) {
            Object.assign(this, init)
        }

        this.ctime = new Date(Date.now())
    }

    public copy(date?:Date) : ExchangeDataSet {

        var rc = new ExchangeDataSet(this)

        if (date != null) {
            rc._id = new Date(date).getTime()
            rc.start = date
            rc.open_time = date
            rc.close_time = date

            rc.count = 0
            rc.open = rc.close    
            rc.vwap = rc.close
            rc.low = rc.close
            rc.high = rc.close

            rc.buy_volume = 0
            rc.base_volume = 0
            rc.counter_volume = 0
        }

        return rc;

    }
}

export class ParameterSet{
    private items : Map<string, string>

    constructor() {
        this.items = new Map()
    }

    public Set(name: string, value: string) {
        this.items.set(name, value)
    }

    public toString() : string {

        var rc:string = ""

        this.items.forEach( (value,key) => {
            if (rc.length==0) {
                rc += '?'
            } else {
                rc += '&'
            }

            rc += key + '=' + value    
        });

        return rc;
    }


}