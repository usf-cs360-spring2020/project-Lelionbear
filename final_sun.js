var width = 500;
var height = 500;
var sun_radius = width / 6; //Math.min(width, height) / 2;
var left_opacity = 0.9;
var right_opacity = 0.9;
var sun_data
var root
var color //= d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, sun_data.values.length + 1))
var svg = d3.select("body").select("svg#vis_1");
var format = d3.format(",d")
var g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

var partition = data => {
  const temp = d3.hierarchy(data, function(d) {
      // console.log(d.values);
      return d.values;
    }).sum(function (d) {
        // console.log(d.value);
        if(d.value != undefined)
        {
          // console.log(d.value.length);
          return d.value.length;
        }
      })
      .sort((a, b) => b.value.length - a.value.length);
  return d3.partition()
      .size([2 * Math.PI, temp.height + 1])
    (temp);
}

var arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(sun_radius * 1.5)
    .innerRadius(d => d.y0 * sun_radius)
    .outerRadius(d => Math.max(d.y0 * sun_radius, d.y1 * sun_radius - 1))

d3.csv("sunburst_3.csv").then(function(csv) {

  console.log(csv);

  sun_data = d3.nest()
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

  // other_data = d3.nest()
  //     .key(function(d) { return d["decade"]; })
  //     .key(function(d) { return d["year"]; })
  //     .key(function(d) { return d["vote_average"]; })
  //     // .rollup(function(leaves) { return leaves.length; })
  //     .rollup(function(d){
  //       return {
  //         length : d.length,
  //         movies : d
  //       };
  //     })
  //     .entries(csv);

  console.log(sun_data[0]);
  // console.log(other_data);

  // drawSunburst_highlight(sun_data[0]);
  draw_sun(sun_data[0]);
  // color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, sun_data[0].values.length + 1))
  });



  function draw_sun(data){
    color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.values.length + 1));

    root = partition(data);

    root.each(d => d.current = d);
    // console.log(root);

    path = g.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .style('stroke', 'whitesmoke')
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.key); })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? left_opacity : right_opacity) : 0)
      .attr("d", d => arc(d.current));

    // path.filter(d => d.children)
    path.filter(function(d) {
      console.log("hello");
      return d.children;
    })
      .style("cursor", "pointer")
      .on("click", clicked);

    path.on("click", clicked);
    // path.on("dblclick", dblclick);

    path.append("title")
        .text(d => `Number of movies: ${format(d.value)}`);
        // .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n${format(d.value)}`);

    label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(function(d) { return d.parent ? d.data.key : "" });
      // .text(d => d.data.name);

    parent = g.append("circle")
      .datum(root)
      .attr("r", sun_radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);
  }

// var width = 500;
// var height = 500;
// var sun_radius = width / 6; //Math.min(width, height) / 2;
// var sun_data
// var root
// var color //= d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, sun_data.values.length + 1))
// var svg = d3.select("body").select("svg#vis_1");
// var g = svg
//     .attr('width', width)
//     .attr('height', height)
//     .append('g')
//     .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

// var partition = data => {
//   const root = d3.hierarchy(data)
//       .sum(d => d.value)
//       .sort((a, b) => b.value - a.value);
//   return d3.partition()
//       .size([2 * Math.PI, root.height + 1])
//     (root);
// }

function dblclick(p) {
  var send_me = p.path(root);
  console.log(send_me);
}

function clicked(p) {

  var send_me = p.path(root);
  var temp = +p.path(root)[0].data.key;
  var temp2 = p.path(root).length;
  // console.log(temp2);
  console.log(send_me);

  var movies_arr = [];
  if(temp2 !== 1)
  {
    if(!isNaN(temp))
    {
      console.log("able to do the dentree here");

      d3.select("body").select("svg#vis_2").select("*").remove();

      // console.log(send_me[0].data.value.movies);
      movies_arr = send_me[0].data.value.movies;
      console.log(movies_arr);

      makeDentree(movies_arr);

      return;
    }
    else
    {
      console.log("able to do the circle packing here");
      d3.select("body").select("svg#vis_2").select("*").remove();

      send_me[0].data.values.forEach((year, index) => {
        // console.log(year.key);
        year.value.movies.forEach((movie, i) => {
          // console.log(movie);
          movies_arr.push(movie);
        });

      });

      console.log(movies_arr);
      makeCirclepacking(movies_arr);
      // return;
    }
  }
  // else
  // {
  //   console.log("able to do clear vis_2");
  //   d3.select("body").select("svg#vis_2").select("*").remove();
  // }

  parent.datum(p.parent || root);

  root.each(d => d.target = {
    x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    y0: Math.max(0, d.y0 - p.depth),
    y1: Math.max(0, d.y1 - p.depth)
  });

  const t = g.transition().duration(750);

  // Transition the data on all arcs, even the ones that aren’t visible,
  // so that if this transition is interrupted, entering arcs will start
  // the next transition from the desired position.
  path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
    .filter(function(d) {
      return +this.getAttribute("fill-opacity") || arcVisible(d.target);
    })
      .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? left_opacity : right_opacity) : 0)
      .attrTween("d", d => () => arc(d.current));

  label.filter(function(d) {
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", d => +labelVisible(d.target))
      .attrTween("transform", d => () => labelTransform(d.current));
}

function arcVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
}

function labelVisible(d) {
  return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d) {
  const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
  const y = (d.y0 + d.y1) / 2 * sun_radius;
  return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}








// // Variables
// var width = 1000;
// var height = 1000;
// var sun_radius = width / 6;
// // var sun_radius = Math.min(width, height) / 2;
// // var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));
//
// // Create primary <g> element
// var svg = d3.select("body").select("svg#vis_1");
// var root
// var sunburst_data
// var other_data
// var other_root
//
// var g = svg
//     .attr('width', width)
//     .attr('height', height)
//     .append('g')
//     .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
//
// // Data strucure
// // var partition = d3.partition()
// //     .size([2 * Math.PI, sun_radius]);
// var partition
// // var partition = d3.partition()
// //     .size([2 * Math.PI, root.height + 1]);
// // var partition = data => {
// //   root = d3.hierarchy(data)
// //       .sum(function (d) {
// //         // console.log(d.value);
// //         if(d.value != undefined)
// //         {
// //           // console.log(d.value.length);
// //           return d.value.length;
// //         }
// //       })
// //       .sort((a, b) => b.value.length - a.value.length);
// //   return d3.partition()
// //       .size([2 * Math.PI, root.height + 1])
// //     (root);
// // }
//
// format = d3.format(",d");
//
// d3.csv("sunburst.csv").then(function(csv) {
//
//   console.log(csv);
//
//   sunburst_data = d3.nest()
//       .key(function(d) { return d["city"]; })
//       .key(function(d) { return d["genre"]; })
//       .key(function(d) { return d["decade"]; })
//       // .key(function(d) { return d["id"]; })
//       // .rollup(function(d) { return d.length})
//       .rollup(function(d){
//         return {
//           length : d.length,
//           movies : d
//         };
//       })
//       .entries(csv);
//
//   other_data = d3.nest()
//       .key(function(d) { return d["decade"]; })
//       .key(function(d) { return d["year"]; })
//       .key(function(d) { return d["vote_average"]; })
//       // .rollup(function(leaves) { return leaves.length; })
//       .rollup(function(d){
//         return {
//           length : d.length,
//           movies : d
//         };
//       })
//       .entries(csv);
//
//   console.log(sunburst_data[0]);
//   console.log(other_data);
//
//   drawSunburst_highlight(sunburst_data[0]);
//   });
//
//   function drawSunburst_highlight(data){
//     console.log("SUNBURST");
//
//     preroot = d3.hierarchy(data, function(d) {
//       return d.values;
//     }).sum(function (d) {
//       // console.log(d.value);
//       if(d.value != undefined)
//       {
//         // console.log(d.value.length);
//         return d.value.length;
//       }
//     })
//     .sort(function(a, b) { return b.value.length - a.value.length; });
//
//     // var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));
//
//     // console.log(root);
//     // partition(root);
//     root = d3.partition()
//         .size([2 * Math.PI, preroot.height + 1])(preroot);
//     var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, root.children.length + 1));
//
//     root.each(d => d.current = d);
//
//     arc = d3.arc()
//       .startAngle(d => d.x0)
//       .endAngle(d => d.x1)
//       .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
//       .padRadius(sun_radius * 1.5)
//       .innerRadius(d => d.y0 * sun_radius)
//       .outerRadius(d => Math.max(d.y0 * sun_radius, d.y1 * sun_radius - 1))
//
//     const path = g.append("g")
//     .selectAll("path")
//     .data(root.descendants().slice(1))
//     .join("path")
//       .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.key); })
//       .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
//       .attr("d", d => arc(d.current));
//
//     path.filter(d => d.children)
//         .style("cursor", "pointer")
//         .on("click", clicked);
//
//     path.append("title")
//         .text(d => `${d.ancestors().map(d => d.data.key).reverse().join("/")}\n${format(d.value)}`);
//
//     // const label = g.append("g")
//     //   .attr("pointer-events", "none")
//     //   .attr("text-anchor", "middle")
//     //   .style("user-select", "none")
//     //   .selectAll("text")
//     //   .data(root.descendants().slice(1))
//     //   .join("text")
//     //   .attr("dy", "0.35em")
//     //   .attr("fill-opacity", d => +labelVisible(d.current))
//     //   .attr("transform", d => labelTransform(d.current))
//     //   .text(d => d.data.name);
//
//     const parent = g.append("circle")
//       .datum(root)
//       .attr("r", sun_radius)
//       .attr("fill", "none")
//       .attr("pointer-events", "all")
//       .on("click", clicked);
//
//     // Size arcs
//     // partition(root);
//     // var arc = d3.arc()
//     //     .startAngle(function (d) { return d.x0 })
//     //     .endAngle(function (d) { return d.x1 })
//     //     // .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
//     //     // .padRadius(sun_radius * 1.5)
//     //     .innerRadius(function (d) { return d.y0 })
//     //     .outerRadius(function (d) { return d.y1 });
//     //
//     // slice = g.selectAll('g.node')
//     //          .data(root.descendants(), function(d) { return d.data.key; }); // .enter().append('g').attr("class", "node");
//     // newSlice = slice.enter()
//     //                 .append('g')
//     //                 .attr("class", "node")
//     //                 .merge(slice);
//     // slice.exit()
//     //      .remove();
//     //
//     //
//     // slice.selectAll('path')
//     //      .remove();
//     // newSlice.append('path')
//     //       .attr("display", function (d) { return d.depth ? null : "none"; })
//     //       .attr("d", arc)
//     //       .style('stroke', '#fff')
//     //       .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.key); })
//     //       .append("title")
//     //       .text(d => `Number of movies: ${format(d.value)}`);
//     //
//     // // Populate the <text> elements with our data-driven titles.
//     // slice.selectAll('text')
//     //      .remove();
//     // newSlice.append("text")
//     //     .attr("pointer-events", "none")
//     //     .attr("text-anchor", "middle")
//     //     .attr("font-size", 10)
//     //     .attr("font-family", "sans-serif")
//     //     .attr("transform", function(d) {
//     //         const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
//     //         const y = (d.y0 + d.y1) / 2;
//     //         return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
//     //     })
//     //     .attr("dy", ".35em")
//     //     .text(function(d) { return d.parent ? d.data.key : "" });
//     //
//     // newSlice.on("click", highlightSelectedSlice);
//   }
//
//   function highlightSelectedSlice(c,i) {
//
//       clicked = c;
//       var rootPath = clicked.path(root).reverse();
//       var send_me = clicked.path(root);
//       console.log(send_me);
//       // console.log(send_me[0].data.value.movies);
//
//
//       var dec = send_me[0].data.key;
//       var gen = send_me[1].data.key;
//       // var obj = null;
//
//       // other_data.forEach((item, i) => {
//       //   console.log(item);
//       //   if(!isNaN(dec) && item.key === dec)
//       //   {
//       //     console.log(item.values);
//       //     makeDentree(item);
//       //   }
//       //   else if (item.key === gen)
//       //   {
//       //     console.log(item);
//       //   }
//       // });
//
//       var movies_arr = [];
//       if (!isNaN(dec))
//       {
//         d3.select("body").select("svg#vis_2").select("*").remove();
//
//         // console.log(send_me[0].data.value.movies);
//         movies_arr = send_me[0].data.value.movies;
//         console.log(movies_arr);
//
//         makeDentree(movies_arr);
//         // makeCirclepacking(movies_arr);
//       }
//       else {
//         d3.select("body").select("svg#vis_2").select("*").remove();
//
//         send_me[0].data.values.forEach((year, index) => {
//           // console.log(year.key);
//           year.value.movies.forEach((movie, i) => {
//             // console.log(movie);
//             movies_arr.push(movie);
//           });
//
//         });
//
//         console.log(movies_arr);
//         // makeDentree(movies_arr);
//         makeCirclepacking(movies_arr);
//       }
//
//
//       rootPath.shift(); // remove root node from the array
//       console.log(dec);
//       console.log(gen);
//       console.log(other_data);
//       // console.log(other_root);
//       // console.log(obj);
//
//
//
//       // rootPath.shift(); // remove root node from the array
//
//       newSlice.style("opacity", 0.4);
//       newSlice.filter(function(d) {
//           if (d === clicked && d.prevClicked) {
//               d.prevClicked = false;
//               newSlice.style("opacity", 1);
//               return true;
//
//           } else if (d === clicked) {
//               d.prevClicked = true;
//               return true;
//           } else {
//               d.prevClicked = false;
//               return (rootPath.indexOf(d) >= 0);
//           }
//       })
//           .style("opacity", 1);
//
//       //d3.select("#sidebar").text("another!");
//
//   }
//
// ////////////////////////////////////////////////////////////////////////////////
//   function arcVisible(d) {
//     return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
//   }
//
//   function labelVisible(d) {
//     return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
//   }
//
//   function labelTransform(d) {
//     const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
//     const y = (d.y0 + d.y1) / 2 * sun_radius;
//     return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
//   }
//
//   function clicked(p) {
//     parent.datum(p.parent || root);
//
//     root.each(d => d.target = {
//       x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
//       x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
//       y0: Math.max(0, d.y0 - p.depth),
//       y1: Math.max(0, d.y1 - p.depth)
//     });
//
//     const t = g.transition().duration(750);
//
//     // Transition the data on all arcs, even the ones that aren’t visible,
//     // so that if this transition is interrupted, entering arcs will start
//     // the next transition from the desired position.
//     path.transition(t)
//         .tween("data", d => {
//           const i = d3.interpolate(d.current, d.target);
//           return t => d.current = i(t);
//         })
//       .filter(function(d) {
//         return +this.getAttribute("fill-opacity") || arcVisible(d.target);
//       })
//         .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
//         .attrTween("d", d => () => arc(d.current));
//
//     label.filter(function(d) {
//         return +this.getAttribute("fill-opacity") || labelVisible(d.target);
//       }).transition(t)
//         .attr("fill-opacity", d => +labelVisible(d.target))
//         .attrTween("transform", d => () => labelTransform(d.current));
//   }
