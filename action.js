// window.addEventListener("load", function() {
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

// Map and projection
    var projection = d3.geoMercator()
        .center([0, 20])                // GPS of location to zoom on
        .scale(99)                       // This is like the zoom
        .translate([width / 2, height / 2])
var currentYear = 1970;
    d3.queue()
        .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
        .defer(d3.csv, "globalterrorismdb_0718dist.csv") // Position of circles
        .await(ready);
// .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_gpsLocSurfer.csv") // Position of circles

    // var currentYear = 1970;


    function ready(error, dataGeo, data) {

        var allAttackType = d3.map(data, function (d) {
            return (d.attacktype1)
        }).keys()
        var color = d3.scaleOrdinal()
            .domain(allAttackType)
            .range(d3.schemePaired);

        // Add a scale for bubble size
        var valueExtent = d3.extent(data, function (d) {
            return +d.nkill;
        })
        // var valueExtent = d3.extent(data, function(d) { return +d.n; })
        var size = d3.scaleSqrt()
            .domain(valueExtent)  // What's in the data
            .range([1, 50])  // Size in pixel

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(dataGeo.features)
            .enter()
            .append("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath()
                .projection(projection)
            )

            .style("stroke", "none")
            .style("opacity", .3)

        // Add circles:
        svg
            .selectAll("myCircles")
            .data(data.sort(function (a, b) {
                return +b.nkill - +a.nkill
            }).filter(function (d) {
                return d.iyear == currentYear
            }))
            // .data(data.sort(function(a,b) { return +b.nkill - +a.nkill }).filter(function(d,i){ return i<1000 }))
            // .data(data.sort(function(a,b) { return +b.n - +a.n }).filter(function(d,i){ return i<1000 }))
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return projection([+d.longitude, +d.latitude])[0]
            })
            .attr("cy", function (d) {
                return projection([+d.longitude, +d.latitude])[1]
            })

            .attr("r", function (d) {
                return size(+d.nkill)
            })

            .style("fill", function (d) {
                return color(d.attacktype1)
            })
            .style("visibility", "visible")
            .attr("stroke", function (d) {
                if (d.nkill > 2000) {
                    return "black"
                } else {
                    return "none"
                }
            })
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)


        // Add title and explanation
        svg
            .append("text")
            .attr("text-anchor", "end")
            .style("fill", "black")
            .attr("x", width - 10)
            .attr("y", height - 30)
            .attr("width", 90)
            .html("WHERE SURFERS LIVE")
            .style("font-size", 14)

        // window.focus();
        // d3.select(window).on("keydown", function() {
        //     switch (d3.event.keyCode) {
        //         case 37: currentYear = currentYear - 1;
        //         console.log(currentYear);
        //         break;
        //         case 39: currentYear = currentYear + 1; console.log(currentYear); break;
        //     }
        //     update();
        // });
        //
        // function update() {
        //     // if (!(year in data)) return;
        //     if (currentYear < 1970)
        //         currentYear = 1970;
        //     if (currentYear > 2017)
        //         currentYear = 2017;
        //     var circle = svg.select("g").selectAll("myCircles");
        //     console.log(circle);
        //     // title.text(year);
        //     // birthyears.transition()
        //     //     .duration(750)
        //     //     .attr("transform", "translate(" + (x(year1) - x(year)) + ",0)");
        //     //
        //     // birthyear.selectAll("rect")
        //     //     .data(function(birthyear) { return data[year][birthyear] || [0, 0]; })
        //     //     .transition()
        //     //     .duration(750)
        //     //     .attr("y", y)
        //     //     .attr("height", function(value) { return height - y(value); });
        //     circle.exit().remove();
        // }

        window.focus();
        d3.select(window).on("keydown", function () {
            switch (d3.event.keyCode) {
                case 37:
                    currentYear = currentYear - 1;
                    console.log(currentYear);
                    break;
                case 39:
                    currentYear = currentYear + 1;
                    console.log(currentYear);
                    break;
            }

            update();
        });

        function update() {
            // if (!(year in data)) return;

            if (currentYear < 1970)
                currentYear = 1970;
            if (currentYear > 2017)
                currentYear = 2017;
            d3.selectAll("circle").remove();
            var circle = svg.select("g").selectAll("myCircles")
                .data(data.sort(function (a, b) {
                    return +b.nkill - +a.nkill
                }).filter(function (d) {
                    return d.iyear == currentYear
                }))

            circle.enter().append("circle")
                .attr("cx", function (d) {
                    return projection([+d.longitude, +d.latitude])[0]
                })
                .attr("cy", function (d) {
                    return projection([+d.longitude, +d.latitude])[1]
                })
                // .attr("cx", function(d){ return projection([+d.homelon, +d.homelat])[0] })
                // .attr("cy", function(d){ return projection([+d.homelon, +d.homelat])[1] })
                .attr("r", function (d) {
                    return size(+d.nkill)
                })

                .style("fill", function (d) {
                    return color(d.attacktype1)
                })
                .attr("stroke", function (d) {
                    if (d.nkill > 2000) {
                        return "black"
                    } else {
                        return "none"
                    }
                })
                .attr("stroke-width", 1)
                .attr("fill-opacity", .4)
        }
    }
// });