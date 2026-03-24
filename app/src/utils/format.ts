export function formatCurrency(
    amount: number,
    currency: string = "NGN",
): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
