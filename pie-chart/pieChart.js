function _1(d3, data, md) { return (
  md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;">
     <h1 style="display: none;">Labor Union Membership</h1>
     <a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a>
     </div>

# Labor Union Membership (1963-1969)

This visualization shows labor union membership by affiliation from 1963 to 1969.`
)}

function _chart(d3, yearlyData) {
  // Create a container for all chart-description pairs
  const container = d3.create("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("gap", "40px")
    .style("width", "95vw")
    .style("max-width", "1200px")
    .style("margin", "0 auto");

  // Calculate chart dimensions based on viewport width
  const chartWidth = Math.min(400, window.innerWidth * 0.4);
  const chartHeight = chartWidth;

  // Process each year's data
  yearlyData.forEach(({year, data}) => {
    // Skip if no data
    if (!data || data.length === 0) return;

    // Create a container for this chart-description pair
    const pair = d3.create("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "40px")
      .style("width", "100%")
      .style("background", "white")
      .style("padding", "20px")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)");

    // ===== LEFT SIDE: PIE CHART =====
    const chartDiv = d3.create("div")
      .style("flex", "0 0 auto")
      .style("min-width", `${chartWidth}px`);

    // Create the color scale for this chart
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    // Create the pie layout and arc generator
    const pie = d3.pie()
      .sort(null)
      .value(d => d.value);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(chartWidth, chartHeight) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    const arcLabel = d3.arc()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);

    const arcs = pie(data);

    // Create the SVG container for this chart
    const svg = d3.create("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .attr("viewBox", [-chartWidth / 2, -chartHeight / 2, chartWidth, chartHeight])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Add title for the chart
    svg.append("text")
      .attr("y", -chartHeight/2 + 25)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(`Labor Union Membership (${year})`);

    // Add a sector path for each value
    svg.append("g")
      .attr("stroke", "white")
      .selectAll()
      .data(arcs)
      .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
      .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);

    // Add labels
    svg.append("g")
      .attr("text-anchor", "middle")
      .selectAll()
      .data(arcs)
      .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString("en-US")));

    chartDiv.node().appendChild(svg.node());
    pair.node().appendChild(chartDiv.node());

    // ===== RIGHT SIDE: DESCRIPTION =====
    const descriptionDiv = d3.create("div")
      .style("flex", "1")
      .style("min-width", "300px")
      .style("padding", "10px");

    // Create description content based on the data
    const total = d3.sum(data, d => d.value);
    // Add check for empty data
    const topCategory = data.length > 0 ? data.reduce((a, b) => a.value > b.value ? a : b) : null;
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    descriptionDiv.append("h3")
      .text(`${year} Key Insights`)
      .style("margin-top", "0")
      .style("color", "#333");

    descriptionDiv.append("p")
      .html(`This visualization shows <strong>${data.length} labor union affiliations</strong> with a total membership of <strong>${total.toLocaleString()}</strong> in ${year}.`);

    if (topCategory) {
      descriptionDiv.append("p")
        .html(`The largest affiliation was <strong>"${topCategory.name}"</strong> representing <strong>${((topCategory.value / total) * 100).toFixed(1)}%</strong> of total membership.`);
    }

    const table = descriptionDiv.append("table")
      .style("width", "100%")
      .style("border-collapse", "collapse")
      .style("margin-top", "10px");

    const thead = table.append("thead");
    thead.append("tr")
      .selectAll("th")
      .data(["Affiliation", "Membership", "Percentage"])
      .join("th")
        .text(d => d)
        .style("text-align", "left")
        .style("padding", "8px")
        .style("border-bottom", "1px solid #ddd");

    const tbody = table.append("tbody");
    tbody.selectAll("tr")
      .data(sortedData)
      .join("tr")
        .selectAll("td")
        .data(d => [d.name, d.value.toLocaleString(), `${((d.value / total) * 100).toFixed(1)}%`])
        .join("td")
          .text(d => d)
          .style("padding", "8px")
          .style("border-bottom", "1px solid #eee");

    pair.node().appendChild(descriptionDiv.node());
    container.node().appendChild(pair.node());
  });

  return container.node();
}

// Load and transform the single CSV file
async function _data(FileAttachment) {
  const rawData = await FileAttachment("labor-unions.csv").csv({typed: true});
  
  // Transform into yearly data
  const years = [1963, 1964, 1965, 1966, 1967, 1968, 1969];
  return years.map(year => ({
    year,
    data: rawData.map(d => ({
      name: d.congressAffiliation,
      value: +d[year] // Convert to number
    })).filter(d => !isNaN(d.value)) // Filter out invalid numbers
  }));
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["labor-unions.csv", {url: new URL("./files/labor-unions.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["d3","data","md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  return main;
}