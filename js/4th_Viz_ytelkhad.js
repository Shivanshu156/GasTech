let svg_map_fourth_viz;
let g_map_fourth_viz;
let allGPSData_fourth_viz = [];
const margin_fourth_viz = { top: 0, right: 0, bottom: 0, left: -200 };
const mapWidth_fourth_viz = 1100 - margin_fourth_viz.left - margin_fourth_viz.right;
const mapHeight_fourth_viz = 550 - margin_fourth_viz.top - margin_fourth_viz.bottom;
let projection_fourth_viz;
let currentDayData_fourth_viz = []; // Data for the selected date
let colorScale_fourth_viz;


document.addEventListener('DOMContentLoaded', function () {
    // Create SVG for the map
    svg_map_fourth_viz = d3.select("#map-container")
        .append("svg")
        .attr("width", mapWidth_fourth_viz + margin_fourth_viz.left + margin_fourth_viz.right)
        .attr("height", mapHeight_fourth_viz + margin_fourth_viz.top + margin_fourth_viz.bottom);

    g_map_fourth_viz = svg_map_fourth_viz.append("g").attr("transform", `translate(${margin_fourth_viz.left}, ${margin_fourth_viz.top})`);

    // Define the projection
    projection_fourth_viz = d3.geoMercator() // Adjust as needed
        .scale(1) // Adjust scale
        .translate([0, 0]); // Adjust translation

    // Define the path generator
    var path_fourth_viz = d3.geoPath()
        .projection(projection_fourth_viz);

    // Load and process TopoJSON
    d3.json("data/Abila.json").then(function (data) {
        var geojson_fourth_viz = topojson.feature(data, data.objects.Abila1);

        // Fit the projection
        projection_fourth_viz.fitSize([mapWidth_fourth_viz, mapHeight_fourth_viz], geojson_fourth_viz);

        // Draw the paths
        g_map_fourth_viz.selectAll(".pathAbila")
            .data(geojson_fourth_viz.features)
            .enter().append("path")
            .attr("class", "pathAbila")
            .attr("d", path_fourth_viz)
            .attr("fill", "none")
            .attr("stroke-width", "0.5px")
            .attr("stroke", "#FF0000");

        var tooltip_fourth_viz = d3.select("body").append("div")
            .attr("class", "tooltip_fourth")
            .style("opacity", 0);

        // Add event listeners to the SVG or paths
        g_map_fourth_viz.selectAll(".pathAbila")
            .on("mousemove", function (event, d) {
                // Get mouse position
                var [x, y] = d3.pointer(event, this);

                // Convert mouse position to geographic coordinates
                var coords = projection_fourth_viz.invert([x, y]);

                // Update and show tooltip
                tooltip_fourth_viz.style("opacity", .9)
                    .html("Lat: " + coords[1].toFixed(8) + "<br/>Lon: " + coords[0].toFixed(8))
                    .style("left", (event.pageX + 10) + "px") // Offset the tooltip a bit from the cursor
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function (d) {
                tooltip_fourth_viz.style("opacity", 0);
            })
            .on("click", function (event, d) {
                var [x, y] = d3.pointer(event, this);

                // Convert mouse position to geographic coordinates
                var coords = projection_fourth_viz.invert([x, y]);

                var tooltipText_fourth_viz = coords[1].toFixed(8) + "," + coords[0].toFixed(8);

                navigator.clipboard.writeText(tooltipText_fourth_viz).then(function () {
                    console.log('Tooltip text copied to clipboard:', tooltipText_fourth_viz);
                }).catch(function (err) {
                    console.error('Unable to copy tooltip text to clipboard', err);
                });
            });

        drawcaridpoints_fourth_viz();

        // Event listeners for date picker and time slider
        const datePicker_fourth_viz = document.getElementById('datePicker');
        const timeSlider_fourth_viz = document.getElementById('timeSlider');

        datePicker_fourth_viz.addEventListener('change', () => {
            filterDataForSelectedDate_fourth_viz(datePicker_fourth_viz.value);
            updateCarPositions_fourth_viz(timeSlider_fourth_viz.value);
        });

        timeSlider_fourth_viz.addEventListener('input', () => {
            updateCarPositions_fourth_viz(timeSlider_fourth_viz.value);
        });

        const playButton_fourth_viz = document.getElementById('playButton');
        const currentTimeDisplay_fourth_viz = document.getElementById('currentTimeDisplay');
        let playInterval_fourth_viz;

        timeSlider_fourth_viz.addEventListener('input', () => {
            const currentTime_fourth_viz = parseFloat(timeSlider_fourth_viz.value);
            updateCurrentTimeDisplay_fourth_viz(currentTime_fourth_viz);
            updateCarPositions_fourth_viz(currentTime_fourth_viz);
        });

        playButton_fourth_viz.addEventListener('click', () => {
            if (playButton_fourth_viz.textContent === 'Play') {
                playButton_fourth_viz.textContent = 'Pause';
                playInterval_fourth_viz = setInterval(() => {
                    let currentTime_fourth_viz = parseFloat(timeSlider_fourth_viz.value);
                    if (currentTime_fourth_viz >= parseFloat(timeSlider_fourth_viz.max)) {
                        clearInterval(playInterval_fourth_viz);
                        playButton_fourth_viz.textContent = 'Play';
                    } else {
                        currentTime_fourth_viz += parseFloat(timeSlider_fourth_viz.step);
                        timeSlider_fourth_viz.value = currentTime_fourth_viz;
                        updateCurrentTimeDisplay_fourth_viz(currentTime_fourth_viz);
                        updateCarPositions_fourth_viz(currentTime_fourth_viz);
                    }
                }, 300); // Adjust time interval as needed
            } else {
                clearInterval(playInterval_fourth_viz);
                playButton_fourth_viz.textContent = 'Play';
            }
        });

    });

});
function filterDataForSelectedDate_fourth_viz(selectedDate_fourth_viz) {
    currentDayData_fourth_viz = allGPSData_fourth_viz.filter(d => {
        const dateStr_fourth_viz = d.timestamp.toISOString().split('T')[0];
        return dateStr_fourth_viz === selectedDate_fourth_viz;
    });
}

function updateCarPositions_fourth_viz(selectedTime_fourth_viz) {
    const timeWindowStart_fourth_viz = selectedTime_fourth_viz - 0.5;
    const latestPositions_fourth_viz = new Map();

    currentDayData_fourth_viz.forEach(d => {
        const timeDecimal_fourth_viz = d.timestamp.getHours() + d.timestamp.getMinutes() / 60;
        if (timeDecimal_fourth_viz <= selectedTime_fourth_viz && timeDecimal_fourth_viz >= timeWindowStart_fourth_viz) {
            latestPositions_fourth_viz.set(d.id, d); // Update the latest position for each carId
        }
    });

    const filteredData_fourth_viz = Array.from(latestPositions_fourth_viz.values()); // Convert to an array

    const simulation_fourth_viz = d3.forceSimulation(filteredData_fourth_viz)
        .force('x', d3.forceX(d => projection_fourth_viz([d.long, d.lat])[0]).strength(6))
        .force('y', d3.forceY(d => projection_fourth_viz([d.long, d.lat])[1]).strength(6))
        .force('collide', d3.forceCollide(10)) // Adjust the radius to match circle radius + desired padding
        .stop();

    // Run the simulation
    for (let i = 0; i < 120; i++) simulation_fourth_viz.tick();

    const carPoints_fourth_viz = g_map_fourth_viz.selectAll(".car-point")
        .data(filteredData_fourth_viz, d => d.id)
        .join("circle")
        .attr("class", "car-point")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 6)
        .attr("fill", d => colorScale_fourth_viz(d.id))
        .attr("stroke", "black")  // Set the color of the boundary
        .attr("stroke-width", 1.5);  // Set the width of the boundary

    // Add tooltip functionality
    const tooltip_fourth_viz = d3.select('.tooltip_fourth');

    carPoints_fourth_viz.on('mouseover', function (event, d) {
        tooltip_fourth_viz.style('opacity', 0.9)
            .html("Car ID: " + d.id + "<br>Owner: " + d.owner + "<br>Time: " + d.timestamp.toLocaleTimeString())
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
    });

    carPoints_fourth_viz.on('mouseout', function () {
        tooltip_fourth_viz.style('opacity', 0);
    });

    drawRelationshipCircles_fourth_viz(filteredData_fourth_viz);
}

function drawcaridpoints_fourth_viz() {
    // Load the GPS data and car assignment data
    Promise.all([
        d3.csv("data/gps.csv"),
        d3.csv("data/car-assignments.csv")
    ]).then(function (data) {
        let gpsData_fourth_viz = data[0];
        let carAssignmentData_fourth_viz = data[1];

        // Create a map of car assignments
        let carAssignments_fourth_viz = new Map();
        carAssignmentData_fourth_viz.forEach(d => {
            carAssignments_fourth_viz.set(d.CarID, d.LastName + ", " + d.FirstName);
        });

        // Merge GPS data with car assignments
        allGPSData_fourth_viz = gpsData_fourth_viz.map(d => {
            d.lat = +d.lat;
            d.long = +d.long;
            d.timestamp = new Date(d.Timestamp);
            d.owner = carAssignments_fourth_viz.get(d.id) || "Unknown";
            return d;
        });

        const my40Colors_fourth_viz = [
            "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
            "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
            "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
            "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
            "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
            "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
            "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b",
            "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
        ];


        const carIDs_fourth_viz = Array.from(new Set(allGPSData_fourth_viz.map(d => d.id)));
        colorScale_fourth_viz = d3.scaleOrdinal(my40Colors_fourth_viz).domain(carIDs_fourth_viz);

        // Check the domain right before creating the legend
        console.log("Color scale domain before legend creation:", colorScale_fourth_viz.domain());

        // Initial update of the map with default date and time
        const defaultDate_fourth_viz = "2014-01-06"; // Adjust as needed
        filterDataForSelectedDate_fourth_viz(defaultDate_fourth_viz);
        updateCarPositions_fourth_viz(12.21); // Adjust as needed
    });
}

function updateCurrentTimeDisplay_fourth_viz(currentTime_fourth_viz) {
    const hours_fourth_viz = Math.floor(currentTime_fourth_viz);
    const minutes_fourth_viz = Math.floor((currentTime_fourth_viz - hours_fourth_viz) * 60);
    const timeString_fourth_viz = hours_fourth_viz.toString().padStart(2, '0') + ':' + minutes_fourth_viz.toString().padStart(2, '0');
    document.getElementById('currentTimeDisplay').textContent = timeString_fourth_viz;
}

function drawRelationshipCircles_fourth_viz(data_fourth_viz) {
    const relationshipThreshold_fourth_viz = 20; // Threshold in pixels for considering a relationship
    const relationships_fourth_viz = [];

    data_fourth_viz.forEach((d, i) => {
        for (let j = i + 1; j < data_fourth_viz.length; j++) {
            const d2 = data_fourth_viz[j];
            const dist_fourth_viz = distanceBetweenPoints_fourth_viz(projection_fourth_viz([d.long, d.lat]), projection_fourth_viz([d2.long, d2.lat]));

            if (dist_fourth_viz < relationshipThreshold_fourth_viz) {
                relationships_fourth_viz.push({
                    x: (projection_fourth_viz([d.long, d.lat])[0] + projection_fourth_viz([d2.long, d2.lat])[0]) / 2,
                    y: (projection_fourth_viz([d.long, d.lat])[1] + projection_fourth_viz([d2.long, d2.lat])[1]) / 2,
                    r: 40
                });
            }
        }
    });

    // Draw relationship circles
    g_map_fourth_viz.selectAll(".relationship-circle")
        .data(relationships_fourth_viz)
        .join("circle")
        .attr("class", "relationship-circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-dasharray", "5,5");
}

function distanceBetweenPoints_fourth_viz(point1_fourth_viz, point2_fourth_viz) {
    // Calculate the Euclidean distance between two points
    return Math.sqrt(Math.pow(point1_fourth_viz[0] - point2_fourth_viz[0], 2) + Math.pow(point1_fourth_viz[1] - point2_fourth_viz[1], 2));
}
