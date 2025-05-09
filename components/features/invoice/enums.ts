
export enum InvoiceType {
    Satis = "Satış",
    Alis = "Alış",
}


export enum TransactionType{
    Ihracat = "İhracat",
     Ithalat = "İthalat",
     YurtIci = "Yurt İçi"
}

export enum CurrencyType {
    TRY = "TRY",
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
}
export const GetTypeOptions = (Type: object, filter: string[] = [], include: boolean = false): { label: string, value: string }[] => {
    return Object.entries(Type)
        .filter(([key, value]) => include ? filter.includes(value as string) : !filter.includes(value as string))
        .map(([key, value]) => ({
            label: key,
            value: value as string
        }));
}
