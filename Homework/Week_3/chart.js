/*
data_processing week 2
Tijs Teulings
#10782982
 */

// sets up dimensions of chart
var margin = {top: 20, right: 30, bottom: 30, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// sets up x and y scale
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")

// creates tooltips
var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });

// creates chart to draw
var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(tip);

// determines value for rounding of y axis domain
var domain_round = 500000;

// loads in data from json
d3.json("data.json", function(error, data) {
    if(error) console.log(error);

    // determines x by taking on all dates
    x.domain(data.map(function(d) { return d.value_a; }));

    // determines y domain by rounding up with given value
    y.domain([0, d3.max(data, function(d) {
        return Math.ceil((d.value_b * 0.1 + d.value_b)/domain_round) * domain_round;
    })]);


   // creates bars that consist of bars, tooltips and Amsterdam crosses
    var bars = chart.selectAll("g.bar")
        .data(data)
        .enter().append('g');

    // adds bars themselves
    bars.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.value_a); })
        .attr("y", function(d) { return y(d.value_b); })
        .attr("height", function(d) { return height - y(d.value_b); })
        .attr("width", x.rangeBand())
        .text(function(d) { return d.value_b; })
        // shows tooltips and shift color of bar on mouse over
        .on('mouseover', function(d, i) {
            d3.select(this).style("fill", "#b40022");
            tip.show(d.value_b, i)
        })
        .on('mouseout', function(d) {
            d3.select(this).style("fill", "red");
            tip.hide;
        })

    // adds Amsterdam cross
    bars.append("text")
        .attr("transform", "rotate(-90)")
        .attr("class", "cross")
        .attr("x", function(d) { return -y(d.value_b) - height / 4; })
        .attr("y", function(d) { return x(d.value_a); })
        .attr("dy", "1em")
        .text('x x x')
        // shows shift color of cross on mouse over
        .on('mouseover', function(d, i) {
            d3.select(this).style("fill", "#b40022");
        })
        .on('mouseout', function(d) {
            d3.select(this).style("fill", "white");
            tip.hide;
        });
    
    // adds x-axis
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // adds y-axis with label
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Inwoners")

});
