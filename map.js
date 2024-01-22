// Width and height of the map
const width = 960;
const height = 600;

// Define path generator
const path = d3.geoPath();

// Create SVG element
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

// Load the data
const educationFile = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyFile = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([d3.json(countyFile), d3.json(educationFile)])
    .then(data => {
        const us = data[0];
        const educationData = data[1];
        ready(us, educationData);
    })
    .catch(err => console.log(err));

function ready(us, educationData) {
    const countyData = topojson.feature(us, us.objects.counties).features;

    // Create a color scale (adjust as needed)
    const colorScale = d3.scaleThreshold()
        .domain([10, 20, 30, 40, 50, 60, 70, 80])
        .range(d3.schemeBlues[9]);

    // Draw counties with tooltip functionality
    svg.append("g")
        .selectAll("path")
        .data(countyData)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => {
            const result = educationData.find(obj => obj.fips === d.id);
            return result ? result.bachelorsOrHigher : 0;
        })
        .attr("fill", d => {
            const result = educationData.find(obj => obj.fips === d.id);
            return result ? colorScale(result.bachelorsOrHigher) : colorScale(0);
        })
        .attr("d", path)
       .on("mouseover", function(event, d) {
    const result = educationData.find(obj => obj.fips === d.id);
    console.log(result); // Check the result in the console
    tooltip.style("opacity", 0.9);
    tooltip.html(result ? 
        `${result['area_name']}, ${result['state']}: ${result.bachelorsOrHigher}%` 
        : 'No data')
        .attr("data-education", result ? result.bachelorsOrHigher : 0)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
})
        .on("mouseout", function() {
    tooltip.style("opacity", 0);
});

    // Add legend
    const legendWidth = 400;
    const legendHeight = 20;
    const legendNumColors = colorScale.range().length;
    const legendColorWidth = legendWidth / legendNumColors;

    // Append legend to the SVG
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(30, ${height - legendHeight - 10})`);

    // Append colored rectangles to the legend
    legend.selectAll("rect")
        .data(colorScale.range())
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * legendColorWidth)
        .attr("y", 0)
        .attr("width", legendColorWidth)
        .attr("height", legendHeight)
        .style("fill", d => d);

    // Append text labels to the legend
    legend.selectAll("text")
        .data(colorScale.domain())
        .enter()
        .append("text")
        .attr("x", (d, i) => i * legendColorWidth)
        .attr("y", -5)
        .text(d => d + "%");
}
