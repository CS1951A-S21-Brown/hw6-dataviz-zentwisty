// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 300};

const NUM_TOP = 10

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 1.5) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = (MAX_WIDTH / 1.5) - 10, graph_3_height = 275;

let svg = d3.select("graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x axis is the rank
let x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

// y axis is the game
let y = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

// Set up reference to count SVG group
let rankRef = svg.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label = svg.append("g");

// Set up x axis label
svg.append("text")
    // bottom middle edge of the graph
    .attr("transform", "translate("+(graph_1_width-margin.left-margin.right)/2+","+(graph_1_height-margin.top-10)+")")       
    .style("text-anchor", "middle")
    .text("Total Lifetime Global Sales (in millions)");

// Set up y-axis label
let y_axis_text = svg.append("text")
    // center left edge of the graph
    .style("text-anchor", "middle")
    .attr("transform", "rotate(270)translate("+(-85)+","+(-270)+")");

// Set up chart title
let title = svg.append("text")
    // top middle edge of the graph
    .attr("transform", "translate("+(graph_1_width-margin.left-margin.right)/2+","+(-10)+")")
    .style("text-anchor", "middle")
    .style("font-size", 15);

// helper fuction that returns "Name (Platform)""
function getNamePlatform(d) {
    return d.Name + " (" + d.Platform + ")"
}

/**
 * Sets the data on the barplot according the year
 */
 function setData(year=2006) {
    // Load the video games CSV file into D3
    d3.csv('data/video_games.csv').then(function(data) {
        // Clean and strip desired amount of data for barplot
        data = cleanData(data, year, NUM_TOP);

        // Update the x axis domain with the max Global_Sales of the provided data
        x.domain([0, d3.max(data, function(d) {return parseFloat(d.Global_Sales)} )])

        // Update the y axis domains with the desired attribute
        y.domain(data.map(getNamePlatform));

        // Render y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));
        
        // Define color scale
        let color = d3.scaleOrdinal()
            .domain(data.map(getNamePlatform))
            .range(d3.quantize(d3.interpolateHcl("#e30b1d", "#38014a"), NUM_TOP));

        /*
            This next line does the following:
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
         */
        let bars = svg.selectAll("rect").data(data);

        /*
            This next section of code does the following:
                1. Take each selection and append a desired element in the DOM
                2. Merge bars with previously rendered elements
                3. For each data point, apply styling attributes to each element

            Remember to use the attr parameter to get the desired attribute for each data point
            when rendering.
         */
        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(d) { return color(getNamePlatform(d)) })
            .transition()
            .duration(500)
            .attr("x", x(0))
            .attr("y", function(d) { return y(getNamePlatform(d)) })
            .attr("width", function(d) { return x(parseFloat(d.Global_Sales)) } )
            .attr("height",  y.bandwidth());        

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
         */
        let ranks = rankRef.selectAll("text").data(data);

        // Render the text elements on the DOM
        ranks.enter()
            .append("text")
            .merge(ranks)
            .transition()
            .duration(500)
            .attr("x", function(d) { return x(parseFloat(d.Global_Sales)) + 4 } )       
            // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
            .attr("y", function(d) { return y(getNamePlatform(d)) + 12 } )       
            // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
            .style("text-anchor", "start")
            .text(function(d) { return parseFloat(d.Global_Sales) });           
            // HINT: Get the count of the artist

        y_axis_text.text("Videogames Released in "+year);
        title.text("Top "+NUM_TOP+" Videogames Released in "+year);

        // Remove elements not in use if fewer groups in new dataset
        bars.exit().remove();
        ranks.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData(data, year=2006, numExamples=10) {
    // get the datapoints for a certain year (they will already be sorted by rank)
    return data.filter(function(d) {return d.Year == year} ).slice(0,numExamples)
}

// On page load, render the barplot with the artist data
setData(2006);


let genres = [];

function makePie(region) {
    let radius = Math.min(graph_2_width, graph_2_height) / 2 - 20

    let svg2 = d3.select("graph2")
        .append("svg")
        .attr("width", graph_2_width)
        .attr("height", graph_2_height)
        .append("g")
        .attr("transform", "translate(" + graph_2_width / 2 + "," + graph_2_height / 2 + ")");

    // NA_Sales,EU_Sales,JP_Sales,Other_Sales(,Global_Sales)
    let countrytext = "other countries"
    if (region == "NA_Sales") {
        countrytext = "North America"
    }
    if (region == "EU_Sales") {
        countrytext = "Europe"
    }
    if (region == "JP_Sales") {
        countrytext = "Japan"
    }

    // Set up chart title
    svg2.append("text")
    // top middle edge of the graph
        .append("tspan")
        .style("text-anchor", "middle")
        .style("font-size", 15)
        .text(countrytext)

    // Load the video games CSV file into D3
    d3.csv('data/video_games.csv').then(function(data) {
        // Clean and strip data for pie
        pieData = getPieData(data, region);
        genres = Object.keys(pieData)
        num_genres = genres.length
        console.assert(num_genres == 12)

        genres = genres.sort(function(genre1, genre2) {return pieData[genre2] - pieData[genre1] })

        // set the color scale
        let color = d3.scaleOrdinal()
            .domain(genres)
            .range(d3.quantize(d3.interpolateHcl("#e30b1d", "#38014a"), num_genres));

        // Set up data on the pie chart
        let pie = d3.pie()
            .value(function(d) {return d.value})
        let data_ready = pie(d3.entries(pieData))

        let arc = d3.arc()
            .innerRadius(radius*0.5)
            .outerRadius(radius)

        // Make pie chart
        let slices = svg2.selectAll('dummy')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "1px")

        svg2.selectAll('dummy')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d) {return d.data.key})
        .attr("transform", function(d) {return "translate("+arc.centroid(d)+")"} )
        .style("text-anchor", "middle")
        .style("font-size", 10)
        .style("fill", "white")

        let tooltip = svg2.append("text")
        // top middle edge of the graph
            .attr("transform", "translate("+(0)+","+(graph_2_height/2 - 10)+")")
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .style("visibility", "hidden")

        slices.on('mouseover', function(d, i){
            // show tooltip
            tooltip.style("visibility", "visible")
            tooltip.text(d.data.key+" games in "+countrytext+" have sold "+Math.round(d.value)+" million copies!")
            slices.style("stroke-width", "4px")
          })
          .on('mouseout', function(d, i){
            // hide tooltip
            tooltip.style("visibility", "hidden")
            slices.style("stroke-width", "1px")
          });
    });
}

function getPieData(data, region) {
    // output: {genre1: # of sales, genre2: # of sales, ...}
    pieData = {}
    function addDatapoint(d) {
        keys = Object.keys(pieData)
        if (keys.includes(d.Genre)) {
            pieData[d.Genre] += parseFloat(d[region])
        } else {
            pieData[d.Genre] = parseFloat(d[region])
        }
    }
    data.forEach(addDatapoint)
    return pieData
}

makePie("NA_Sales")
makePie("EU_Sales")
makePie("JP_Sales")
makePie("Other_Sales")


// 0: "Action"
// 1: "Sports"
// 2: "Shooter"
// 3: "Platform"
// 4: "Misc"
// 5: "Racing"
// 6: "Role-Playing"
// 7: "Fighting"
// 8: "Simulation"
// 9: "Puzzle"
// 10: "Adventure"
// 11: "Strategy"
// genres array consists of those

let svg3 = d3.select("graph3")
    .append("svg")
    .attr("width", graph_3_width)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// x axis is the rank
let x3 = d3.scaleLinear()
    .range([0, graph_3_width - margin.left - margin.right]);

// y axis is the game
let y3 = d3.scaleBand()
    .range([0, graph_3_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

// Set up reference to count SVG group
let rankRef3 = svg3.append("g");
// Set up reference to y axis label to update text in setData
let y_axis_label3 = svg3.append("g");

// Set up x axis label
svg3.append("text")
    // bottom middle edge of the graph
    .attr("transform", "translate("+(graph_3_width-margin.left-margin.right)/2+","+(graph_3_height-margin.top-10)+")")       
    .style("text-anchor", "middle")
    .text("Total Lifetime Global Sales (in millions)");

// Set up y-axis label
let y_axis_text3 = svg3.append("text")
    // center left edge of the graph
    .style("text-anchor", "middle")
    .attr("transform", "rotate(270)translate("+(-85)+","+(-200)+")");

// Set up chart title
let title3 = svg3.append("text")
    // top middle edge of the graph
    .attr("transform", "translate("+(graph_3_width-margin.left-margin.right)/2+","+(-10)+")")
    .style("text-anchor", "middle")
    .style("font-size", 15);

/**
 * Sets the data on the barplot according the index in the genre array
 */
 function setData3(index=0) {
    // Load the video games CSV file into D3
    d3.csv('data/video_games.csv').then(function(data) {
        // Clean and strip desired amount of data for barplot
        data = cleanData3(data, genres[index]);

        publishers = Object.keys(data)
        publishers = publishers.sort(function(pub1, pub2) {return data[pub2] - data[pub1] })
        publishers = publishers.slice(0,NUM_TOP)

        // Update the x axis domain with the max of the provided data
        x3.domain([0, data[publishers[0]] ])
        
        // Update the y axis domains with the desired attribute
        y3.domain(publishers);

        // Render y-axis label
        y_axis_label3.call(d3.axisLeft(y3).tickSize(0).tickPadding(10));
        
        // Define color scale
        let color3 = d3.scaleOrdinal()
            .domain(publishers)
            .range(d3.quantize(d3.interpolateHcl("#e30b1d", "#38014a"), NUM_TOP));

        /*
            This next line does the following:
                1. Select all desired elements in the DOM
                2. Count and parse the data values
                3. Create new, data-bound elements for each data value
         */
        let bars3 = svg3.selectAll("rect").data(publishers);

        /*
            This next section of code does the following:
                1. Take each selection and append a desired element in the DOM
                2. Merge bars with previously rendered elements
                3. For each data point, apply styling attributes to each element

            Remember to use the attr parameter to get the desired attribute for each data point
            when rendering.
         */
        bars3.enter()
            .append("rect")
            .merge(bars3)
            .attr("fill", function(d) { return color3(d) })
            .transition()
            .duration(500)
            .attr("x", x3(0))
            .attr("y", function(d) { return y3(d) })
            .attr("width", function(d) { return x3(data[d]) } )
            .attr("height",  y3.bandwidth());

        /*
            In lieu of x-axis labels, we are going to display the count of the artist next to its bar on the
            bar plot. We will be creating these in the same manner as the bars.
         */
        let ranks3 = rankRef3.selectAll("text").data(publishers);

        // Render the text elements on the DOM
        ranks3.enter()
            .append("text")
            .merge(ranks3)
            .transition()
            .duration(500)
            .attr("x", function(d) { return x3(data[d]) + 4 } )       
            .attr("y", function(d) { return y3(d) + 12 } )       
            .style("text-anchor", "start")
            .text(function(d) { return Math.round(data[d]) });           

        y_axis_text3.text("Developers of "+genres[index]+" Games");
        title3.text("Top "+NUM_TOP+" Developers of "+genres[index]+" Videogames");

        // Remove elements not in use if fewer groups in new dataset
        bars3.exit().remove();
        ranks3.exit().remove();
    });
}

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */
function cleanData3(data, genre) {
    // get the datapoints for a certain year (they will already be sorted by rank)

    // return data.filter(function(d) {return d.Year == year} ).slice(0,numExamples)

    // output: {Publisher1: # of sales in specified genre, Publisher2: # of sales, ...}
    data = data.filter(function(d) {return d.Genre == genre} )
    barData = {}
    function addDatapoint(d) {
        keys = Object.keys(barData)
        if (keys.includes(d.Publisher)) {
            barData[d.Publisher] += parseFloat(d.Global_Sales)
        } else {
            barData[d.Publisher] = parseFloat(d.Global_Sales)
        }
    }
    data.forEach(addDatapoint)
    return barData
}

// On page load, render the barplot with the artist data
setData3(0)

console.log("loaded!");
