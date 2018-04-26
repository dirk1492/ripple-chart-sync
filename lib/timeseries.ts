import { Database } from "./db"
import { Currency, ProviderInfo, AccountInfo, Provider, ProviderCaps } from "./provider";
import { ExchangeDataSet, ExchangeResponse, ParameterSet, Interval } from "./data";
import * as mongodb from 'mongodb'
import {format} from 'util'
import {sequential} from 'promise-sequential'

export class TimeseriesItem {
    _id: mongodb.Long
    open: number
    close: number
    low: number
    high: number
    vwap: number
    count: number
    base_volume: number
    counter_volume: number
    buy_volume: number
    base_currency: Currency
    counter_currency: Currency
    provider: Provider

    constructor(init?:Partial<TimeseriesItem> | ExchangeDataSet, date?:Date) {
        if (init !=null) {
            if (init instanceof ExchangeDataSet) {
                if (date == null) {            
                    this._id = mongodb.Long.fromNumber(init._id) 
                    this.open = init.open
                    this.close = init.close
                    this.low = init.low
                    this.high = init.high
                    this.vwap = init.vwap
                    this.count = this.count
                    this.base_volume = init.base_volume
                    this.counter_volume = init.counter_volume
                    this.buy_volume = init.buy_volume
                    this.base_currency = init.base_currency
                    this.counter_currency = init.counter_currency
                    this.provider = init.provider
                } else {
                    this._id = mongodb.Long.fromNumber(date.getDate()) 
                    this.open = init.close
                    this.close = init.close
                    this.low = init.close
                    this.high = init.close
                    this.vwap = init.close
                    this.count = 0
                    this.base_volume = 0
                    this.counter_volume = 0
                    this.buy_volume = 0
                    this.base_currency = init.base_currency
                    this.counter_currency = init.counter_currency
                    this.provider = init.provider
                }
            } else {
                Object.assign(this, init)
            }
        }
    }

    public copy() : TimeseriesItem {
        return new TimeseriesItem(this)
    }
}

export class Timeseries {
    private name: string;
    private url:string;
    private client:mongodb.MongoClient = null;
    private db:mongodb.Db = null;

    constructor(name: string, host:string = 'localhost', port:number = 27017, authMechanism?:string, user?:string, password?:string) {
        if (authMechanism!=null)
            this.url = format('mongodb://%s:%s@%s:%d/?authMechanism=%s', user, password, host, port, authMechanism);
        else
            this.url = format('mongodb://%s:%d', host, port);   

        this.name = name       
    }

    public async connect() : Promise<mongodb.MongoClient> {
        return new Promise<mongodb.MongoClient>((resolve, reject) => {
            var self = this;

            mongodb.MongoClient.connect(this.url, function(err, client) {
                if (err!=null) {
                    reject(err);
                } else {
                    self.client = client;
                    self.db = client.db(self.name)
                    resolve()
                }
            });         
        })        
    }

    public async create(db: Database, provider: Provider, from: Currency, to: Currency, start: Date = new Date("2017-07-01T00:00:00Z"), interval: Interval = Interval.min5) {
            var current: ExchangeDataSet = null
            var collection = Provider[provider] + '_' + Currency[from] + '_' + Currency[to] + '_' + interval
        
            var coll = await this.getCollection(collection)

            var min = start.getTime()

            await db.foreach(collection, {"_id" : { $gte : min }}, async ex => {

                var item = new TimeseriesItem(ex)
                var previous = current
                current = ex

                return this.fillAndInsert(coll, ex, previous, interval)
            })
    }

    private async fillAndInsert(coll:mongodb.Collection, current: ExchangeDataSet, previous: ExchangeDataSet, interval: Interval) {
        var next = previous==null ? null : this.next(previous.start, interval)

        while (next != null && next < current.start) {
            await this.insert(coll, new TimeseriesItem(previous, next))
            next = this.next(next, interval)    
        }

        return this.insert(coll, new TimeseriesItem(current))
    }

    private async getCollection(name: string) : Promise<mongodb.Collection> {
        var self = this;

        return new Promise<mongodb.Collection>((resolve, reject) => {

            try {
                this.db.collection(name, (err, coll) => {
                    if (err!=null) {
                        reject(err)
                    }
                
                    resolve(coll)                   
                })
            } catch(exp) {
                reject(exp)    
            }
        })
    }

    private async insert(coll:mongodb.Collection, ex: TimeseriesItem) {
        return new Promise<void>((resolve, reject) => {
            coll.update({_id : ex._id},ex , { upsert: true }).then( result => {
                resolve()
            }, err => {
                reject(err)
            }).catch(exp => {
                reject(exp)
            })
        })        
    }

    private next(date: Date, interval: Interval) : Date {

        if (interval == null)
            return null

        switch(interval) {
            case Interval.min1:
                return new Date(date.getTime() + 60000);
            case Interval.min5:
                return new Date(date.getTime() + 300000);
            case Interval.min15:
                return new Date(date.getTime() + 900000);
            case Interval.min30:
                return new Date(date.getTime() + 1800000);
            case Interval.h1:
                return new Date(date.getTime() + 3600000);            
        }

        throw new Error("interval not yet implemented")

    } 

} 