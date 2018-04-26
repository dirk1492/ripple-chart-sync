import * as mongodb from 'mongodb'
import {format} from 'util'

import { ExchangeDataSet, ExchangeResponse } from "./data";
import { Currency, Provider } from "./provider";

const assert = require('assert');

type DatabaseLoopCallback = (item: ExchangeDataSet) => Promise<void>;

export class Database {

    private name: string;
    private url:string;
    private client:mongodb.MongoClient = null;
    private db:mongodb.Db = null;
    private collection:mongodb.Collection = null;

    constructor(name: string, host:string = 'localhost', port:number = 27017, authMechanism?:string, user?:string, password?:string) {
        if (authMechanism!=null)
            this.url = format('mongodb://%s:%s@%s:%d/?authMechanism=%s', user, password, host, port, authMechanism);
        else
            this.url = format('mongodb://%s:%d', host, port);   

        this.name = name    
    }

    public async connect(collection?:string) : Promise<mongodb.MongoClient> {
        return new Promise<mongodb.MongoClient>((resolve, reject) => {
            var self = this;

            mongodb.MongoClient.connect(this.url, function(err, client) {
                if (err!=null) {
                    reject(err);
                } else {
                    self.client = client;
                    self.db = client.db(self.name)

                    if (collection!=null) {
                        self.db.collection(collection, (err, coll) => {
                            if (err!=null) {
                                reject(err)
                            }
                        
                            //coll.createIndex({start:1})
                            self.collection = coll
                        })
                    }
                    
                    resolve(client)
                }
              });         
        })        
    }

    public async setCollection(name: string) : Promise<void> {
        var self = this;

        return new Promise<void>((resolve, reject) => {

            try {
                this.db.collection(name, (err, coll) => {
                    if (err!=null) {
                        reject(err)
                    }
                
                    coll.createIndex({start:1})
                    self.collection = coll

                    resolve()
                    
                })
            } catch(exp) {
                reject(exp)    
            }
        })
    }

    public close(force:boolean) {
        return new Promise((resolve, reject) => {
            var self = this;

            if (this.close == null) {
                reject("connection already closed")
            }

            this.client.close(force, () => {
                resolve()
            })
        })
    }

    public async clear() {
        return new Promise((resolve, reject) => {
            this.collection.remove({}).then( result => {
                resolve(result)    
            }, err => {
                reject(err)
            }).catch(exp => {
                reject(exp)
                
            })
        })
    }

    public async insert(data: ExchangeDataSet) {
        return new Promise((resolve, reject) => {
            data._id = mongodb.Long.fromNumber(data._id)

            this.collection.update({_id : data._id},data , { upsert: true }).then( result => {
                resolve(result)
            }, err => {
                reject(err)
            }).catch(exp => {
                reject(exp)
            })
        })
    }

    public async set(data: ExchangeDataSet | ExchangeResponse) {
        if (data instanceof ExchangeDataSet) {
            return this.insert(data) 
        } else if (data instanceof ExchangeDataSet) {            
            if (data.result == 'success') {
                for (let ex of data.exchanges) {
                    await this.insert(ex)    
                }
            } else {
                throw new Error(data.result)
            } 
        }
    }

    public async last(provider: Provider, from: Currency, to: Currency) : Promise<Date> {
        return new Promise<Date>((resolve, reject) => {
            this.collection.find<ExchangeDataSet>({provider: provider, base_currency: from, counter_currency: to}).sort({start:-1}).limit(1).next().then(result=>{
                if (result != null && result.start != null) {
                    resolve(result.start);
                } else {
                    resolve(null);
                }
            }).catch(exp => {
                resolve(null)
            })
        })
    }

    private async getCollection(name: string) : Promise<mongodb.Collection> {
        var self = this
        
        return new Promise<mongodb.Collection>((resolve, reject) => {
            self.db.collection(name, (err, coll) => {
                if (err!=null) {
                    reject(err)
                } else {
                    resolve(coll)
                }
            })
        })
    }

    public async foreach(collname: string, query: mongodb.FilterQuery<ExchangeDataSet>, cb: DatabaseLoopCallback) {
        var self = this

        var collection = await this.getCollection(collname)

        var cursor = collection.find<ExchangeDataSet>(query).sort({start:1})

        while(await cursor.hasNext()) {
            const ex = await cursor.next()
            await cb(ex as ExchangeDataSet)
        }
    }

    // .find({"_id" : { $gte : 1430096400000 }})
    // .find({"start" : { $gte : new ISODate("2015-04-26T14:00:00Z") }})
}