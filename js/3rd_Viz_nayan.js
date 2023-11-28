

const width = 800;
const height = 675;
const color = "white";

let selectedNode = null;
const my40Colors = [
  "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
  "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
  "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
  "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
  "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b",
  "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];


let allOwners = [
  "Willem Vasco-Pais",
  "Ingrid Barranco",
  "Vira Frente",
  "Ada Campo-Corrente",
  "Elsa Orilla",
  "Axel Calzas",
  "Orhan Strum",
  "Edvard Vann",
  "Sven Flecha",
  "Hideki Cocinaro",
  "Birgitta Frente",
  "Stenig Fusil",
  "Isia Vann",
  "Linnea Bergen",
  "Felix Balas",
  "Marin Onda",
  "Nils Calixto",
  "Bertrand Ovan",
  "Hennie Osvaldo",
  "Lidelse Dedos",
  "Brand Tempestad",
  "Inga Ferro",
  "Lars Azada",
  "Kare Orilla",
  "Lucas Alcazar",
  "Unknown",
  "Minke Mies",
  "Varja Lagos",
  "Kanon Herrero",
  "Felix Resumir",
  "Loreto Bodrogi",
  "Isande Borrasca",
  "Isak Baza",
  "Adra Nubarron",
  "Gustav Cazar",
  "Sten Sanjorge Jr."
];


const colorScale = d3.scaleOrdinal(my40Colors).domain(allOwners);

document.addEventListener("DOMContentLoaded", function () {


  Promise.all([d3.csv("data/pp.csv")]).then(([data]) => {
  

    const svg = d3.select(".box_3").append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background-color", color);

    


    const links = [];
    data.forEach(entry => {
      links.push({ source: entry.FirstName + " " + entry.LastName, target: entry.last4ccnum + " Loyalty Card: " + entry.LoyaltyCard });
    });

    console.log(links)

    const linkCounts = {};
    links.forEach(link => {
      const key = `${link.source}-${link.target}`;
      linkCounts[key] = (linkCounts[key] || 0) + 1;
    });
    console.log(linkCounts)
    
    const nodesSet = new Set([...links.map(link => link.source), ...links.map(link => link.target)]);
    const nodes = Array.from(nodesSet).map(name => ({
      name,
      side: links.some(link => link.source === name) ? "source" : "target",
    }));

    const linksWithCountSet = new Set(links.map(link => JSON.stringify({
      source: link.source,
      target: link.target,
      count: linkCounts[`${link.source}-${link.target}`],
    })));
    console.log("linkwithcountset")

    const linksWithCount = Array.from(linksWithCountSet)
      .map(JSON.parse)
      .filter((value, index, self) =>
        self.findIndex(obj =>
          JSON.stringify(obj) === JSON.stringify(value)
        ) === index
      );
   

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(linksWithCount).id(d => d.name).distance(30)) 
      .force("charge", d3.forceManyBody().strength(-5)) 
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30)); 

   
    simulation.force("x", d3.forceX().strength(0.1).x(d => d.side === "source" ? 400 : 400)); 


   
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.1).restart(); 
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0); 
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    simulation.alphaDecay(0.2); 
    simulation.on("tick", () => {
     
      if (simulation.alpha() < 0.005) { 
        simulation.stop();
      }
    });

  
    const link = svg.selectAll("line")
      .data(linksWithCount)
      .enter().append("line")
      .attr("stroke", "#aaa") 
      .attr("stroke-width", d => Math.max(1, d.count / 2))
      .style("visibility", "hidden")


    link.append("title")
      .text(d => `Connection between ${d.source.name} and ${d.target.name}, Count: ${d.count}`);


   
    const node = svg.selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(drag(simulation))
      .on("click", handleNodeClick)
      .on("mouseover", handleMouseOver);

    node.append("circle")
      .filter(d => d.side === "source")
      .attr("r", 10)
      .attr("fill", d => colorScale(d.name))
      .attr("id", d => "circle-" + d.name.replace(/\s+/g, '-'))
      .style("stroke", "#fff")
      .style("stroke-width", "1px")
      .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.3)")
      .on("mouseover", function () { d3.select(this).transition().attr("r", 15); })
      .on("mouseout", function () { d3.select(this).transition().attr("r", 10); });

    node.append("rect")
      .filter(d => d.side === "target")
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", "url(#halfBrownHalfYellowGradient)")
      .attr("rx", 3)
      .attr("ry", 3)
      .style("stroke", "#fff")
      .style("stroke-width", "1px")
      .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.3)") 
      .on("mouseover", function () { d3.select(this).transition().attr("width", 45).attr("height", 25); })
      .on("mouseout", function () { d3.select(this).transition().attr("width", 20).attr("height", 10); });

    const labelArea = svg.append("g") 
      .attr("transform", "translate(20, 30)");

    labelArea.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 10)
      .style("fill", "#808080");

    labelArea.append("text")
      .attr("x", 25)
      .attr("y", 5)
      .text("Owner Name")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .attr("fill", "black");

    labelArea.append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 20)
      .attr("height", 15)
      .attr("fill", "url(#halfBrownHalfYellowGradient)")
      .attr("rx", 3)
      .attr("ry", 3)
      .style("stroke", "#fff") 
      .style("stroke-width", "1px")
      .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.3)")
      
    labelArea.append("text")
      .attr("x", 25)
      .attr("y", 30)
      .text("Credit and Loyalty Card Information")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .attr("fill", "black");
   

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "halfBrownHalfYellowGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

   
    gradient.append("stop")
      .attr("offset", "50%")
      .style("stop-color", "#CE4420");

    gradient.append("stop")
      .attr("offset", "50%")
      .style("stop-color", "#00203FFF");

    
    node.append("title")
      .text(d => d.side === "source" ? `Name: ${d.name}` : `Credit Card: ${d.name}`);


    function handleNodeClick(event, d) {
      if (selectedNode === d) {
        
        selectedNode = null;
        link.style("visibility", "hidden");
      } else {
     
        selectedNode = d;
        updateConnections();
      }
    }

    
    function updateConnections() {
      link.transition().duration(500)
        .style("visibility", l => l.source === selectedNode || l.target === selectedNode ? "visible" : "hidden");
    }

    function handleMouseOver(event, d) {
      link.transition().duration(300) 
      //   .style("visibility", l => l.source === d || l.target === d ? "visible" : "hidden");
    }

    function handleMouseOut() {
      link.transition().duration(300) 
      //   .style("visibility", "hidden");
    }

    
    node.on("mouseout", handleMouseOut);

    simulation.on("tick", () => {
     
      const compressFactor = 4; 
      const compressedHeight = height * compressFactor;

      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

  
      node
        .attr("cx", d => d.x)
        .attr("cy", d => Math.max(Math.min(d.y, compressedHeight), 0))
        .attr("transform", d => `translate(${d.x},${Math.max(Math.min(d.y, compressedHeight), 0)})`);
    });
  });
});


function findMostImportantLink(node) {
  let maxCount = 0;
  let mostImportantLink = null;
  linksWithCount.forEach(link => {
    if ((link.source === node || link.target === node) && link.count > maxCount) {
      maxCount = link.count;
      mostImportantLink = link;
    }
  });
  return mostImportantLink;
}

function clickCircleWithName_3rd_Viz(name) {

  const circleId = "circle-" + name.replace(/\s+/g, '-');


  const circle = d3.select("#" + circleId).node();

  if(circle) {
      circle.dispatchEvent(new MouseEvent('click', {
        bubbles: true,    
        cancelable: true 
      }));
  } else {
      console.log("Circle with name '" + name + "' not found.");
  }
}