// Load data from the CSV file
function createGanttChart(){
    d3.csv('data/cc_data.csv').then(function(data) {
        data.forEach(function(d) {
            d.timestamp = new Date(d.timestamp);
        });
    
        const chosenDate = new Date('2014-01-7');
        console.log(chosenDate.toDateString())
        const selectedData = data.filter(function(d) {
            console.log(d.timestamp.toDateString())
            
            return d.timestamp.toDateString() === chosenDate.toDateString();
        });
        function getLocationCountForHour(selectedData, location, hour) {
        
            const filteredData = selectedData.filter(function(d) {
                return d.location === location && Math.floor(d.timestamp.getHours()) === hour;
            });
        
            return filteredData.length;
        }
        
        console.log(getLocationCountForHour(selectedData, 'Coffee Cameleon', 8));
    
    
        const timestampCountMap = new Map();
    
        const newData = selectedData.map(function(d) {
            const timestampKey = d.timestamp.toISOString();
            const count = getLocationCountForHour(selectedData, d.location, Math.floor(d.timestamp.getHours()));
            timestampCountMap.set(timestampKey, count);
            return { ...d, ccHourCount: count };
        });
        console.log(newData);
        console.log(timestampCountMap);
    
        const colorScale = d3.scaleSequential(function(t) {
            return t < 0.66 ? d3.interpolateBlues(2 * t) : d3.interpolateReds(2 * (t-0.25));
        }).domain([0, 15]);
    
    
        // Create an SVG element for the legend
    const legendWidth = 200;
    const legendHeight = 50;
    const legendSvg = d3.select('.box_1').append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .append('g')
        .attr('transform', 'translate(10, 20)'); // Adjust the position as needed
    
    // Create a linear gradient for the legend
    const gradient = legendSvg.append('linearGradient')
        .attr('id', 'colorGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
    
    // Add color stops to the gradient
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('style', `stop-color:${colorScale(0)};stop-opacity:1`);
    gradient.append('stop')
            .attr('offset', '67%')
            .attr('style', `stop-color:${colorScale(9)};stop-opacity:1`);
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('style', `stop-color:${colorScale(20)};stop-opacity:1`);
    
    // Create a rectangle to display the gradient
    legendSvg.append('rect')
        .attr('width', legendWidth - 20) // Adjust the width as needed
        .attr('height', legendHeight)
        .style('fill', 'url(#colorGradient)');
    
    // Add text labels for the legend
    legendSvg.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .text('0');
    
    legendSvg.append('text')
        .attr('x', legendWidth - 75)
        .attr('y', -5)
        .text('10');
    legendSvg.append('text')
        .attr('x', legendWidth - 35)
        .attr('y', -5)
        .text('15');
    
        const margin = { top: 100, right: 30, bottom: 30, left: 200 };
        const width = 800 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;
    
        // Create the SVG element
        const svg = d3.select('.box_1').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0,24])
            .range([0, width]);
    
        const yScale = d3.scaleBand()
            .domain(selectedData.map(d => d.location))
            .range([height, 0])
            .padding(0.1);
    
        const tooltip = d3.select('.box_1').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        svg.selectAll('.bar')
            .data(newData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => {console.log(d.timestamp.getHours());
                return xScale(d.timestamp.getHours())})
            .attr('y', d => yScale(d.location))
            .attr('width', d => width/24)
            .attr('height', yScale.bandwidth())
            .attr('fill', d => {//console.log(d.ccHourCount);
                return colorScale(d.ccHourCount)})
            .on('mouseover', function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip.html(`Location: ${d.location}<br>Time: ${d.timestamp.getHours()} - ${d.timestamp.getHours()+1} Hours<br>Number of Transactions: ${d.ccHourCount}`)
                    .style('left', (event.pageX + 10) + 'px') 
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mousemove', function (event, d) {
                tooltip.style('left', (event.pageX + 10) + 'px') 
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    
        svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale));
    
        svg.append('g')
            .call(d3.axisLeft(yScale));
    
        svg.append('text')
            .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.top + 20) + ')')
            .style('text-anchor', 'middle')
            .text('Time of Day');
    
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Location');
    
        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 - (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .text('Location vs Time of Day Gantt Chart - ' + chosenDate.toDateString());
    });
}


function createLineChart() {

    // Load cc_data and loyalty_data CSV files
    Promise.all([
        d3.csv('data/cc_loyalty_combined.csv'),
        d3.csv('data/merged_data.csv'), // Load merged_data.csv
    ]).then(([loyaltyCCData, vehicleData]) => {

        // Specify the desired date
        const desiredDate = '2014-01-09';

        // Parse timestamps and extract hours for main loyaltyCCData
        const parseDate = d3.timeParse('%Y-%m-%d %H:%M:%S');
        loyaltyCCData.forEach(d => d.timestamp_x = parseDate(d.timestamp_x));
        loyaltyCCData.forEach(d => d.hour = d.timestamp_x.getHours());

        const loyaltyCCFilteredData = loyaltyCCData.filter(d => d.timestamp_x.toISOString().split('T')[0] === desiredDate);

        const hourGroupedData = d3.group(loyaltyCCFilteredData, d => d.hour);

        // Aggregate counts for the same hour
        const lineChartData = Array.from(hourGroupedData, ([hour, entries]) => {
            const count = entries.length;
            return { hour, count };
        });
        lineChartData.sort((a, b) => a.hour - b.hour);

        // Aggregate sums of transaction amounts for the same hour
        const sumData = Array.from(hourGroupedData, ([hour, entries]) => {
            const sum = d3.sum(entries, d => d.price);
            return { hour, sum };
        });
        sumData.sort((a, b) => a.hour - b.hour);

        // Parse timestamps and extract hours for vehicle loyaltyCCData
        vehicleData.forEach(d => d.Timestamp = parseDate(d.Timestamp));
        vehicleData.forEach(d => d.hour = d.Timestamp.getHours());

        const hourGroupedVehicle = d3.group(vehicleData, d => d.hour);

        // Aggregate counts for the number of vehicles passing each hour
        const vehicleCountData = Array.from(hourGroupedVehicle, ([hour, entries]) => {
            const vehicleCount = entries.length;
            return { hour, vehicleCount };
        });
        vehicleCountData.sort((a, b) => a.hour - b.hour);

        // Set up the SVG dimensions
        const margin = { top: 20, right: 80, bottom: 30, left: 50 };
        const width = 900 - margin.left - margin.right;
        const height = 650 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select('.box_2')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Set up scales
        const xScale = d3.scaleLinear()
            .domain([0, 23])
            .range([0, width]);

        // Calculate the maximum value among transaction count and vehicle count
        const maxYValue = Math.max(
            d3.max(lineChartData, d => d.count),
            d3.max(vehicleCountData, d => d.vehicleCount)
        );

        // Set up the Y-axis scale taking into consideration both datasets
        const yScaleCount = d3.scaleLinear()
            .domain([0, maxYValue])
            .range([height, 0]);

        const yScaleSum = d3.scaleLinear()
            .domain([0, d3.max(sumData, d => d.sum)])
            .range([height, 0]);

        // Set up the second Y-axis for vehicle count
        const yScaleVehicle = d3.scaleLinear()
            .domain([0, d3.max(vehicleCountData, d => d.vehicleCount)])
            .range([height, 0]);

        // Create line functions
        const lineCount = d3.line()
            .x(d => xScale(d.hour))
            .y(d => yScaleCount(d.count));

        const lineSum = d3.line()
            .x(d => xScale(d.hour))
            .y(d => yScaleSum(d.sum));

        const lineVehicleCount = d3.line()
            .x(d => xScale(d.hour))
            .y(d => yScaleVehicle(d.vehicleCount));

        // Draw X-axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Draw Y-axis for count
        svg.append('g')
            .call(d3.axisLeft(yScaleCount));

        // Draw line for count
        svg.append('path')
            .data([lineChartData])
            .attr("fill", "none")
            .attr('class', 'line-count')
            .attr('d', lineCount)
            .attr('stroke', 'blue')
            .attr("stroke-width", 1.5);

        // Add a label for the count y-axis
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Number of Instances');

        // Draw Y-axis for sum
        svg.append('g')
            .attr('transform', `translate(${width}, 0)`)
            .call(d3.axisRight(yScaleSum));

        // Draw line for sum
        svg.append('path')
            .data([sumData])
            .attr("fill", "none")
            .attr('class', 'line-sum')
            .attr('d', lineSum)
            .attr('stroke', 'red')
            .attr("stroke-width", 1.5);

        // Add a label for the sum y-axis
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', width + margin.right / 2)
            .attr('x', 0 - height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Total Amount Spent');

        // Draw Y-axis for vehicle count
        svg.append('g')
            .attr('transform', `translate(${width + margin.right}, 0)`)
            .call(d3.axisRight(yScaleVehicle));

        // Draw line for vehicle count
        svg.append('path')
            .data([vehicleCountData])
            .attr("fill", "none")
            .attr('class', 'line-vehicle')
            .attr('d', lineVehicleCount)
            .attr('stroke', 'black')
            .attr("stroke-width", 1.5);

        // Add a label for the vehicle count y-axis
        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', width + margin.right + margin.right / 2)
            .attr('x', 0 - height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .attr('stroke', 'black')
            .text('Number of Vehicles');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 720},${margin.top - 0})`)
            .attr('class', 'legend');

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', 'blue');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 8)
            .text('Total Transactions');

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 20)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', 'red');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 28)
            .text('Amount Spent');

        legend.append('rect')
            .attr('x', 0)
            .attr('y', 40)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', 'black');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 48)
            .text('Total Vehicles');


    });

}



document.addEventListener('DOMContentLoaded', function () {
    createGanttChart();
    createLineChart();
});