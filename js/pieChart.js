class PieChart {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 10, bottom: 30, right: 50, left: 50 }
        }

        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.tp = '#tooltip';

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.marin = vis.config.margin.left;

        vis.radius = Math.min(vis.width, vis.height) / 2 - vis.marin;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.width / 2},${vis.height / 2})`);

        vis.colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
        vis.colorPalette.domain('good', 'hazard', 'unhealthy', 'moderete', 'unhealthyfor', 'very');
        this.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.keysAll = [];
        vis.data.forEach(d => {
            vis.keysAll.push(d.key)});
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        
        vis.keys = vis.keysAll.filter(onlyUnique);

        vis.svg.selectAll("mydots")
            .data(vis.keys)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function (d, i) { return 250 + i * 25 }) 
            .attr("r", 4)
            .style("fill", function (d) { return vis.colorPalette(d) })

        // Add one dot in the legend for each name.
        vis.svg.selectAll("mylabels")
            .data(vis.keys)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function (d, i) { return 250 + i * 25 }) 
            .style("fill", function (d) { return vis.colorPalette(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        vis.chart.selectAll('path')
            .data([])
            .exit().remove();
        
        vis.pie = d3.pie()
            .value(function (d) {
                return d.value
            })

        vis.data_ready = vis.pie(vis.data);

        vis.chart.selectAll('whatever')
            .data(vis.data_ready)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(vis.radius)
            )
            .attr('fill', (d) =>
                vis.colorPalette(d.data.key)
            )
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .on('mouseover', function (event, d) { 
        
                //create a tool tip
                d3.select('#tooltip')
                  .style('opacity', 1)
                  .style('z-index', 1000000)
                  .html(`
                  <div class="tooltip-title">Key: ${d.data.key}</div>
                  <ul>
                    <li> Value: ${d.value}</li>
 
                  </ul>
                `);        
              })
              .on('mousemove', (event) => {
                //position the tooltip
                d3.select('#tooltip')
                  .style('left', (event.pageX + 10) + 'px')
                  .style('top', (event.pageY + 10) + 'px');
              })
    }
}