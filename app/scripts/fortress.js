//
//
//
//
//
//Demonstrates the d3.geo.tile plug-in used in conjunction 
//with the d3.geo.mercator projection to clip MapBox Natural Earth II raster tiles.
//The outline of the United States is loaded in TopoJSON format.
//

      var width = 960,
      height = 500,
      active;

      var projection = d3.geo.mercator()
          .center([-96, 38.3])
          .scale(5600);


      var path = d3.geo.path()
          .projection(projection);

      var tile = d3.geo.tile()
          .scale(projection.scale())
          .translate(projection([0, 0]))
          .zoomDelta((window.devicePixelRatio || 1) - .5);

      var svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height);


      queue()
              .defer(d3.json, "dod_sites.json")
              .defer(d3.json, "us.json")
              .await(ready);


    function ready(error, army, topology )  {
        var tiles = tile();

        var defs = svg.append("defs");

        var g = svg.append("g");

        defs.append("path")
            .attr("id", "land")
            .datum(topojson.object(topology, topology.objects.land))
            .attr("d", path);

        defs.append("clipPath")
            .attr("id", "clip")
            .append("use")
            .attr("xlink:href", "#land");

        svg.append("g")
            .attr("clip-path", "url(#clip)")
            .selectAll("image")
            .data(tiles)
            .enter().append("image")
            .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/mapbox.natural-earth-2/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
            .attr("width", Math.round(tiles.scale))
            .attr("height", Math.round(tiles.scale))
            .attr("x", function(d) { return Math.round((d[0] + tiles.translate[0]) * tiles.scale); })
            .attr("y", function(d) { return Math.round((d[1] + tiles.translate[1]) * tiles.scale); })
            .on("click", click);

        svg.append("use")
            .attr("xlink:href", "#land")
            .attr("class", "stroke");

        svg.append("g")
              .attr("class", "fortress")
              .attr("clip-path", "url(#clip-land)")
              .selectAll("path")
              .data(topojson.object(army, army.objects.fortress).geometries)
              .enter().append("path")
              .attr("d", path)
              .append("title")
              .text(function(d) { return d.id; })
              .on("click", click);

          var fortress = svg.append("path")
              .attr("class", "fortress-boundaries")
              .attr("clip-path", "url(#clip-land)")
              .datum(topojson.mesh(army, army.objects.fortress, function(a, b) { return (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
              .attr("class", "mesh")
              .attr("d", path);

          var text = svg.append("g")
              .attr("class", "place-label")
              .selectAll("text")
              .data(fortress)
              .enter().append("text")

              .attr("text-transform", function(d) {return d.coordinates; })
              .attr("dx", 12)
              .attr("dy", ".35em")
              .text(function(d) { return d.id; });

}

      function click(d) {
        if (active === d) return reset();
        svg.selectAll(".active").classed("active", false);
        d3.select(this).classed("active", active = d);

        var b = path.bounds(d);
        svg.transition().duration(750).attr("transform",
            "translate(" + projection.translate() + ")"
            + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
            + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
      }

      function reset() {
        svg.selectAll(".active").classed("active", active = false);
        svg.transition().duration(750).attr("transform", "");
      }

    
