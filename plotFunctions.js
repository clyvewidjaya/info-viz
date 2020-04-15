var overlay;
function clearOverview(){
  console.log('tag',document.getElementsByTagName('svg'))
  if(document.getElementsByTagName('svg').length!=0){
    var tag=document.getElementsByTagName('svg')[0].parentElement;
    tag.parentNode.removeChild(tag);
  }
  //console.log(document.getElementsByTagName('svg')[0].parentElement.parentElement);
}
function createSeverity(data){
  //intersection=intersection.slice(0,500);
  var counts={}, traffic={}
  var positions_2=intersection.map((s)=>{return s.MODGEOMETRY.slice(2,s.MODGEOMETRY.length-1).split(', ').map(parseFloat);});
  var positions=[]
  positions_2.forEach((item, i) => {
    if(currentSelectedIntersection.indexOf(intersection[i].CLASSIFICATION)!=-1){
      positions.push(item)
    }
    //console.log(intersection[i],item)
  });

  var quadtree = d3.quadtree().addAll(positions);
  positions.forEach((pos, i) => {
    counts[pos[0]+','+pos[1]]=0;
    traffic[pos[0]+','+pos[1]]=0;
  });
  data.forEach((item, i) => {
    var year=parseInt(item.DATE.split('-')[1])
    //console.log(item.YEAR>=currentLowYear, item.YEAR<=currentHighYear)
    //console.log(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear)
    if(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear && currentSelectedMonths.indexOf(year)!=-1){
      var found=quadtree.find(item.LONGITUDE,item.LATITUDE);
      counts[found[0]+','+found[1]]=counts[found[0]+','+found[1]]+1;
    }
  });
  for (const [ key, value ] of Object.entries(counts)) {
    if(value==0){
      delete counts[key];
    }
  }

  return counts;
}

function plotSeverity(){
  var severity=createSeverity(ksi);
  console.log(severity);
  //console.log(d3.max(Object.values(severity)));
  //console.log(d3.min(Object.values(severity)));
  var myColor = d3.scaleSequential().domain([d3.min(Object.values(severity)),d3.max(Object.values(severity))])
    .interpolator(d3.interpolatePuRd);
  console.log(myColor(2))
  console.log(myColor(10))
  data=severity

  overlay = new google.maps.OverlayView();
  overlay.onRemove = function(){}
  overlay.onAdd = function() {
  var layer = d3.select(this.getPanes().overlayLayer).append("div")
    .attr("class", "severityMark");
  overlay.draw = function() {
    var projection = this.getProjection(),
      padding = 10;

    var marker = layer.selectAll("svg")
      .data(d3.entries(data))
      .each(transform)
      .enter().append("svg")
      .each(transform)
      .attr("class", "marker");
    marker.append("circle")
      .attr("r", padding/2.0)
      .attr("cx", padding)
      .attr("cy", padding)
      .attr("fill", (s)=>myColor(s.value));
    function transform(d) {
      var pos = d.key.split(',').map(parseFloat);
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
function plotIntersections(){
  intersection=intersection.slice(0,500);
  console.log(intersection)
  data=intersection
  overlay = new google.maps.OverlayView();
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
  overlay = new google.maps.OverlayView();
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
