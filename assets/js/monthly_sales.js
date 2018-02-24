(function() {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 1100;
    const height = 250;

    d3.csv('data/Monthly_Sales.csv', (error, data) => {
        if (error) {
            return console.error(error);
        }

        buildBar(data);
    });
    
// BUILDING BAR CHART    

    function buildBar(ds) {
        const barTooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        const formatRatio = d3.format('%');

        const x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        const y = d3.scale.linear()
        
            .range([height, 0]);

        const xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        const yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(d3.format('s'))
            .ticks(6);

        const minProfit = d3.min(ds, d => d.profit);
        const maxProfit = d3.max(ds, d => d.profit);

        const color = d3.scale.quantize()
            .domain([minProfit, maxProfit])
            .range(['rgb(0,128,0)', '#166a96']);   // COLOR BARS

        const chart = d3.select('#barChart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        d3.csv('data/Monthly_Sales.csv', (error, data) => {
            x.domain(data.map(d => d.month));
            y.domain([0, d3.max(data, d => d.sales)]);
            

            chart.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0, ${height})`)
                .call(xAxis);

            chart.append('g')
                .attr('class', 'y-axis')
                .call(yAxis);

            chart.selectAll('#barChart')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                
                .attr('x', d => x(d.month))
                .attr('y', d => y(d.sales))
                .attr('height', d => height - y(d.sales))
                .attr('width', x.rangeBand())
                .style('fill', d => color(d.profit))
                .on('mouseover', d => {
                    barTooltip.transition()
                        .duration(500)
                        .style('opacity', .9);

                    let tip = [
                        `<strong>Monthly Sales:</strong> $${formatSales(d.sales)}<br/>`,
                        `<strong>Monthly Profit:</strong> $${formatSales(d.profit)}<br/>`,
                        `<strong>Sales / Profit:</strong> ${formatRatio(d.profit / d.sales)}<br/>`
                    ].join('');

                    barTooltip.html(tip)
                        .style('left', (d3.event.pageX) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on('mouseout', function (d) {
                    barTooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        });
    }

})();