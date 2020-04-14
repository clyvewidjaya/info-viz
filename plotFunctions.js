function plotIntersections(){
  intersection=intersection.slice(0,500);
  console.log(intersection)
  data=intersection
  var overlay = new google.maps.OverlayView();
  overlay.onAdd = function() {
  var layer = d3.select(this.getPanes().overlayLayer).append("div")
    .attr("class", "junctions");
  overlay.draw = function() {
    var projection = this.getProjection(),
      padding = 2;

    var marker = layer.selectAll("svg")
      .data(d3.entries(data))
      .each(transform)
      .enter().append("svg")
      .each(transform)
      .attr("class", "marker");
    marker.append("circle")
      .attr("r", padding/2.0)
      .attr("cx", padding)
      .attr("cy", padding);
    function transform(d) {
      var pos = d.value.MODGEOMETRY.slice(2,d.value.MODGEOMETRY.length-1).split(', ').map(parseFloat);
      d = new google.maps.LatLng(pos[1], pos[0]);
      d = projection.fromLatLngToDivPixel(d);
      return d3.select(this)
        .style("left", (d.x - padding) + "px")
        .style("top", (d.y - padding) + "px");
      }
    };
  };
  overlay.setMap(map);
}
function plotAccidents(){
  console.log(ksi)
  data=ksi
  var overlay = new google.maps.OverlayView();
  overlay.onAdd = function() {
  var layer = d3.select(this.getPanes().overlayLayer).append("div")
    .attr("class", "accident");
  overlay.draw = function() {
    var projection = this.getProjection(),
      padding = 6;

    var marker = layer.selectAll("svg")
      .data(d3.entries(data))
      .each(transform)
      .enter().append("svg")
      .each(transform)
      .attr("class", "marker");
    marker.append("circle")
      .attr("r", padding/2.0)
      .attr("cx", padding)
      .attr("cy", padding);
    function transform(d) {
      //console.log(d.value);
      var pos = [d.value.LATITUDE,d.value.LONGITUDE];
      d = new google.maps.LatLng(pos[0], pos[1]);
      d = projection.fromLatLngToDivPixel(d);
      return d3.select(this)
        .style("left", (d.x - padding) + "px")
        .style("top", (d.y - padding) + "px");
      }
    };
  };
  overlay.setMap(map);
}
