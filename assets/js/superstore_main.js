queue()
    .defer(d3.csv, "data/Superstore.csv")
    .await(makeGraphs);

function makeGraphs(error, superstoreData) {
    var ndx = crossfilter(superstoreData);

    superstoreData.forEach(function(d) {
        d.profit = parseInt(d.profit);
    })

    show_region_selector(ndx);

    show_percent_of_shipment_type(ndx, "First Class", "#percent-of-FirstClass-shipment");
    show_percent_of_shipment_type(ndx, "Second Class", "#percent-of-SecondClass-shipment");
    show_percent_of_shipment_type(ndx, "Standard Class", "#percent-of-StandardClass-shipment");

    show_category_transactions(ndx);
    show_average_profit(ndx);
    show_segment_distribution(ndx);

    dc.renderAll();
}


// MENU FOR REGION SELECTION

function show_region_selector(ndx) {
    var dim = ndx.dimension(dc.pluck('Region'));
    var group = dim.group();

    dc.selectMenu("#region-selector")
        .dimension(dim)
        .group(group);
}


// PERCENT COUNT FOR SHIPMENT TYPES


function show_percent_of_shipment_type(ndx, shipping, element) {
    var percentageOfShipment = ndx.groupAll().reduce(
        function(p, v) {
            if (v.shipping_mode === shipping) {
                p.count++;
                if(v.segment === "Consumer") {
                    p.are_cons++;
                }
            }
            return p;
        },
        function(p, v) {
            if (v.shipping_mode === shipping) {
                p.count--;
                if(v.segment === "Consumer") {
                    p.are_cons--;
                }
            }
            return p;
        },
        function() {
            return {count: 0, are_cons: 0};    
        },
    );
    
    dc.numberDisplay(element)
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function (d) {
            if (d.count == 0) {
                return 0;
            } else {
                return (d.are_cons / d.count);
            }
        })
        .group(percentageOfShipment)
}


// GRAPH #1 AMOUNT OF TRANSACTIONS PER CATEGORY

function show_category_transactions(ndx) {
    var dim = ndx.dimension(dc.pluck('category'));
    var group = dim.group();

    dc.barChart("#category_transactions")
        .width(450)
        .height(300)
        .margins({ top: 40, right: 50, bottom: 30, left: 40 })
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxis().ticks(15);
}


// GRAPH #2 AVERAGE PROFIT PER TRANSACTION

function show_average_profit(ndx) {
    var dim = ndx.dimension(dc.pluck('category'));

    function add_item(p, v) {
        p.count++;
        p.total += v.profit;
        p.average = p.total / p.count;
        return p;
    }

    function remove_item(p, v) {
        p.count--;
        if (p.count == 0) {
            p.total = 0;
            p.average = 0;
        }
        else {
            p.total -= v.profit;
            p.average = p.total / p.count;
        }
        return p;
    }

    function initialise() {
        return { count: 0, total: 0, average: 0 };
    }

    var averageProfitByCategory = dim.group().reduce(add_item, remove_item, initialise);


    dc.barChart("#average-profit")
        .width(450)
        .height(300)
        .margins({ top: 40, right: 50, bottom: 30, left: 30 })
        .dimension(dim)
        .group(averageProfitByCategory)
        .valueAccessor(function(d) {
            return d.value.average.toFixed(2);
        })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .yAxis().ticks(10);
}


// GRAPH #3 SEGMENT DISTRIBUTION

function show_segment_distribution(ndx) {

    function segmentByCategory(dimension, segment) {
        return dimension.group().reduce(
            function(p, v) {
                p.total++;
                if (v.segment == segment) {
                    p.match++;
                }
                return p;
            },
            function(p, v) {
                p.total--;
                if (v.segment == segment) {
                    p.match--;
                }
                return p;
            },
            function() {
                return { total: 0, match: 0 };
            }
        );
    }

    var dim = ndx.dimension(dc.pluck("category"));
    var consumerByCategory = segmentByCategory(dim, "Consumer");
    var corporateProfByCategory = segmentByCategory(dim, "Corporate");
    var homeofficeByCategory = segmentByCategory(dim, "Home Office");

    dc.barChart("#segment-distribution")
        .width(450)
        .height(270)
        .margins({ top: 60, right: 50, bottom: 30, left: 30 })
        .dimension(dim)
        .group(consumerByCategory, "Consumer")
        .stack(corporateProfByCategory, "Corporate")
        .stack(homeofficeByCategory, "Home Office")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100;
            }
            else {
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(360).y(10).itemHeight(15).gap(10))
        .margins({ top: 10, right: 100, bottom: 30, left: 30 });
}
