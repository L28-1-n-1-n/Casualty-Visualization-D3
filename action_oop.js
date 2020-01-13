class Visualization {
    constructor(){

        d3.queue()
            .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")  // World shape
            // .defer(d3.csv, "globalterrorismdb_0718dist.csv") // Position of circles, faster to render
            .defer(d3.csv, "https://media.githubusercontent.com/media/L28-1-n-1-n/D3_Assignment/master/globalterrorismdb_0718dist.csv") // Position of circles, slower to render
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
                .translate([width / 2, height / 2]);

            // Iterates through the data and compose an array of all unique values for attack types, represented by numbers in attacktype1
            var allAttackType = d3.map(data, function (d) {
                return (d.attacktype1)
            }).keys()

            // The array of unique attack types shall each be represented by a colour, i.e. they serve as a scale for the colour

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
                    return d.iyear == currentYear // draw only circles that correspond to activities of the current year
                }))
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([+d.longitude, +d.latitude])[0]
                })
                .attr("cy", function (d) {
                    return projection([+d.longitude, +d.latitude])[1]
                })

                // size of the circle is determined by the casualty of the attack
                .attr("r", function (d) {
                    return size(+d.nkill)
                })

                // colour of the circle correspond to the type of the attack
                .style("fill", function (d) {
                    return color(d.attacktype1)
                })
                .style("visibility", "visible")

                // highlight attacks with casualties greater than 2000, those are significant attacks
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
            .html("GLOBAL TERRORISM BY YEAR")
            .style("font-size", 32)
            .style("font-family", "arial")

            // Add current year
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

            // create legends including the size scale, and the colour keys
            draw_legends();

            //listens to input from the keyboard: increment current year if Right Arrow is pressed, decrement if Left Arrow is pressed.

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

                // refresh visualization to show the most updated year
                update();
                draw_legends();
            });

            function update() {

                //Further incrementation / decrementation beyond the limit of the dataset (1970 - 2017) not possible
                if (currentYear < 1970)
                    currentYear = 1970;
                if (currentYear > 2017)
                    currentYear = 2017;

                //removing all outdated visualizations
                d3.select("year_now").remove();
                d3.selectAll("circle").remove();

                // create the new circles according to the new data for the updated year
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
                        if (d.nkill > 2000) {
                            return "black"
                        } else {
                            return "none"
                        }
                    })
                    .attr("stroke-width", 1)
                    .attr("fill-opacity", .4)

                // removes the label for the outdated year
                d3.selectAll("#year_now").remove();

                // re-write legend to indicate the updated year
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

                // Add legned: colour key for types of attack

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

                    // when the mouse hover over the colour key, show the text key to indicate the type of attack indicated by the colour
                    .on("mouseover", function(d, i) {

                        svg.append("text")
                            .attr("text-anchor", "end")
                            .style("fill", "black")
                            .attr("x", 850)
                            .attr("y", d.y+10)
                            .attr("id", d.id)
                            .text(function() {
                                return (d.attack_type);  // Value of the text
                            })
                            .style("font-size", 14);
                        d3.select(this).attr("fill-opacity", 1);

                    })

                    // when the mose is no longer hovering above the colour key, the text key showing the type of attack disappears
                    .on("mouseout", function(d, i) {
                        console.log("Your mouse went out", d, i);
                        console.log("in out function");
                        console.log(d.colour);

                        d3.select(this).attr(
                            "fill-opacity", 0.4
                        );

                        // Select text by id and then remove
                        d3.select("#" + d.id).remove();  // Remove text location
                    });

                // function add_text(y, caption){
                //
                //     svg.append("text")
                //         .attr("text-anchor", "end")
                //         .style("fill", "black")
                //         .attr("x", 850)
                //         .attr("y", y+10)
                //         .attr("id", caption)
                //         .text(function() {
                //
                //             return (caption);  // Value of the text
                //         })
                //         .style("font-size", 14);
                //
                // }

            }

    }

}

let visual = new Visualization();
visual.ready();