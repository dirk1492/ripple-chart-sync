
export enum Currency {
    USD,
    XRP,
    BTC,
    ETH,
    ETC,
    REP,
    STR,
    LTC,
    EUR,
    CNY,
    XLM,
    DSH,
    JPY,
    DOG,
    ADA,
    RJP
}

export enum Provider {
    Gatehub,
    Bitstamp,
    Bitso,
    GatehubFifth,
    Rippex,
    MrExchange,
    RippleFox,
    RippleChina,
    mrr,
    RCXY,
    RPT7
}

export interface AccountInfo {
    address: string
    caps: Array<Currency>
}

export interface ProviderInfo{
    accounts: Array<AccountInfo>    
}

export var ProviderCaps = new Map<Provider, ProviderInfo>(
    [[
        Provider.Gatehub, {
            accounts: [
                {
                    address: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",   
                    caps: [Currency.XRP, Currency.USD, Currency.EUR]
                }
            ] 
        }
    ],[
        Provider.Bitstamp, {
            accounts: [
                {
                    address: "rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze",   
                    caps: [Currency.XRP, Currency.ETC]
                }
            ] 
        }
    ],[
        Provider.Bitso, {
            accounts: [
                {
                    address: "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn",   
                    caps: [Currency.XRP, Currency.BTC]
                }
            ] 
        }
    ],[
        Provider.GatehubFifth, {
            accounts: [
                {
                    address: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL",   
                    caps: [Currency.XRP, Currency.BTC]
                },{
                    address: "rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze",   
                    caps: [Currency.XRP, Currency.ETC]
                },{
                    address: "rcA8X3TVMST1n3CJeAdGk1RdRCHii7N2h",   
                    caps: [Currency.XRP, Currency.ETH]
                }
            ] 
        }    
    ],[
        Provider.Rippex, {
            accounts: [
                {
                    address: "rKxKhXZCeSDsbkyB8DVgxpjy5AHubFkMFe",   
                    caps: [Currency.XRP, Currency.BTC]
                }
            ] 
        }
    ],[
        Provider.MrExchange, {
            accounts: [
                {
                    address: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS",   
                    caps: [Currency.XRP, Currency.BTC, Currency.ETH, Currency.ETC, Currency.REP, Currency.STR, Currency.LTC]
                }
            ] 
        }
    ],[
        Provider.RippleFox, {
            accounts: [
                {
                    address: "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",   
                    caps: [Currency.XRP, Currency.CNY, Currency.XLM]
                }
            ] 
        }    
    ],[
        Provider.RippleChina, {
            accounts: [
                {
                    address: "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",   
                    caps: [Currency.XRP, Currency.CNY]
                }
            ] 
        }    
    ],[
        Provider.mrr, {
            accounts: [
                {
                    address: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS",   
                    caps: [Currency.XRP, Currency.BTC, Currency.LTC, Currency.DOG, Currency.JPY, Currency.RJP]
                }
            ] 
        }    
    ],[
        Provider.RCXY, {
            accounts: [
                {
                    address: "rcXY84C4g14iFp6taFXjjQGVeHqSCh9RX",   
                    caps: [Currency.XRP, Currency.DSH]
                }
            ] 
        }    
    ],[
        Provider.RPT7, {
            accounts: [
                {
                    address: "rPT74sUcTBTQhkHVD54WGncoqXEAMYbmH7",   
                    caps: [Currency.XRP, Currency.CNY]
                }
            ] 
        }    
    ]
]

    /*
    [[
        Provider.Gatehub, {
            address: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",   
            caps: [Currency.XRP, Currency.USD, Currency.EUR]
        } as ProviderInfo
    ],[
        Provider.Bitstamp, {
            address: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",    
            caps: [Currency.XRP, Currency.USD]
        } as ProviderInfo
    ],[
        Provider.Bitso, {
            address: "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn",   
            caps: [Currency.XRP, Currency.BTC]
        } as ProviderInfo
    ],[
        Provider.GatehubFifth, {
            address: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL",    
            caps: [Currency.XRP, Currency.BTC]
        } as ProviderInfo
    ],[
        Provider.Rippex, {   
            address: "rKxKhXZCeSDsbkyB8DVgxpjy5AHubFkMFe",   
            caps: [Currency.XRP, Currency.BTC]
        } as ProviderInfo
    ],[
        Provider.MrExchange, {   
            address: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS",   
            caps: [Currency.XRP, Currency.BTC, Currency.ETH, Currency.ETC, Currency.REP, Currency.STR, Currency.LTC]
        } as ProviderInfo
    ],[
        Provider.RippleFox, {
            address: "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",   
            caps: [Currency.XRP, Currency.CNY, Currency.XLM]
        } as ProviderInfo
    ],[
        Provider.RippleChina, {
            address: "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",   
            caps: [Currency.XRP, Currency.CNY]
        } as ProviderInfo
    ],[
        Provider.mrr, {
            address: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS",   
            caps: [Currency.XRP, Currency.BTC, Currency.LTC, Currency.DOG, Currency.JPY, Currency.RJP]
        } as ProviderInfo
    ],[
        Provider.RCXY, {
            address: "rcXY84C4g14iFp6taFXjjQGVeHqSCh9RX",   
            caps: [Currency.XRP, Currency.DSH]
        } as ProviderInfo
    ],[
        Provider.RPT7, {
            address: "rPT74sUcTBTQhkHVD54WGncoqXEAMYbmH7",   
            caps: [Currency.XRP, Currency.CNY]
        } as ProviderInfo
    ],[
        Provider.GatehubFifth2, {
            address: "rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze",   
            caps: [Currency.XRP, Currency.ETC]
        } as ProviderInfo
    ],[
        Provider.GatehubFifth3, {
            address: "rcA8X3TVMST1n3CJeAdGk1RdRCHii7N2h",   
            caps: [Currency.XRP, Currency.ETH]
        } as ProviderInfo
    ]] */
);

// rcA8X3TVMST1n3CJeAdGk1RdRCHii7N2h
// rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze
// rDAN8tzydyNfnNf2bfUQY6iR96UbpvNsze ETC
// rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL BTC

//rcXY84C4g14iFp6taFXjjQGVeHqSCh9RX DSH
//rPT74sUcTBTQhkHVD54WGncoqXEAMYbmH7 CNY
//rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS mrr

/*
export var ProviderInfos = {
    Gatehub : 
    {
        address: "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",   
        caps: [Currency.USD, Currency.EUR]
    } as ProviderInfo,
    Bitstamp :
    {
        address: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",    
        caps: [Currency.USD]
    } as ProviderInfo,
    Bitso:
    {
        address: "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn",   
        caps: [Currency.BTC]
    } as ProviderInfo,
    GatehubFifth:
    {
        address: "rchGBxcD1A1C2tdxF6papQYZ8kjRKMYcL",    
        caps: [Currency.BTC, Currency.ETH, Currency.ETC]
    } as ProviderInfo,
    Rippex:
    {   
        address: "rKxKhXZCeSDsbkyB8DVgxpjy5AHubFkMFe",   
        caps: [Currency.BTC]
    } as ProviderInfo,
    MrExchange:
    {   
        address: "rB3gZey7VWHYRqJHLoHDEJXJ2pEPNieKiS",   
        caps: [Currency.BTC, Currency.ETH, Currency.ETC, Currency.REP, Currency.STR, Currency.LTC]
    } as ProviderInfo,
    RippleFox:
    {
        address: "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",   
        caps: [Currency.CNY]
    } as ProviderInfo,
    RippleChina:
    {
        address: "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",   
        caps: [Currency.CNY]
    } as ProviderInfo
};
*/



