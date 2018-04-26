import { RestClient, IRequestOptions, IRestResponse}  from 'typed-rest-client/RestClient';
import { Currency, ProviderInfo, AccountInfo, Provider, ProviderCaps } from "./provider";
import { ExchangeDataSet, ExchangeResponse, ParameterSet, Interval } from "./data";
import { Database } from "./db"

//import * as assert from 'assert'


export interface Filter {
    start: Date,
    end?: Date,
    limit?: Number,
    interval: Interval
}

type ExchangeResponseCallback = (resp: ExchangeResponse) => number;

export class RippleDataClient {
    private client:RestClient
    
    constructor(userAgent: string) {
        this.client = new RestClient(userAgent, "https://data.ripple.com")
    }

    private async processExchanges(provider: Provider, from: Currency, to: Currency, filter: Filter, cb:ExchangeResponseCallback) : Promise<number> {

        var params: ParameterSet = new ParameterSet()

        if (filter!=null) {
            if (filter.start!=null)
                params.Set("start", filter.start.toISOString())
            if (filter.end!=null)
                params.Set("end", filter.end.toISOString())
            if (filter.limit!=null)
                params.Set("limit", filter.limit.toString())
            if (filter.interval!=null)
                params.Set("interval", filter.interval.toString())
        }

        var url = this.getURL(provider, from, to)

        var response = await this.client.get<ExchangeResponse>(url + params.toString())
        
        if (response.statusCode==200 && response.result.result == "success") {
            var result = new ExchangeResponse(response.result, provider, from, to, filter.interval)
            var cnt = cb(result)
            
            if (cnt>0) 
                console.log(result.start.toISOString() + " -> "  + cnt)

            while (response!=null && response.result !=null && response.result.marker!=null) {
                params.Set("marker", response.result.marker); 
                
                try {
                    response = await this.client.get<ExchangeResponse>(url + params.toString())
                    if (response.statusCode==200 && response.result.result == "success") {
                        result = new ExchangeResponse(response.result, provider, from, to, filter.interval)
                        cnt += cb(result)
                        console.log(result.start.toISOString() + " -> "  + cnt)
                    } else {
                        console.log("error: " + response.statusCode)
                    }
                } catch(exp) {
                    console.log("error: " + exp)
                }
            }

            console.log("download finished.")

            return cnt
        }

        return -1
    }

    private getAccountInfo(provider: Provider, from: Currency, to: Currency) : AccountInfo {
        if (provider == null) {
            for (let info of ProviderCaps.values()) {
                for (let account of info.accounts) {
                    if (account.caps.indexOf(to) > -1 && account.caps.indexOf(from) > -1) {
                        return account
                    }   
                }             
            }

            return null
        } else {
            var info:ProviderInfo = ProviderCaps.get(provider);

            for (let account of info.accounts) {
                if (account.caps.indexOf(to) > -1 && account.caps.indexOf(from) > -1) {
                    return account
                }
            }

            return null
        }
    }

    private getURL(provider: Provider, from: Currency, to: Currency) : string {
        var info = this.getAccountInfo(provider, from, to); 

        if (info == null) {
            throw new Error("unknown provider")
        }

        if (from != Currency.XRP && to != Currency.XRP) {
            throw new Error("Exchanges rates only from or to XRP available")
        }

        if (from == Currency.XRP)    
            return '/v2/exchanges/' + Currency[from] + '/' + Currency[to] + '+' + info.address
        else
            return '/v2/exchanges/' + Currency[from] + '+' + info.address + '/' + Currency[to] 
    }

    public async syncAll(db: Database, reload:boolean = false, interval: Interval = Interval.min5) {
        for (let provider of ProviderCaps.keys()) {
            var info = ProviderCaps.get(provider)

            for (let account of info.accounts) {
                for (let currency of account.caps) {
                    if (currency!=Currency.XRP) {
                        await this.sync (db, provider, Currency.XRP, currency);    
                        await this.sync (db, provider, currency, Currency.XRP);    
                    }
                }
            }
        }    
    }

    public async sync(db: Database, provider: Provider, from: Currency, to: Currency, reload:boolean = false, interval: Interval = Interval.min5) : Promise<number> {
        var collection = Provider[provider] + '_' + Currency[from] + '_' + Currency[to] + '_' + interval
        await db.setCollection(collection)

        var last:Date = reload ? null : await db.last(provider, from, to)
        var rc:number = 0

        if (last!=null) {
            console.log("sync " + collection + " from " + last.toISOString())
        } else {
            await db.clear()
            console.log("clear collection and sync " + collection)            
        }

        var filter:Filter = { 
            start: last,
            limit: 400,
            interval: interval
        } 

        return await this.processExchanges(provider, from, to, filter, (response: ExchangeResponse) => {
            for (let ex of response.exchanges) {
                db.insert(ex)
            }

            return response.exchanges.length
        })

    }

    /*
    public async getExchanges(provider: Provider, from: Currency, to: Currency, filter ?: Filter) : Promise<ExchangeResponse> {
        var result:ExchangeResponse = null    
        
        await this.processExchanges(provider, from, to, filter, (resp: ExchangeResponse) => {

            if (result==null) {
                result = new ExchangeResponse(resp.result, provider, from, to)
            } else {
                result.append(resp.result)
            }

            return resp.exchanges.length 
        })

        return result;
    }*/


    /*
    public async getExchanges(provider: Provider, from: Currency, to: Currency, filter ?: Filter) : Promise<ExchangeResponse> {  

        var info:ProviderInfo = ProviderCaps.get(provider); 

        if (info == null) {
            throw new Error("unknown provider")
        }

        if (from != Currency.XRP && to != Currency.XRP) {
            throw new Error("Exchanges rates only from or to XRP available")
        }

        if (from == Currency.XRP) {
            if (info.caps.indexOf(to) == -1) {
                throw new Error("Provider " + Provider[provider] + " doesn't support " + Currency[to])
            }
        } else if (to == Currency.XRP) {
            if (info.caps.indexOf(from) == -1) {
                throw new Error("Provider " + Provider[provider] + " doesn't support " + Currency[from])
            }
        }

        var params: ParameterSet = new ParameterSet()

        if (filter!=null) {
            if (filter.start!=null)
                params.Set("start", filter.start.toISOString())
            if (filter.end!=null)
                params.Set("end", filter.end.toISOString())
            if (filter.limit!=null)
                params.Set("limit", filter.limit.toString())
            if (filter.interval!=null)
                params.Set("interval", filter.interval.toString())
        }

        var response = await this.client.get<ExchangeResponse>('/v2/exchanges/' + Currency[from] + '/' + Currency[to] + '+' + info.address + params.toString())
        
        if (response.statusCode==200 && response.result.result == "success") {
            let result = new ExchangeResponse(response.result, provider)

            while (response.result.marker!=null) {
                params.Set("marker", response.result.marker); 
                
                try {
                    response = await this.client.get<ExchangeResponse>('/v2/exchanges/' + Currency[from] + '/' + Currency[to] + '+' + info.address + params.toString())
                    if (response.statusCode==200 && response.result.result == "success") {
                        result.append(response.result)
                        console.log("results: " + result.exchanges.length)
                    } else {
                        console.log("error: " + response.statusCode)
                    }
                } catch(exp) {
                    var i= 99;
                }
            }
    
            return result    
        }

        return null
    }
    */



} 