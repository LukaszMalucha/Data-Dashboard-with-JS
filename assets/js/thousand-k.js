function formatSales(d) {

    const prefix = d3.formatPrefix(d);
    const num = prefix.scale(d).toFixed();
    return num + prefix.symbol;
}

// Transforms thousands into k