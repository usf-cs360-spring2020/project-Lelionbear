// Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;
// var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));

// Create primary <g> element
var svg = d3.select("body").select("svg#vis_1");
var root
var sunburst_data
var other_data
var other_root

var g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// Data strucure
var partition = d3.partition()
    .size([2 * Math.PI, radius]);

format = d3.format(",d");

d3.csv("sunburst.csv").then(function(csv) {

  console.log(csv);

  sunburst_data = d3.nest()
      .key(function(d) { return d["city"]; })
      .key(function(d) { return d["genre"]; })
      .key(function(d) { return d["decade"]; })
      // .key(function(d) { return d["id"]; })
      // .rollup(function(d) { return d.length})
      .rollup(function(d){
        return {
          length : d.length,
          movies : d
        };
      })
      .entries(csv);

  other_data = d3.nest()
      .key(function(d) { return d["decade"]; })
      .key(function(d) { return d["year"]; })
      .key(function(d) { return d["vote_average"]; })
      // .rollup(function(leaves) { return leaves.length; })
      .rollup(function(d){
        return {
          length : d.length,
          movies : d
        };
      })
      .entries(csv);

  console.log(sunburst_data[0]);
  console.log(other_data);

  drawSunburst_highlight(sunburst_data[0]);
  });

  function drawSunburst_highlight(data){
    console.log("SUNBURST");

    root = d3.hierarchy(data, function(d) {
      return d.values;
    }).sum(function (d) {
      // console.log(d.value);
      if(d.value != undefined)
      {
        // console.log(d.value.length);
        return d.value.length;
      }
    })
    .sort(function(a, b) { return b.value.length - a.value.length; });

    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));

    // Size arcs
    partition(root);
    var arc = d3.arc()
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1 })
        // .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        // .padRadius(radius * 1.5)
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });

    slice = g.selectAll('g.node')
             .data(root.descendants(), function(d) { return d.data.key; }); // .enter().append('g').attr("class", "node");
    newSlice = slice.enter()
                    .append('g')
                    .attr("class", "node")
                    .merge(slice);
    slice.exit()
         .remove();


    slice.selectAll('path')
         .remove();
    newSlice.append('path')
          .attr("display", function (d) { return d.depth ? null : "none"; })
          .attr("d", arc)
          .style('stroke', '#fff')
          .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.key); })
          .append("title")
          .text(d => `Number of movies: ${format(d.value)}`);

    // Populate the <text> elements with our data-driven titles.
    slice.selectAll('text')
         .remove();
    newSlice.append("text")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("transform", function(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dy", ".35em")
        .text(function(d) { return d.parent ? d.data.key : "" });

    newSlice.on("click", highlightSelectedSlice);
  }

  function highlightSelectedSlice(c,i) {

      clicked = c;
      var rootPath = clicked.path(root).reverse();
      var send_me = clicked.path(root);
      console.log(send_me);
      // console.log(send_me[0].data.value.movies);


      var dec = send_me[0].data.key;
      var gen = send_me[1].data.key;
      // var obj = null;

      // other_data.forEach((item, i) => {
      //   console.log(item);
      //   if(!isNaN(dec) && item.key === dec)
      //   {
      //     console.log(item.values);
      //     makeDentree(item);
      //   }
      //   else if (item.key === gen)
      //   {
      //     console.log(item);
      //   }
      // });

      var movies_arr = [];
      if (!isNaN(dec))
      {
        d3.select("body").select("svg#vis_2").select("*").remove();

        // console.log(send_me[0].data.value.movies);
        movies_arr = send_me[0].data.value.movies;
        console.log(movies_arr);

        makeDentree(movies_arr);
        // makeCirclepacking(movies_arr);
      }
      else {
        d3.select("body").select("svg#vis_2").select("*").remove();

        send_me[0].data.values.forEach((year, index) => {
          // console.log(year.key);
          year.value.movies.forEach((movie, i) => {
            // console.log(movie);
            movies_arr.push(movie);
          });

        });

        console.log(movies_arr);
        // makeDentree(movies_arr);
        makeCirclepacking(movies_arr);
      }


      rootPath.shift(); // remove root node from the array
      console.log(dec);
      console.log(gen);
      console.log(other_data);
      // console.log(other_root);
      // console.log(obj);



      // rootPath.shift(); // remove root node from the array

      newSlice.style("opacity", 0.4);
      newSlice.filter(function(d) {
          if (d === clicked && d.prevClicked) {
              d.prevClicked = false;
              newSlice.style("opacity", 1);
              return true;

          } else if (d === clicked) {
              d.prevClicked = true;
              return true;
          } else {
              d.prevClicked = false;
              return (rootPath.indexOf(d) >= 0);
          }
      })
          .style("opacity", 1);

      //d3.select("#sidebar").text("another!");

  };
