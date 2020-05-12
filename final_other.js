function makeCirclepacking(data) {
  height = 500;
  r = 8;
  pad = 14;
  diameter = Math.min(width, height);

  console.log("CIRCLEPACKING");
  // console.log(data);

  var nested_movies = d3.nest()
    .key(function(d) { return d["genre"]; })
    .key(function(d) { return d["decade"]; })
    .key(function(d) { return d["year"]; })
    // .key(function(d) { return d["vote_average"]; })
    .key(function(d) { return d["title"]; })
    .rollup(function(d) {
      // console.log(d[0]["id"]);
      return +d[0]["revenue"];
      // return +d[0]["vote_average"];
      // return {
      //   length : d[0]["vote_average"],
      //   budget : +d[0]["budget"],
      //   revenue : +d[0]["revenue"],
      //   net_worth : +d[0]["net"]
      // };
    })
    .entries(data);

  console.log(nested_movies[0]);
  other_root = d3.hierarchy(nested_movies[0], function(d) {
    return d.values;
  });

  console.log("OTHER_ROOT");
  console.log(other_root);

  other_root.sort(function(a, b) {
    return b.height - a.height || b.count - a.count;
  });

  other_root.sum(d => {
    console.log(d);
    // if(d.value === 0)
    // {
    //   console.log(d.value);
    //   return 1000;
    // }
    return d.value;
  });

  // other_root.count();

  i = 0;

  other_root.each(function(node) {
    // copy this calculation since value is sometimes overwritten
   node.data.leaves = node.value;
   node.id = i++;
   // console.log(node.data);
   // if(node.value !== undefined)
   // {
   //   console.log(node.value);
   // }
  })

  console.log(other_root.descendants());

  //other_root.sum(row => row.values);

  other_root.each(function(node) {
    // copy this calculation since value is sometimes overwritten
    node.data.total = node.value;
  })

  // other_root.sort(function(a, b) {
  //   return b.height - a.height || b.count - a.count;
  // });
  //
  // // make sure value is set
  // other_root.sum(d => d.size)

  other_color = d3.scaleSequential([other_root.height, 0], d3.interpolateViridis);

  let layout = d3.pack()
    .padding(r)
    .size([diameter - 2 * pad, diameter - 2 * pad]);

  layout(other_root);

  let svg = d3.select("body").select("svg#vis_2")
      .style("width", diameter)
      .style("height", diameter);

  let plot = svg.append("g")
    .attr("id", "plot")
    .attr("transform", translate(pad, pad));

  drawNodes_2(plot.append("g"), other_root.descendants(), false);
}

function drawNodes_2(g, nodes, raise) {
  let circles = g.selectAll('circle')
    .data(nodes, node => node.data.key)
    .enter()
    .append('circle')
      .attr('r', d => d.r ? d.r : r)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('id', d => d.data.key)
      .attr('class', 'node')
      .style('fill', d => other_color(d.depth));

  setupEvents_2(g, circles, raise);
}

function setupEvents_2(g, selection, raise) {
  selection.on('mouseover.highlight', function(d) {
    // if (d.height === 0 || d.height === 1) {
    if(d.height === 0) {
      selection.filter(e => (d.data.key !== e.data.key && e.height !== 2 && e.data.key !== d.parent.data.key))// function?
        .transition()
        .duration(500)
        .attr("fill-opacity", "0.4")
        .style("stroke", "")
    }

    // https://github.com/d3/d3-hierarchy#node_path
    // returns path from d3.select(this) node to selection.data()[0] root node
    let path = d3.select(this).datum().path(selection.data()[0]);

    // select all of the nodes on the shortest path
    let update = selection.data(path, node => node.data.key);
    // let update = selection.data(path, node => node.x && node.y);
    // let update = selection.data(path, node => node.data.id && node.height);

    // highlight the selected nodes
    update.classed('selected', true);

    if (raise) {
      update.raise();
    }
  });

  selection.on('mouseout.highlight', function(d) {
    selection
      .transition()
      .attr("fill-opacity", "1")
      .style('stroke', 'black'); 
    let path = d3.select(this).datum().path(selection.data()[0]);
    let update = selection.data(path, node => node.data.key);
    // let update = selection.data(path, node => node.x && node.y);
    // let update = selection.data(path, node => node.data.id && node.height);
    update.classed('selected', false);
  });

  // show tooltip text on mouseover (hover)
  selection.on('mouseover.tooltip', function(d) {
    showTooltip_2(g, d3.select(this));
  });

  // remove tooltip text on mouseout
  selection.on('mouseout.tooltip', function(d) {
    g.select("#tooltip").remove();
  });
}

function showTooltip_2(g, node) {
  let gbox = g.node().getBBox();     // get bounding box of group BEFORE adding text
  let nbox = node.node().getBBox();  // get bounding box of node

  // calculate shift amount
  let dx = nbox.width / 2;
  let dy = nbox.height / 2;

  // retrieve node attributes (calculate middle point)
  let x = nbox.x + dx;
  let y = nbox.y + dy;

  // get data for node
  let datum = node.datum();

  // remove "java.base." from the node name
  let rating = datum.data.key; //.replace("java\.base\.", "");
  let title = datum.data.value; // revenue
  console.log("datum");
  // console.log(datum.data.value["length"]);
  console.log(title)

  // use node name and total size as tooltip text
  // let text = `${name} (${numberFormat(datum.data.total)}, ${numberFormat(datum.data.leaves)}n)`;
  let text = title === undefined ? `${rating}` : `${rating} REVENUE --> $${title}`;
  // let text = `${rating}`;
  // if(title === undefined)
  // {
  //   text = `${rating}`;
  //   // if(typeof(title) !== "object")
  //   if(title["length"] !== undefined)
  //   {
  //     // title = datum.data.key;
  //     text = `${title["length"]}\n${rating}`;
  //   }
  //   // else
  //   // {
  //   //   text = `${rating}`;
  //   // }
  // }
  // else if(title["length"] === undefined)
  // {
  //
  // }
  // else
  // {
  //   text = `${title}\n${rating}`;
  //   // text = `${rating}`;
  // }
  // else if(typeof(title) !== "object")
  // {
  //   // title = datum.data.key;
  //   text = `${title}\n${rating}`;
  // }

  // create tooltip
  let tooltip = g.append('text')
    .text(text)
    .attr('x', x)
    .attr('y', y)
    .attr('dy', -dy - 8) // shift upward above circle
    .attr('text-anchor', 'middle') // anchor in the middle
    .attr('id', 'tooltip');

  // it is possible the tooltip will fall off the edge of the
  // plot area. we can detect when this happens, and set the
  // text anchor appropriately

  // get bounding box for the text
  let tbox = tooltip.node().getBBox();

  // if text will fall off left side, anchor at start
  if (tbox.x < gbox.x) {
    tooltip.attr('text-anchor', 'start');
    tooltip.attr('dx', -dx); // nudge text over from center
  }
  // if text will fall off right side, anchor at end
  else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
    tooltip.attr('text-anchor', 'end');
    tooltip.attr('dx', dx);
  }

  // if text will fall off top side, place below circle instead
  if (tbox.y < gbox.y) {
    tooltip.attr('dy', dy + tbox.height);
  }
}









// // var other_data
// // var other_root
// var other_color
// var r = 5;
// let generator = d3.linkVertical()
//   .x(d => d.x)
//   .y(d => d.y);
// console.log("final other js");
// console.log(other_root);
// // var svg = d3.select("body").select("svg#vis_2");
//
// // other_color = d3.scaleSequential([other_root.height, 0], d3.interpolateViridis);
// //
// // other_root.sort(function(a, b) {
// //   return b.height - a.height || b.count - a.count;
// // });
// //
// // other_root.sum(d => d.value);
// //
// // makeTreemap(other_root);
// //
// // other_root.count();
// //
// // other_root.each(function(node) {
// //   // copy this calculation since value is sometimes overwritten
// //  node.data.leaves = node.value;
// // })
// //
// // //other_root.sum(row => row.values);
// //
// // other_root.each(function(node) {
// //   // copy this calculation since value is sometimes overwritten
// //   node.data.total = node.value;
// // })
// //
// // // other_root.sort(function(a, b) {
// // //   return b.height - a.height || b.count - a.count;
// // // });
//
// function makeDentree(obj){
//
//   let item = obj;
//
//   console.log("DENTREE");
//
//   var width = 960;
//   var height = 500;
//   var pad = 14;
//   var diameter = Math.min(width, height);
//   // var r = 5;
//
//   var nested_movies = d3.nest()
//     .key(function(d) { return d["genre"]; })
//     .key(function(d) { return d["year"]; })
//     // .key(function(d) { return d["decade"]; })
//     .key(function(d) { return d["vote_average"]; })
//     .rollup(function(d) {
//       // console.log(d[0]["id"]);
//       return d[0]["title"];
//     })
//     .entries(item);
//
//   console.log(nested_movies[0]);
//   other_root = d3.hierarchy(nested_movies[0], function(d) {
//     return d.values;
//   });
//
//   console.log("ROOT");
//   console.log(other_root);
//
//   other_color = d3.scaleSequential([other_root.height, 0], d3.interpolateViridis);
//
//   other_root.sort(function(a, b) {
//     return b.height - a.height || b.count - a.count;
//   });
//
//   other_root.sum(d => d.value);
//
//   // makeTreemap(other_root);
//
//   other_root.count();
//
//   other_root.each(function(node) {
//     // copy this calculation since value is sometimes overwritten
//    node.data.leaves = node.value;
//   })
//
//   //other_root.sum(row => row.values);
//
//   other_root.each(function(node) {
//     // copy this calculation since value is sometimes overwritten
//     node.data.total = node.value;
//   })
//
//
//
//
//
//
//   let layout = d3.cluster().size([2 * Math.PI, (diameter / 2) - pad]);
//
//   layout(other_root);
//
//   other_root.each(function(node) {
//     node.theta = node.x;
//     node.radial = node.y;
//
//     var point = toCartesian(node.radial, node.theta);
//     node.x = point.x;
//     node.y = point.y;
//   });
//
//   let svg = d3.select("body").select("svg#vis_2")
//       .style("width", width)
//       .style("height", height);
//
//   // let svg = d3.select("body").select("vis_2")
//   //     .append("svg")
//   //     .style("width", width)
//   //     .style("height", height);
//
//   let plot = svg.append("g")
//     .attr("id", "plot")
//     .attr("transform", translate(width / 2, height / 2));
//
//   drawLinks(plot.append("g"), other_root.links(), generator);
//   drawNodes(plot.append("g"), other_root.descendants(), true);
// }
//
// function toCartesian(r, theta) {
//   return {
//     x: r * Math.cos(theta),
//     y: r * Math.sin(theta)
//   };
// }
//
// function translate(x, y) {
//   return 'translate(' + String(x) + ',' + String(y) + ')';
// }
//
// function drawLinks(g, links, generator) {
//   let paths = g.selectAll('path')
//     .data(links)
//     .enter()
//     .append('path')
//     .style("stroke", "gray")
//     .attr('d', generator)
//     .attr('class', 'link');
// }
//
// function drawLinks(g, links, generator) {
//   let paths = g.selectAll('path')
//     .data(links)
//     .enter()
//     .append('path')
//     .style("stroke", "gray")
//     .attr('d', generator)
//     .attr('class', 'link');
// }
//
// function drawNodes(g, nodes, raise) {
//   let circles = g.selectAll('circle')
//     .data(nodes, node => node.data.key)
//     .enter()
//     .append('circle')
//       .attr('r', d => d.r ? d.r : r)
//       .attr('cx', d => d.x)
//       .attr('cy', d => d.y)
//       .attr('id', d => d.data.key)
//       .attr('class', 'node')
//       .style('fill', d => other_color(d.depth));
//
//   setupEvents(g, circles, raise);
// }
//
// function setupEvents(g, selection, raise) {
//   selection.on('mouseover.highlight', function(d) {
//     if (d.height === 0 || d.height === 1) {
//       selection.filter(e => (d.data.key !== e.data.key && e.height !== 2 && e.data.key !== d.parent.data.key))// function?
//         .transition()
//         .duration(500)
//         .attr("fill-opacity", "0.1")
//         .style("stroke", "")
//     }
//
//     // https://github.com/d3/d3-hierarchy#node_path
//     // returns path from d3.select(this) node to selection.data()[0] root node
//     let path = d3.select(this).datum().path(selection.data()[0]);
//
//     // select all of the nodes on the shortest path
//     // let update = selection.data(path, node => node.data.key);
//     let update = selection.data(path, node => node.x && node.y);
//
//     // highlight the selected nodes
//     update.classed('selected', true);
//
//     if (raise) {
//       update.raise();
//     }
//   });
//
//   selection.on('mouseout.highlight', function(d) {
//     selection
//       .transition()
//       .attr("fill-opacity", "1")
//       .style('stroke', 'black'); 
//     let path = d3.select(this).datum().path(selection.data()[0]);
//     // let update = selection.data(path, node => node.data.key);
//     let update = selection.data(path, node => node.x && node.y);
//     update.classed('selected', false);
//   });
//
//   // show tooltip text on mouseover (hover)
//   selection.on('mouseover.tooltip', function(d) {
//     showTooltip(g, d3.select(this));
//   });
//
//   // remove tooltip text on mouseout
//   selection.on('mouseout.tooltip', function(d) {
//     g.select("#tooltip").remove();
//   });
// }
//
// function showTooltip(g, node) {
//   let gbox = g.node().getBBox();     // get bounding box of group BEFORE adding text
//   let nbox = node.node().getBBox();  // get bounding box of node
//
//   // calculate shift amount
//   let dx = nbox.width / 2;
//   let dy = nbox.height / 2;
//
//   // retrieve node attributes (calculate middle point)
//   let x = nbox.x + dx;
//   let y = nbox.y + dy;
//
//   // get data for node
//   let datum = node.datum();
//
//   // remove "java.base." from the node name
//   let rating = datum.data.key; //.replace("java\.base\.", "");
//   let title = datum.data.value;
//   // console.log("datum");
//   // console.log(datum.data);
//
//   // use node name and total size as tooltip text
//   // let text = `${name} (${numberFormat(datum.data.total)}, ${numberFormat(datum.data.leaves)}n)`;
//   let text = title === undefined ? `${rating}` : `${title}\n${rating}`;
//
//   // create tooltip
//   let tooltip = g.append('text')
//     .text(text)
//     .attr('x', x)
//     .attr('y', y)
//     .attr('dy', -dy - 4) // shift upward above circle
//     .attr('text-anchor', 'middle') // anchor in the middle
//     .attr('id', 'tooltip');
//
//   // it is possible the tooltip will fall off the edge of the
//   // plot area. we can detect when this happens, and set the
//   // text anchor appropriately
//
//   // get bounding box for the text
//   let tbox = tooltip.node().getBBox();
//
//   // if text will fall off left side, anchor at start
//   if (tbox.x < gbox.x) {
//     tooltip.attr('text-anchor', 'start');
//     tooltip.attr('dx', -dx); // nudge text over from center
//   }
//   // if text will fall off right side, anchor at end
//   else if ((tbox.x + tbox.width) > (gbox.x + gbox.width)) {
//     tooltip.attr('text-anchor', 'end');
//     tooltip.attr('dx', dx);
//   }
//
//   // if text will fall off top side, place below circle instead
//   if (tbox.y < gbox.y) {
//     tooltip.attr('dy', dy + tbox.height);
//   }
// }
