let data = [],
    singleColors = ["#e5f4f7", "#b0dfe8", "#7bc9d8", "#46b4c9", "#119eb9", "#0d8ca7", "#097996", "#046784", "005472", "#e5f4f7", "#b0dfe8", "#7bc9d8", "#46b4c9", "#119eb9", "#0d8ca7", "#097996", "#046784", "005472"],
    fullColors = ["#a4517b", "#d75a3b", "#47a9b2", "#fffad9", "#4cb8d5", "#58f3af", "#feb8cf", "#007693", "#ea9865", "#a4517b", "#d75a3b", "#47a9b2", "#fffad9", "#4cb8d5", "#58f3af", "#feb8cf", "#007693", "#ea9865"],
    patterns = ["pattern0", "pattern1", "pattern2", "pattern3", "pattern4", "pattern5", "pattern6", "pattern0", "pattern1", "pattern2", "pattern3", "pattern4", "pattern5", "pattern6"];

// set the dimensions and margins of the graph
let containerWidth = d3.select("#graph").style("width"),
    containerHeight = d3.select("#graph").style("height");

const filename = getUrlParam('file', ""),
    re_filename = filename.replace(/~/g, '&'),
    dim1 = getUrlParam('dim1', "") - 1,
    dim2 = getUrlParam('dim2', "") - 1,
    m = getUrlParam('m', "") - 1,
    fill = getUrlParam('fill', 'single'),
    end = getUrlParam('end', ""),
    sorttype = getUrlParam('sort', "atoz"),
    legend = getUrlParam('legend', "right");

appendGroupBar(re_filename, dim1, dim2, m, fill, end, sorttype, legend);

function appendGroupBar(filename, dim1, dim2, m, fill, end, sorttype, legend) {

    d3.csv(filename, function (data) {
        console.log(data, 'ddd')
        const limit_bar_width = 10, label_available = 60;
        let margin = {top: 100, right: 100, bottom: 100, left: 100},
            width = parseInt(containerWidth) - margin.left - margin.right,
            height = parseInt(containerHeight) - margin.top - margin.bottom;

        let columns = data.columns,
            groups = d3.map(data, d => d[columns[dim1]]).keys(),
            subgroups = d3.map(data, d => d[columns[dim2]]).keys(),
            counts = groups.length * subgroups.length,
            c_width = width / counts;

        const sortedData = sorted(data, sorttype);
        let dd = sortedData.data;
        subgroups = sortedData.subgroups;
        
        if (c_width < limit_bar_width) {
            d3.select("#graph").style("width", margin.left + margin.right + counts * limit_bar_width + "px");
            containerWidth = d3.select("#graph").style("width");
            width = parseInt(containerWidth) - margin.left - margin.right
        }

        // append the svg object to the body of the page
        d3.select("#graph").select("*").remove();
        let svg = d3.select("#graph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
                
        svg = appendFilterAndPattern(svg);

        const tooltip = d3.select("#graph").append("div")
            .style("position", "absolute")
            .style("border", "2px solid grey")
            .style("background", "rgba(255, 255, 255, 0.9)")
            .style("padding", "4px")
            .style("visibility", "hidden");

        const maxY = Math.max(...dd.map(d => d[columns[m]]));
        // Add X axis
        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2]);
        const y = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, 0]);

        const xSubgroup = d3.scaleBand()
            .domain(subgroups)
            .range([0, x.bandwidth()])
            .padding([0.05])

        const color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(fill === 'single' ? singleColors : fullColors)

        // Show the bars
        const bar_group = svg.append("g")
            .selectAll("g")
            .data(groups)
            .enter()
            .append("g")
            .attr("transform", d => `translate(${x(d)}, ${height})`);

        const band = xSubgroup.bandwidth(), r = band * 0.3;
        bar_group.selectAll("path")
            .data(d => dd.filter(e => e[columns[dim1]] === d))
            .enter().append("path")
            .attr("class", d => `path-bars _${d[columns[dim2]]}`)
            .attr("stroke", fill === 'pattern' ? "#119eb9" : 'none')
            .attr("d", d => {
                let x_pos = xSubgroup(d[columns[dim2]]),
                    bar_h = height - y(d[columns[m]]);

                if (bar_h < r) bar_h = r;
                return end === "straight" ? `M${x_pos}, 0v${0}h${band}v${0}h${-band}z`
                    : `M${x_pos}, 0v${0}q0, -${r}, ${r}, -${r} h${band - r * 2}q${r}, 0, ${r}, ${r}v${0}h${-band}z`
            })
            .attr("fill", (d, i) => fill !== 'pattern' ? color(d[columns[dim2]]) : `url('#${patterns[i]}')`)
        
        bar_group.selectAll("path")
            .transition().duration(1000)
            .attr("d", d => {
                let x_pos = xSubgroup(d[columns[dim2]]),
                    bar_h = height - y(d[columns[m]]);

                if (bar_h < r) bar_h = r;
                return end === "straight" ? `M${x_pos}, 0v${-bar_h}h${band}v${bar_h}h${-band}z`
                    : `M${x_pos}, 0v${-bar_h + r}q0, -${r}, ${r}, -${r} h${band - r * 2}q${r}, 0, ${r}, ${r}v${bar_h - r}h${-band}z`
            })
        bar_group.selectAll("path")
            .on("mouseover", function (d) {                
                d3.select(this).style("opacity", 1);
                svg.selectAll(`.path-bars`)
                    .each(function (e) {
                        let classes = d3.select(this).attr('class').split("_");
                        console.log(d[columns[dim2]],classes[1], 'pass here!')
                        if(d[columns[dim2]] === classes[1]){
                            
                            d3.select(this).style("opacity", 1);
                        }else{
                            d3.select(this).style("opacity", 0.3);
                        }
                    });
                

                d3.select(this).style("opacity", 1);
                tooltip
                    .html(
                        `<p class="measure-name">${d[columns[dim2]]}</p>
                        <p class="tip-content">${Formatter(d[columns[m]])}</p>`
                    )
                    .style("visibility", "visible")
                    .style("border", fill === 'pattern' ? `2px solid #119eb9` : `2px solid ${color(d[columns[dim2]])}`)
                    .style("left", d3.event.pageX + "px")
                    // .style("left", margin.left + x(d[columns[dim1]]) + xSubgroup(d[columns[dim2]]) + xSubgroup.bandwidth() / 2 + "px")
                    .style("top", d3.event.pageY + "px");
            })
            .on("mouseout", function (d) {
                svg.selectAll(`.path-bars`)
                    .each(function (d) {
                        d3.select(this).style("opacity", 1);
                    });
                tooltip.style("visibility", "hidden")
            });

        bar_group.selectAll("text.subcategory")
            .data(d => dd.filter(e => e[columns[dim1]] === d))
            .enter().append("text")
            .attr('class', "subcategory")
            .attr("alignment-baseline", "central")
            .attr("text-anchor", "start")
            .attr('font-family', "Nunito Sans")
            .attr('font-weight', "bold")
            .attr("transform", d => `translate(${xSubgroup(d[columns[dim2]]) + xSubgroup.bandwidth() / 2}, 20)rotate(-90)`)
            .style("opacity", 0)
            .text(d => d[columns[dim2]]);

        let subgroupLengths = [];
        bar_group.selectAll("text.subcategory")
            .each(function (d) {
                let text_width = this.getComputedTextLength(),
                    bar_h = height - y(d[columns[m]]);

                subgroupLengths.push(text_width);

                if (text_width * 2 > bar_h) {
                    if (bar_h < r) bar_h = r;
                    d3.select(this).attr("x", bar_h + 10);
                } else {
                    d3.select(this).attr("x", 10);
                }
            });

        bar_group.selectAll("text.subcategory")
            .transition().duration(1000)
            .attr("transform", d => `translate(${xSubgroup(d[columns[dim2]]) + xSubgroup.bandwidth() / 2}, 0)rotate(-90)`)
            .style("opacity", c_width >= label_available && legend === 'inline' ? 1 : 0)

        bar_group.selectAll("text.value")
            .data(d => dd.filter(e => e[columns[dim1]] === d))
            .enter().append("text")
            .attr('class', 'value')
            .attr("x", d => xSubgroup(d[columns[dim2]]) + xSubgroup.bandwidth() / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "hanging")
            .attr('font-family', "Nunito Sans")
            .attr('font-size', 18)
            .attr('font-weight', 'bold')
            .style("opacity", 0)
            .text(d => Formatter(d[columns[m]]));
        
        bar_group.selectAll("text.value")
            .transition().duration(1000)
            .attr("y", function(d) {
                let bar_h = height - y(d[columns[m]]),
                    max_sub = Math.max(...subgroupLengths),
                    setted_y = 0;
                
                if (max_sub * 2 > bar_h) {
                    if (bar_h < r){
                        return -18;
                    }else {
                        return -bar_h + 10;                    
                    }
                } else {
                    return -bar_h + 10;                    
                }
            })
            .style("opacity", c_width >= label_available ? 1 : 0)

        //append rect for shadow effect
        for(let i = 0; i < groups.length; i++) {
            svg.append("rect")
                .attr("x", x(groups[i]) - 5)
                .attr("y", -height - 20)
                .attr("width", x.bandwidth() + 10)
                .attr("height", 20)
                .attr("fill", "white")
                .attr('transform', 'scale(1, -1)')
                .style("filter", "url(#drop-shadow)")
        }
        
        svg.append("rect")
            .attr("x", 0)
            .attr("y", height)
            .attr("width", width)
            .attr('fill', "white")
            .attr("height", 20)

        const axisX = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(0));
        axisX.selectAll("text").attr("font-family", "Nunito Sans").attr('font-size', 18).style("opacity", c_width >= label_available ? 1 : 0)
        axisX.select(".domain").style("box-shadow", "0 -10px rgba(0, 0, 0, 0.15)")
        axisX.select(".domain").remove();
        // Add Y axis

        const axisY = svg.append("g")
            .call(d3.axisLeft(y));

        axisY.selectAll(".tick").remove();
        axisY.select(".domain").remove();

        //add legend
        let legendG = null, each = null;
        switch (legend) {
            case "top":
                legendG = svg.append("g")
                    .attr('class', 'legendGroup')
                    .attr('transform', `translate(${margin.left}, ${-margin.top/2})`);

                each = legendG.selectAll("g.legends")
                    .data(subgroups)
                    .enter().append("g");
                
                each.append("rect")
                    .attr("x", (_, i) => i * 180)
                    .attr("y", -10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("fill", (d, i) => fill === 'pattern' ? `url('#${patterns[i]}')` : color(d));

                each.append("text")
                    .attr("x", (_, i) => i * 180 + 25)
                    .attr("text-anchor", "start")
                    .attr("alignment-baseline", "central")
                    .attr("font-size", "14")
                    .attr("fill", "black")                        
                    .text(d => trunc(d, 10));
            break;
            case "bottom":
                legendG = svg.append("g")
                    .attr('class', 'legendGroup')
                    .attr('transform', `translate(${margin.left}, ${height + margin.bottom/2})`);

                each = legendG.selectAll("g.legends")
                    .data(subgroups)
                    .enter().append("g");
                
                each.append("rect")
                    .attr("x", (_, i) => i * 180)
                    .attr("y", -10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("fill", (d, i) => fill === 'pattern' ? `url('#${patterns[i]}')` : color(d));

                each.append("text")
                    .attr("x", (_, i) => i * 180 + 25)
                    .attr("text-anchor", "start")
                    .attr("font-size", "14")
                    .attr("alignment-baseline", "central")
                    .attr("fill", "black")                        
                    .text(d => trunc(d, 10));
            break;
            case "left":
                legendG = svg.append("g")
                    .attr('class', 'legendGroup')
                    .attr('transform', `translate(${-margin.left}, 0)`);

                each = legendG.selectAll("g.legends")
                    .data(subgroups)
                    .enter().append("g");
                
                each.append("rect")                        
                    .attr("y", (_, i) => i * 30 - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("fill", (d, i) => fill === 'pattern' ? `url('#${patterns[i]}')` : color(d));

                each.append("text")
                    .attr("x", 25)
                    .attr("y", (_, i) => i * 30)
                    .attr("text-anchor", "start")
                    .attr("font-size", "14")
                    .attr("alignment-baseline", "central")
                    .attr("fill", "black")                        
                    .text(d => trunc(d, 10));
            break;
            case "right":
                legendG = svg.append("g")
                    .attr('class', 'legendGroup')
                    .attr('transform', `translate(${width }, 0)`);

                each = legendG.selectAll("g.legends")
                    .data(subgroups)
                    .enter().append("g");
                
                each.append("rect")                        
                    .attr("y", (_, i) => i * 30 - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("fill", (d, i) => fill === 'pattern' ? `url('#${patterns[i]}')` : color(d));

                each.append("text")
                    .attr("x", 25)
                    .attr("y", (_, i) => i * 30)
                    .attr("text-anchor", "start")
                    .attr("font-size", "14")
                    .attr("alignment-baseline", "central")
                    .attr("fill", "black")                        
                    .text(d => trunc(d, 10));
            break;
        }
    })
}
