class Visualization {
    constructor(){
        // this.width = width;
        // this.height = height;
        // this.currentYear = 1970;
        d3.queue()
            .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
            .defer(d3.csv, "globalterrorismdb_0718dist.csv") // Position of circles
            .await(this.ready);
    }

    ready(error, dataGeo, data) {

            const svg = d3.select("svg");

            var currentYear = 1970;
            var width = 945;
            var height = 525;
            var projection = d3.geoMercator()
                .center([0, 20])                // GPS of location to zoom on
                .scale(99)                       // This is like the zoom
                // .translate([this.width / 2, this.height / 2]);
                .translate([width / 2, height / 2]);
            var allAttackType = d3.map(data, function (d) {
                return (d.attacktype1)
            }).keys()
        console.log(allAttackType);
        var allAttackType2 = d3.map(data, function (d) {
            return (d.attacktype1_txt)
        }).keys()
        console.log(allAttackType2);

        // var attacksByName = d3.nest(data)
        //     .key(function(d) { return d.attacktype1; })
        //     .entries(data);
        // console.log(attacksByName);

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
                    // console.log(b.nkill);
                    // console.log(a.nkill);
                    // console.log(a.iyear);
                    return +b.nkill - +a.nkill
                }).filter(function (d) {
                    return d.iyear == currentYear
                }))
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
                    if (d.iyear == 2001) {
                        console.log("this is year 2001");
                        console.log(d.nkill);
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
            .html("GLOBAL TERRORISM BY YEAR")
            .style("font-size", 32)
            .style("font-family", "arial")

            // Add year
        svg

            .append("text")
            .attr("text-anchor", "start")
            .style("fill", "black")
            .attr("x", 20)
            .attr("y", 50)
            .attr("width", 90)
            .attr("id", "year_now")
            .html(currentYear)
            .style("font-size", 32)
            .style("font-family", "arial")

            window.focus();
        draw_legends();
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
                draw_legends();
            });

            function update() {
                if (currentYear < 1970)
                    currentYear = 1970;
                if (currentYear > 2017)
                    currentYear = 2017;
                d3.select("year_now").remove();
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
                    .attr("r", function (d) {
                        return size(+d.nkill)
                    })
                    .style("fill", function (d) {
                        return color(d.attacktype1)
                    })
                    .attr("stroke", function (d) {
                        if (d.nkill > 2900) {
                            return "black"
                        } else {
                            return "none"
                        }
                    })
                    .attr("stroke-width", 1)
                    .attr("fill-opacity", .4)
                d3.selectAll("#year_now").remove();
                svg

                    .append("text")
                    .attr("text-anchor", "start")
                    .style("fill", "black")
                    .attr("x", 20)
                    .attr("y", 50)
                    .attr("width", 90)
                    .attr("id", "year_now")
                    .html(currentYear)
                    .style("font-size", 32)
                    .style("font-family", "arial")

            }
            function draw_legends(){

                // --------------- //
                // ADD LEGEND //
                // --------------- //

                // Add legend: circles
                var valuesToShow = [100,500,1000,3000]
                var xCircle = 80
                var xLabel = 180
                svg
                    .selectAll("legend")
                    .data(valuesToShow)
                    .enter()
                    .append("circle")
                    .attr("cx", xCircle)
                    .attr("cy", function(d){ return height - size(d) } )
                    .attr("r", function(d){ return size(d) })
                    .style("fill", "none")
                    .attr("stroke", "black")

                // Add legend: line segments
                svg
                    .selectAll("legend")
                    .data(valuesToShow)
                    .enter()
                    .append("line")
                    .attr('x1', function(d){ return xCircle + size(d) } )
                    .attr('x2', xLabel)
                    .attr('y1', function(d){ return height - size(d) } )
                    .attr('y2', function(d){ return height - size(d) } )
                    .attr('stroke', 'black')
                    .style('stroke-dasharray', ('2,2'))

                // Add legend: labels
                svg
                    .selectAll("legend")
                    .data(valuesToShow)
                    .enter()
                    .append("text")
                    .attr('x', xLabel)
                    .attr('y', function(d){ return height - size(d) } )
                    .text( function(d){ return d } )
                    .style("font-size", 10)
                    .attr('alignment-baseline', 'middle')

                // Add legned: types of attack

                var rectData = [
                    { "y": 30, "colour" : 1, "attack_type" : "Assisination", "id" : "Assisinatio"},
                    { "y": 50,"colour" : 6, "attack_type" : "Hostage Taking (Kidnapping)", "id" : "Kidnapping"},
                    { "y": 70, "colour" : 3, "attack_type" : "Bombing/Explosion", "id" : "BE"},
                    { "y": 90, "colour" : 7, "attack_type" : "Facility/Infrastructure Attack", "id" : "FIA"},
                    { "y": 110, "colour" : 2, "attack_type" : "Armed Assault", "id" : "Armed"},
                    { "y": 130, "colour" : 4, "attack_type" : "Hijacking", "id" : "Hijacking"},
                    { "y": 150, "colour" : 9, "attack_type" : "Insurgency/Guerilla Action", "id" : "IGA"},
                    { "y": 170, "colour" : 8, "attack_type" : "Unarmed Assault", "id" : "UA"},
                    { "y": 190, "colour" : 5, "attack_type" : "Hostage Taking (Barricade Incident)", "id" : "HT"},

                ];

                var rect = svg.selectAll("rect")
                    .data(rectData)
                    .enter()
                    .append("rect")
                    .attr("x", 900)
                    .attr("y", function (d) { return d.y; })
                    .attr("width", 10)
                    .style("height", 20)
                    .style("fill", function (d) {
                        return color(d.colour)
                    })
                    .attr("fill-opacity", .4)

                    // .on("mouseover", handleMouseOver)
                    // .on("mouseout", handleMouseOut);
                    .on("mouseover", function(d, i) {
                        console.log("Your mouse went over", d, i);
                        // add_text(d.y, d.attack_type);
                        svg.append("text")
                            .attr("text-anchor", "end")
                            .style("fill", "black")
                            .attr("x", 850)
                            .attr("y", d.y+10)
                            .attr("id", d.id)
                            .text(function() {
                                console.log("in add function");
                                console.log(d.colour);
                                return (d.attack_type);  // Value of the text
                            })
                            .style("font-size", 14);
                        d3.select(this).attr("fill-opacity", 1);

                    })








                    .on("mouseout", function(d, i) {
                        console.log("Your mouse went out", d, i);
                        console.log("in out function");
                        console.log(d.colour);
                        // remove_text(d.y, d.attack_type);
                        d3.select(this).attr(
                            "fill-opacity", 0.4
                        );

                        // Select text by id and then remove
                        d3.select("#" + d.id).remove();  // Remove text location

                    });

                // On Click, we want to add data to the array and chart
                // svg.on("click", function() {
                //     var coords = d3.mouse(this);
                //
                //     // Normally we go from data to pixels, but here we're doing pixels to data
                //     var newData= {
                //         x: Math.round( xScale.invert(coords[0])),  // Takes the pixel number to convert to number
                //         y: Math.round( yScale.invert(coords[1]))
                //     };
                //
                //     dataset.push(newData);   // Push data to our array
                //
                //     svg.selectAll("circle")  // For new circle, go through the update process
                //         .data(dataset)
                //         .enter()
                //         .append("circle")
                //         .attr(circleAttrs)  // Get attributes from circleAttrs var
                //         .on("mouseover", handleMouseOver)
                //         .on("mouseout", handleMouseOut);
                // })
                function add_text(y, caption){
                    console.log("LOL");

                    svg.append("text")
                        .attr("text-anchor", "end")
                        .style("fill", "black")
                        .attr("x", 850)
                        .attr("y", y+10)
                        .attr("id", caption)
                        .text(function() {
                            console.log("here");
                            return (caption);  // Value of the text
                        })
                        .style("font-size", 14);

                }

                // Create Event Handlers for mouse
                function handleMouseOver(d, i) {  // Add interactivity

                    // Use D3 to select element, change color and size
                    d3.select(this).attr({
                        fill: "orange",
                        // r: radius * 2
                    });

                    // Specify where to put label of text
                    svg.append("text").attr({
                        id: "t" + d.x + "-" + d.y + "-" + i,  // Create an id for text so we can select it later for removing on mouseout
                        x: function() { return xScale(d.x) - 30; },
                        y: function() { return yScale(d.y) - 15; }
                    })
                        // .text(function() {
                        //     return [d.attack_type];  // Value of the text
                        // });
                }

                //
                // svg
                //     .append("text")
                //     .attr("text-anchor", "end")
                //     .style("fill", "black")
                //     .attr("x", width - 10)
                //     .attr("y", height - 30)
                //     .attr("width", 90)
                //     .html("WHERE SURFERS LIVE")
                //     .style("font-size", 14)





                function handleMouseOut(d, i) {
                    // Use D3 to select element, change color back to normal
                    d3.select(this).attr({
                        fill: "black",
                        // r: radius
                    });

                    // Select text by id and then remove
                    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
                }






                // var rectValues = ["1", "6", "3", "7", "2", "4", "9", "8", "5"]
                // var rectValues = [1,2]
                // d3.select("svg").selectAll("rect")
                //     .data(rectValues)
                //     .enter()
                //     .append("rect")
                //     .attr("x", 900)
                //
                //     .attr("width", 10)
                //     .attr("height", 20)
                //     .style("fill", function (d) {
                //         return color(rectValues)
                //     })
                //     .style("visibility", "visible")
                //     .attr("fill-opacity", .4)
                //     .attr("y", 900 - 20 * rectValues)

                // svg
                //     .selectAll("legend_rect")
                //     .data(rectValues)
                //     .enter()
                //     .append("rect")
                //     .attr("x", 900)
                //     .attr("y", 0 + )
                //     .attr("width", 10)
                //     .attr("height", 20)
                //
                //     .style("fill", function (d) {
                //         return color(rectValues)
                //     })
                //     .style("visibility", "visible")
                //     .attr("fill-opacity", .4)


            }

    }

}

let visual = new Visualization();
visual.ready();