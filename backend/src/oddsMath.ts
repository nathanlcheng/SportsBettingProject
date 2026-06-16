export function oddsToDecimal(odds:number): number{
    return odds>0? 1+odds/100 : 1+100/Math.abs(odds);
}

/** Really a decimal */
export function decimalToPercent(decimal:number): number{
    return 1/decimal;
}

export function noVig(prob: number, prob2: number): {actualVal:number; actualVal2:number}{
    const total = prob +prob2;
    return {actualVal: prob/total, actualVal2: prob2/total};
}

export function realExpectedValue(noVigValue: number, decimalOdds: number): number{
    return noVigValue* (decimalOdds-1)-(1-noVigValue);
}

export function writingNumber(odds:number): string{
    return odds>0? '+${odds}' : '-${odds}';
}

export function valueCategory(value: number): string{
    if(value>0.3) return "positive";
    if(value>-0.3) return "neutral";
    return "negative";
}