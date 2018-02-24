(function() {
    const margin = { top: 0, right: 30, bottom: 0, left: 40 };
    const width = 500;
    const height = 400;

    const projection = d3.geo.albersUsa()
        .translate([width / 2 + 10, (height / 2) - 80])
        .scale([height + 50]);

    const path = d3.geo.path()
        .projection(projection);

    const color = d3.scale.linear()
        .range(['#bce4d8', '#57abbe']);

    // SVG 
    const svg = d3.select('#USMap')
        .append('svg')
        .attr('width', width)
        .attr('height', height);



    d3.csv('data/Annual_by_State.csv', data => {


        color.domain([0, d3.max(data, d => d.sales)]);

        //  LOAD US.JSON
        d3.json('data/us.json', function(json) {

            data = data.map(stateSalesDataItem => {
                const stateJson = json.features.find(item => item.properties.NAME === stateSalesDataItem.state);
                stateJson && (stateJson.properties.value = parseFloat(stateSalesDataItem.sales));
            });

            // TOOLTIP
            const mapTooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip')
                .attr('id', 'mapTooltip')
                .style('opacity', 0);

            // MAP
            svg.selectAll('path')
                .data(json.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('fill', d => {
                    const value = d.properties.value;

                    return value ?
                        color(value) :
                        '#fff';
                })
                .on('mouseover', function(d) {
                    mapTooltip.transition()
                        .duration(500)
                        .style('opacity', .9);

                    let tip = [
                        `<strong>${d.properties.NAME}</strong><br/>`,
                        `<strong>Sales:</strong> $${formatSales(d.properties.value)}<br/>`
                    ].join('');

                    mapTooltip.html(tip)
                        .style('left', (d3.event.pageX) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on('mouseout', function(d) {
                    mapTooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });


        });
    });
})()
