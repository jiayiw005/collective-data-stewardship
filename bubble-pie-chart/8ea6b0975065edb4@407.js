// https://observablehq.com/@analyzer2004/bubble-pie-chart@407
function _1(md){return(
md`# Bubble Pie Chart
Bubble pie chart is a unique bubble chart that allows you to show/compare/relate performance across four paramenter sets instead of two. The third value determines the size of the bubble marker, the fourth by the % of pie while the other two are determined by the position on the axis.`
)}

function _chart(d3,width,height,drawGuidelines,chartData,x,hx,margin,y,r,toCurrency,territories,pie,color,drawAxis)
{
  const svg = d3.create("svg")
    .attr("font-size", "10pt")
    .attr("cursor", "default")
    .attr("viewBox", [0, 0, width, height]);
  
  svg.append("g").call(g => drawGuidelines(g, chartData.map(d => d.year), 
    d => d3.line()([[x(d) + hx, margin.top],[x(d) + hx, height - margin.bottom]]))
  );
  
  svg.append("g").call(g => drawGuidelines(g, y.ticks().reverse().slice(1),
    d => d3.line()([[margin.left, y(d)],[width - margin.left - margin.right, y(d)]]))
  );
                       
  const g = svg.selectAll(".pie")
    .data(chartData)
    .join("g")    
    .attr("class", "pie")
    .attr("transform", d => `translate(${x(d.year) + hx},${y(d.total)})`)
    .call(g => g.append("text")
          .attr("dy", "1em")
          .attr("text-anchor", "middle")
          .attr("transform", d => `translate(0,${r(d.total)})`)
          .text(d => toCurrency(d.total)));  
    
  const pg = g.selectAll("g")
    .data(d => d3.pie()(d.values).map(p => ({pie: p, total: d.total})))
    .join("g")
    .call(g => g.append("title")
          .text((d, i) => `${territories[i]}\n${toCurrency(d.pie.value)} (${(d.pie.value / d.total * 100).toFixed(1)}%)`));
  
  const slice = pg.append("path")
      .attr("d", d => pie(d)())
      .attr("opacity", 1)
      .attr("fill", (d, i) => color(territories[i]));
  
  const pct = pg.append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "white")    
    .attr("transform", (d, i) => {
      const c = pie(d).centroid(d.pie.value);
      return `translate(${c[0]},${c[1]})`;
    })
    .attr("opacity", "0")
    .text(d => (d.pie.value / d.total * 100).toFixed(1) + "%");
  
  svg.append("g").call(g => drawAxis(g, margin.left, 0, d3.axisLeft(y).ticks(height / 100, "s")));
  svg.append("g").call(g => drawAxis(g, 0, height - margin.bottom, d3.axisBottom(x)));  
  svg.append("g").call(drawLegend);
  
  return svg.node();
  
  var legend;
  function drawLegend(g) {
    legend = g.attr("transform", `translate(${width - margin.right},0)`)
      .selectAll("g")
      .data(territories)
      .join("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`)
      .call(g => g.append("rect")
            .attr("rx", 3).attr("ry", 3)
            .attr("width", 20).attr("height", 15)
            .attr("fill", d => color(d)))
      .call(g => g.append("text").attr("dx", 25).attr("alignment-baseline", "hanging").text(d => d))
      .on("mouseover", e => highlight(e))
      .on("mouseout", () => highlight());
  }
  
  function highlight(e) {
    const i = e ? legend.nodes().indexOf(e.currentTarget) : -1;    
    slice.transition().duration(500).attr("opacity", (d, j) => i === -1 || j === i ? 1 : 0.3);
    pct.transition().duration(500)
      .attr("opacity", function(d, j) {
        if (j === i) {            
            this.parentNode.parentNode.appendChild(this.parentNode);
            return 1;
        }
        else return 0;
    });
  }
}


function _drawAxis(){return(
(g, x, y, axis) => 
  g.attr("transform", `translate(${x},${y})`)
  .call(axis)
  .selectAll(".tick text")
  .attr("font-size", "9pt")
)}

function _drawGuidelines(){return(
(g, data, line) => {
  g.selectAll("path")
    .data(data)
    .join("path")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "5,5")
    .attr("d", line);
}
)}

function _toCurrency(d3){return(
num => d3.format("$,.2f")(num)
)}

function _x(d3,chartData,margin,width){return(
d3.scaleBand()
  .domain(chartData.map(d => d.year))
  .range([margin.left, width - margin.left - margin.right])
)}

function _hx(x){return(
x.bandwidth() / 2
)}

function _y(d3,chartData,height,margin,hx)
{
  const ext = d3.extent(chartData.map(d => d.total));
  // value(total) to length ratio of radius
  const f = (ext[1] - ext[0]) / (height - margin.bottom - margin.top * 2);
  // margin = 1.5 radius
  ext[0] -= hx * 1.5 * f;
  ext[1] += hx * 1.5 * f;
  
  return d3.scaleLinear().domain(ext).range([height - margin.top - margin.bottom, margin.top])
}


function _r(d3,chartData,hx){return(
d3.scaleLinear()
  .domain(d3.extent(chartData.map(d => d.total)))
  .range([hx / 2, hx])
)}

function _pie(d3,r){return(
d => d3.arc()
  .innerRadius(0)
  .outerRadius(r(d.total))
  .startAngle(d.pie.startAngle)
  .endAngle(d.pie.endAngle)
)}

function _color(d3,territories){return(
d3.scaleOrdinal(d3.schemeTableau10).domain(territories)
)}

async function _data(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("profit6yr.csv").text(), d3.autoType)
)}

function _chartData(data){return(
data.columns.slice(1).map(y => {
  const values = data.map(d => d[y]);
  return {
    year: y,
    values: values,
    total: values.reduce((a, b) => a + b)
  }
})
)}

function _territories(data){return(
data.map(d => d.territory)
)}

function _height(width){return(
width * 0.5
)}

function _margin(){return(
{left: 40, bottom: 50, top: 10, right: 150}
)}

function _d3(require){return(
require("d3@6")
)}

function _19(md){return(
md`🌐[ericlo.dev](https://ericlo.dev) 🐱[GitHub Repositories](https://github.com/analyzer2004?tab=repositories) 🐦[Twitter](https://twitter.com/analyzer2004)`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["profit6yr.csv", {url: new URL("./files/cc337900045eb136af7a8750224377ccfe2e5a19c8fea9426d8e60690e172b0272dd13713421449ac73be9b315010cdef6e3f154eb6bca7519dd32da3423b478.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","width","height","drawGuidelines","chartData","x","hx","margin","y","r","toCurrency","territories","pie","color","drawAxis"], _chart);
  main.variable(observer("drawAxis")).define("drawAxis", _drawAxis);
  main.variable(observer("drawGuidelines")).define("drawGuidelines", _drawGuidelines);
  main.variable(observer("toCurrency")).define("toCurrency", ["d3"], _toCurrency);
  main.variable(observer("x")).define("x", ["d3","chartData","margin","width"], _x);
  main.variable(observer("hx")).define("hx", ["x"], _hx);
  main.variable(observer("y")).define("y", ["d3","chartData","height","margin","hx"], _y);
  main.variable(observer("r")).define("r", ["d3","chartData","hx"], _r);
  main.variable(observer("pie")).define("pie", ["d3","r"], _pie);
  main.variable(observer("color")).define("color", ["d3","territories"], _color);
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], _data);
  main.variable(observer("chartData")).define("chartData", ["data"], _chartData);
  main.variable(observer("territories")).define("territories", ["data"], _territories);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["md"], _19);
  return main;
}
