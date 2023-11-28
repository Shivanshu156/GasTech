let svg_beeswarm_fifth_viz;
let g_beeswarm_fifth_viz;
const margin_fifth_viz = { top: 20, right: 10, bottom: 150, left: 75 };
const width_fifth_viz = 1800 - margin_fifth_viz.left - margin_fifth_viz.right;
const height_fifth_viz = 750 - margin_fifth_viz.top - margin_fifth_viz.bottom;
let combined_data_fifth_viz;

document.addEventListener('DOMContentLoaded', function () {
    svg_beeswarm_fifth_viz = d3.select("#beeswarmViz")
        .append("svg")
        .attr("width", width_fifth_viz + margin_fifth_viz.left + margin_fifth_viz.right)
        .attr("height", height_fifth_viz + margin_fifth_viz.top + 2 * margin_fifth_viz.bottom);

    g_beeswarm_fifth_viz = svg_beeswarm_fifth_viz.append("g")
        .attr("transform", `translate(${margin_fifth_viz.left}, ${margin_fifth_viz.top})`);

    Promise.all([d3.csv('data/cc_data.csv'), d3.csv('data/loyalty_data.csv'), d3.csv('data/linked_owners_credit_cards_with_loyalty.csv')])
        .then(function (values) {
            console.log('loaded cc_data.csv and loyalty_data.csv');
            const cc_data_fifth_viz = values[0];
            const loyalty_data_fifth_viz = values[1];
            const owner_data_fifth_viz = values[2];

            cc_data_fifth_viz.forEach(d => {
                d.price = +d.price;
                d.timestamp = d.timestamp.split(" ")[0]; 
            });
            loyalty_data_fifth_viz.forEach(d => {
                d.price = +d.price;
         
            });

        
            combined_data_fifth_viz = cc_data_fifth_viz.map(d => ({ ...d, type: 'cc' }))
                .concat(loyalty_data_fifth_viz.map(d => ({ ...d, type: 'loyalty' })));

            combined_data_fifth_viz.forEach(d => {
                let ownerInfo_fifth_viz = owner_data_fifth_viz.find(o => o.target === (d.type === 'cc' ? d.last4ccnum : d.loyaltynum));
                if (ownerInfo_fifth_viz) {
                    d.owner = ownerInfo_fifth_viz.source;
                } else {
                    d.owner = 'Truck Driver';
                }
            });

            drawBeeswarmChart_fifth_viz();
        });
});

function drawBeeswarmChart_fifth_viz() {
    const locations_fifth_viz = [...new Set(combined_data_fifth_viz.map(d => d.location))]
    drawBeeswarmLegend()




    const xScale_fifth_viz = d3.scaleBand()
        .domain(locations_fifth_viz)
        .range([0, width_fifth_viz])
        .padding(1);

    const yScale_fifth_viz = customYScale_fifth_viz();

    
    g_beeswarm_fifth_viz.append("g")
        .attr("transform", `translate(0, ${height_fifth_viz})`)
        .call(d3.axisBottom(xScale_fifth_viz))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.15em")
        .attr("dy", ".15em")
        .attr("font-size", "10px")
        .attr("font-weight", "5")
        .attr("transform", "rotate(-35)");

    g_beeswarm_fifth_viz.append("text")
        .attr("transform", `translate(${width_fifth_viz / 2}, ${height_fifth_viz + margin_fifth_viz.bottom - 70})`)
        .style("text-anchor", "middle")
        .text("Locations");


  
    drawCustomYAxis_fifth_viz(g_beeswarm_fifth_viz, yScale_fifth_viz);

    g_beeswarm_fifth_viz.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_fifth_viz.left + 10)
        .attr("x", 0 - (height_fifth_viz / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Price"); 

    const simulation_fifth_viz = d3.forceSimulation(combined_data_fifth_viz)
        .force("x", d3.forceX(d => xScale_fifth_viz(d.location)).strength(1))
        .force("y", forceYCustom_fifth_viz(d => yScale_fifth_viz(d.price)).strength(0.8))
        .force("collide", d3.forceCollide(6))
        .stop();

    for (let i = 0; i < 120; ++i) simulation_fifth_viz.tick();

    const tooltip_fifth_viz = d3.select("#beeswarmViz")
        .append("div")
        .attr("class", "tooltip_fifth");

  
    function mouseover_fifth_viz(event, d) {
       
        d3.select(this).transition()
            .duration(200)
            .attr('r', 8);

        tooltip_fifth_viz.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip_fifth_viz.html("Price: $" + d.price +
            "<br/>Card Used: " + (d.type === 'cc' ? d.last4ccnum : d.loyaltynum) +
            "<br/>Owner: " + d.owner +
            "<br/>Timestamp: " + d.timestamp +
            "<br/>Location: " + d.location

        )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function mouseout_fifth_viz() {
       
        d3.select(this).transition()
            .duration(500)
            .attr('r', 4);

        tooltip_fifth_viz.transition()
            .duration(500)
            .style("opacity", 0);
    }

    
    g_beeswarm_fifth_viz.selectAll(".dot")
        .data(combined_data_fifth_viz)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("id", d => `location-${normalizeString(d.location)}`)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 3)
        .attr("fill", d => d.type === 'cc' ? "#FF5733" : "black") 
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseover_fifth_viz)
        .on("mouseout", mouseout_fifth_viz)
        .on("click", function (event, d) {
            clickCircleWithName_3rd_Viz(d.owner);
        });
}

function drawCustomYAxis_fifth_viz(g, yScale_fifth_viz) {
    
    g.selectAll(".axis--y").remove();

    const axis_fifth_viz = g.append("g")
        .attr("class", "axis axis--y");

    const scaleLow_fifth_viz = yScale_fifth_viz.scaleLow;
    const scaleMid_fifth_viz = yScale_fifth_viz.scaleMid;
    const scaleHigh_fifth_viz = yScale_fifth_viz.scaleHigh;

    drawAxisSegment_fifth_viz(axis_fifth_viz, scaleLow_fifth_viz.domain()[0], scaleLow_fifth_viz.domain()[1], scaleLow_fifth_viz);
    drawAxisSegment_fifth_viz(axis_fifth_viz, scaleMid_fifth_viz.domain()[0], scaleMid_fifth_viz.domain()[1], scaleMid_fifth_viz);
    drawAxisSegment_fifth_viz(axis_fifth_viz, scaleHigh_fifth_viz.domain()[0], scaleHigh_fifth_viz.domain()[1], scaleHigh_fifth_viz);
}


function drawAxisSegment_fifth_viz(axis_fifth_viz, domainStart_fifth_viz, domainEnd_fifth_viz, scale_fifth_viz, rangeStart_fifth_viz, rangeEnd_fifth_viz) {
    axis_fifth_viz.append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", scale_fifth_viz(domainStart_fifth_viz))
        .attr("y2", scale_fifth_viz(domainEnd_fifth_viz))
        .attr("stroke", "black");


    const ticks_fifth_viz = scale_fifth_viz.ticks(5);
    ticks_fifth_viz.forEach(tick => {
        if (tick >= domainStart_fifth_viz && tick <= domainEnd_fifth_viz) {
            axis_fifth_viz.append("line")
                .attr("x1", -6)
                .attr("x2", 0)
                .attr("y1", scale_fifth_viz(tick))
                .attr("y2", scale_fifth_viz(tick))
                .attr("stroke", "black");

            axis_fifth_viz.append("text")
                .attr("x", -9)
                .attr("y", scale_fifth_viz(tick))
                .attr("dy", "0.32em")
                .attr("text-anchor", "end")
                .text(tick);
        }
    });

    if (domainStart_fifth_viz !== 0) {
        axis_fifth_viz.append("text")
            .attr("x", -15)
            .attr("y", (scale_fifth_viz(rangeStart_fifth_viz) + scale_fifth_viz(rangeEnd_fifth_viz)) / 2)
            .attr("dy", "0.32em")
            .attr("text-anchor", "end")
            .text("//");
    }
}

function customYScale_fifth_viz() {
    const rangeBreakpoint1_fifth_viz = height_fifth_viz;
    const rangeBreakpoint2_fifth_viz = height_fifth_viz * 0.5;
    const rangeBreakpoint3_fifth_viz = height_fifth_viz * 0.25;
    const rangeBreakpoint4_fifth_viz = 0;

    const rangeLow_fifth_viz = [rangeBreakpoint1_fifth_viz, rangeBreakpoint2_fifth_viz];
    const rangeMid_fifth_viz = [rangeBreakpoint2_fifth_viz, rangeBreakpoint3_fifth_viz];
    const rangeHigh_fifth_viz = [rangeBreakpoint3_fifth_viz, rangeBreakpoint4_fifth_viz];

    const domainLow_fifth_viz = [0, 23];
    const domainMid_fifth_viz = [23, 2000];
    const domainHigh_fifth_viz = [2000, 10000];

    const scaleLow_fifth_viz = d3.scaleLinear().domain(domainLow_fifth_viz).range(rangeLow_fifth_viz);
    const scaleMid_fifth_viz = d3.scaleLinear().domain(domainMid_fifth_viz).range(rangeMid_fifth_viz);
    const scaleHigh_fifth_viz = d3.scaleLinear().domain(domainHigh_fifth_viz).range(rangeHigh_fifth_viz);

    const combinedScale_fifth_viz = function (value) {
        if (value <= domainLow_fifth_viz[1]) {
            return scaleLow_fifth_viz(value);
        } else if (value <= domainMid_fifth_viz[1]) {
            return scaleMid_fifth_viz(value);
        } else {
            return scaleHigh_fifth_viz(value);
        }
    };

    combinedScale_fifth_viz.scaleLow = scaleLow_fifth_viz;
    combinedScale_fifth_viz.scaleMid = scaleMid_fifth_viz;
    combinedScale_fifth_viz.scaleHigh = scaleHigh_fifth_viz;

    return combinedScale_fifth_viz;
}

function forceYCustom_fifth_viz(yValue_fifth_viz) {
    let nodes_fifth_viz;
    let strength_fifth_viz = 0.1;

    function force_fifth_viz(alpha_fifth_viz) {
        for (const node_fifth_viz of nodes_fifth_viz) {
            node_fifth_viz.vy += (yValue_fifth_viz(node_fifth_viz) - node_fifth_viz.y) * alpha_fifth_viz * strength_fifth_viz;
        }
    }

    force_fifth_viz.initialize = function (_) {
        nodes_fifth_viz = _;
    };

    force_fifth_viz.strength = function (_) {
        return arguments.length ? (strength_fifth_viz = +_, force_fifth_viz) : strength_fifth_viz;
    };

    return force_fifth_viz;
}

function highlightLocation(locationName) {
    const normalizedLocation = normalizeString(locationName);

  
    g_beeswarm_fifth_viz.selectAll(".dot")
        .transition() 
        .duration(500) 
        .style("opacity", 0.2);

    g_beeswarm_fifth_viz.selectAll(`#location-${normalizedLocation}`)
        .transition() 
        .duration(500)
        .style("opacity", 1)
        .attr("r", 3.75);
}

function normalizeString(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '-');
}


function drawBeeswarmLegend() {

    const legendData = [
        { label: 'Credit Card Data', color: '#FF5733' },
        { label: 'Loyalty Card Data', color: 'black' }
    ];


    const legend = svg_beeswarm_fifth_viz.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width_fifth_viz - 50}, ${height_fifth_viz - 550})`); 


    legend.selectAll(".legend-item")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`)
        .each(function (d) {
            
            d3.select(this).append("circle")
                .attr("r", 6) 
                .attr("cx", 0) 
                .attr("cy", 0) 
                .attr("fill", d.color);


            d3.select(this).append("text")
                .attr("x", 15) 
                .attr("y", 5) 
                .text(d.label) 
                .attr("font-size", "12px")
                .attr("fill", "#333");
        });
}
