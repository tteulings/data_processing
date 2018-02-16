/*
data_processing week 2
Tijs Teulings
#10782982
 */

// number of milliseconds in a day
var ms_per_day = 86400000;

// domain array stores x range in index 0&1 and y range in 2&3
var domain_x = [];
var domain_y = [];

// size of canvas
var canvas_x = 800;
var canvas_y = 600;

// size of header, where labels and ticks reside
var header_x = 100;
var header_y = 100;

// size of the graph
var range_x = canvas_x - 2 * header_x;
var range_y = canvas_y - 2 * header_y;

// coordinates of origin of graph
var start_x = header_x;
var start_y = canvas_y - header_y;

// size of step taken on y-axis
var step_size_y = 50;



data_file = document.getElementById("rawdata").value;

var datapoints = data_transform(data_file);

var coordinates = create_coor(datapoints);

draw(coordinates);

// transforms data from raw data to paired date and temp datapoints
function data_transform(data_file) {

    var data = [];

    // gets data from rawdata file
    var splitted = data_file.split("\n");
    var rows = splitted.slice(1);

    rows.forEach(function(row) {
        var trimmed = row.trim("\t")
        var chopped = trimmed.split(",")

        data.push(chopped)
    });


    var date;
    var temp;
    var datapoints=[];

    var min_temp = undefined;
    var max_temp = undefined;

    var start_date = 0;

    // divides data in dates and temps
    for (var i = 0; i < data.length; i++) {

        // transforms dates to days since starting date
        if (i % 2 === 0) {

            var year = data[i][0].substring(0, 4);
            var month = data[i][0].substring(4, 6);
            var day = data[i][0].substring(6, 8);

            var js_date = new Date(year, month, day);

            var date_in_ms = js_date.getTime();

            if(i === 0) {
                start_date = date_in_ms;
            }

            date = Math.round((date_in_ms - start_date)/ ms_per_day) + 1;

        }
        // stores corresponding temps and dates together
        else {
            temp = Number(data[i][1]);

            datapoints.push([date, temp]);

            // keeps track of max and min temperatures
            if(temp < min_temp || min_temp === undefined) {
                min_temp = temp;
            }
            else if(temp > max_temp || max_temp === undefined) {
                max_temp = temp;
            }
        }

    }


    // store min and max date as domain for x axes
    domain_x[0] = datapoints[0][0];
    domain_x[1] = datapoints[datapoints.length - 1][0];

    // stores max and min temp, rounded off, as domain for y axes
    domain_y[0] = (Math.floor(min_temp / step_size_y) * step_size_y);
    domain_y[1] = (Math.ceil(max_temp / step_size_y) * step_size_y);

    return datapoints;
}


// calculates for given datapoints what coordinates should on canvas
function create_coor(datapoints) {

    var coordinates = [];

    // gives ratio between available pixels and total domain for both axes
    var x_ratio = range_x / (domain_x[1] - domain_x[0]);
    var y_ratio = range_y / (domain_y[1] - domain_y[0]);


    // calculate x and y coordinates for each datapoint
    datapoints.forEach(function (datapoint) {

        var x_coor = (x_ratio * datapoint[0]) + start_x;

        var y_value;
        if (domain_y[0] < 0) {
            y_value = (datapoint[1] - domain_y[0]) * y_ratio
        }
        else {
            y_value = datapoint[1] * y_ratio
        }

        var y_coor = start_y - y_value;

        coordinates.push([x_coor, y_coor]);
    });

    return coordinates;
}


// draws graph based on array of coordinates
function draw(coors) {
    // determines how many pixels the ticks are
    var tick_size = 6;

    // determines amount of ticks needed per axis
    var ticks_x = 11;
    var ticks_y = ((domain_y[1] - domain_y[0]) / step_size_y);

    // determines size of step betweent icks
    var step_px_y = range_y / ticks_y;
    var step_px_x = range_x / ticks_x;

    // store the months and temperature to be used for axis
    var months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"];
    var temps = [];
    for (var i = domain_y[0]; i < domain_y[1] + 1; i = i + step_size_y) {
        temps.push(i);
    }


    // sets up canvas
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');

    ctx.canvas.width = canvas_x;
    ctx.canvas.height = canvas_y;


    ctx.font = '30px calibri';
    ctx.textAlign = 'center';

    // draws title

    ctx.fillText("Gemiddelde temperatuur in De Bilt (NL) in 2017", 0.5 * canvas_x, 0.25 * header_y);


    // sets line width and color for drawing
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";

    // draws both axis
    ctx.beginPath();

    ctx.moveTo(start_x, start_y);
    ctx.lineTo(start_x + range_x, start_y);

    // draws y-axis slight to left for style
    ctx.moveTo(start_x - 2 * tick_size, start_y);
    ctx.lineTo(start_x - 2 * tick_size, start_y - range_y);

    ctx.stroke();


    ctx.save();

    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = "#00dfe0";

    // draw 'zero'-line
    ctx.beginPath();

    // gets coordinate for zero
    var zero = [[0,0]];
    var zero_coor = create_coor(zero);

    // creates light blue dotted line
    for(var i = 0; i < range_x; i = i + tick_size) {
        ctx.moveTo(start_x, zero_coor[0][1]);
        ctx.lineTo(start_x + range_x, zero_coor[0][1]);
    }

    ctx.stroke();

    ctx.restore();



    ctx.font = '15px calibri';

    // determines distance between tick and label
    var label_tick_dist = 4 * tick_size;


    // draws labels with ticks
    ctx.beginPath();
    // draws x-axis ticks and their labels
    for (var i = 0; i < ticks_x + 1; i++) {

        // determines position on x-axis for every step
        var position_x = start_x + step_px_x * i + 0.5;

        // draws ticks of 6 px per axis
        ctx.moveTo(position_x, start_y);
        ctx.lineTo(position_x, start_y + tick_size);

        ctx.stroke();

        // adds months as labels to ticks
        ctx.fillText(months[i], position_x, start_y + label_tick_dist)


    }
    // draws y-axis ticks and their labels
    for (var i = 0; i < ticks_y + 1; i++) {

        // determines position on x-axis for every step
        var position_y = start_y - step_px_y * i + 0.5;

        ctx.moveTo(start_x - 2 * tick_size, position_y);
        ctx.lineTo(start_x - 3 * tick_size, position_y);

        ctx.stroke();

        ctx.fillText(temps[i], start_x - 2 * tick_size - label_tick_dist, position_y)
    }

    ctx.font = '15px calibri';

    // draws y-axis label, rotated 90 degrees
    ctx.save();

    ctx.translate(0.25 * header_y, 0.5 * canvas_y);
    ctx.rotate(-0.5*Math.PI);
    ctx.fillText("Temperatuur in 0.1 graden Celsius", 0, 0);

    ctx.restore();

    // draws source notice
    ctx.fillText("Bron: KNMI, http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi",
        0.5 * canvas_x, canvas_y - 0.25 * header_y);


    ctx.strokeStyle = "#00cb15";

    // draws graph in green
    ctx.beginPath();

    ctx.moveTo(coors[0][0], coors[0][1]);
    coors.forEach(function (coor) {
        ctx.lineTo(coor[0], coor[1]);
    });

    ctx.stroke();


}