var overlay;
var here;
function drawSelected(){
  d3.selectAll("marker").remove()
  if(view==="Accident view"){
    plotAccidents();
  }
  else if(view==="Intersection summary"){
    plotIntersections();
  }
  else if(view==="Severity summary"){
    plotSeverity();
  }
}
function clearOverview(){
  //console.log('tag',document.getElementsByTagName('svg'))
  d3.selectAll("svg > *").remove();
/*  if(document.getElementsByTagName('svg').length!=0){
    var tag=document.getElementsByTagName('svg')[0].parentElement;
    tag.parentNode.removeChild(tag);
  }*/
  overlay=null;
  data=null
  //console.log(document.getElementsByTagName('svg')[0].parentElement.parentElement);
}
function createSeverity(data){
  //intersection=intersection.slice(0,500);
  var counts={}
  var positions2=intersection.map((s)=>{return s.MODGEOMETRY.slice(2,s.MODGEOMETRY.length-1).split(', ').map(parseFloat);});
  positions=[];
  positions2.forEach((item, i) => {

    if(currentSelectedIntersection.indexOf(intersection[i].CLASSIFICATION)!=-1){
      //console.log(currentSelectedIntersection,intersection[i].CLASSIFICATION,currentSelectedIntersection.indexOf(intersection[i].CLASSIFICATION))
      positions.push(item)
    }
    //console.log(intersection[i],item)
  });

  var quadtree = d3.quadtree().addAll(positions);
  positions.forEach((pos, i) => {
    counts[pos[0]+','+pos[1]]=0;
  });
  data.forEach((item, i) => {
    var year=parseInt(item.DATE.split('-')[1])
    //console.log(item.YEAR>=currentLowYear, item.YEAR<=currentHighYear)
    //console.log(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear)
    if(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear && currentSelectedMonths.indexOf(year)!=-1 && currentSelectedType.indexOf(item.ACCLASS)!=-1){
      var found=quadtree.find(item.LONGITUDE,item.LATITUDE);
      //console.log(found)
      counts[found[0]+','+found[1]]=counts[found[0]+','+found[1]]+1;
    }
  });
  for (const [ key, value ] of Object.entries(counts)) {
    if(value==0){
      //console.log(counts[key])
      delete counts[key];
    }
  }

  return counts;
}

function plotSeverity(){

  var severity=createSeverity(ksi);
  console.log("severity");
  //console.log(d3.max(Object.values(severity)));
  //console.log(d3.min(Object.values(severity)));
  var myColor = d3.scaleSequential().domain([1,d3.max(Object.values(severity))])
    .interpolator(d3.interpolatePuRd);
  //console.log(typeof(severity))
  var keysSorted = Object.keys(severity).sort(function(a,b){return severity[a]-severity[b]})
  //console.log(keysSorted)

  //console.log(severity.sort(d3.ascending))
  data=keysSorted

  overlay = new google.maps.OverlayView();
  overlay.onRemove = function(){
      d3.selectAll("severityMark").remove();
  }
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      .attr("class", "severityMark");
    overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 10;
      //console.log(data[0])
      //console.log(Object.keys(severity))
      function transformA(d) {
        if(view==="Severity summary"){
          //console.log("A")
          //console.log(d.value);
          var pos = d.value.split(',').map(parseFloat);
          d = new google.maps.LatLng(pos[1], pos[0]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
        return d3.select(this).style("left", (1000000 - padding) + "px").style("top", (1000000 - padding) + "px");
      }
      var marker = layer.selectAll("svg")
        .data(d3.entries(data))
        .each(transformA)
        .enter().append("svg")
        .each(transformA)
        .attr("class", "marker");
      marker.append("circle")
        .attr("r", padding/2.0)
        .attr("cx", padding)
        .attr("cy", padding)
        .attr("fill", (s)=>myColor(severity[s.value]));
    };
  };
  overlay.setMap(map);
}
function plotIntersections(){
  console.log("intersection")
  data=intersection//.slice(0,500);
  overlay = new google.maps.OverlayView();
  overlay.onRemove = function(){
      d3.selectAll("junctions").remove();
  }
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      .attr("class", "junctions");
    overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 2;

      function transformB(d) {
        if(view==="Intersection summary"){
          //console.log("B");
          var pos = d.value.MODGEOMETRY.slice(2,d.value.MODGEOMETRY.length-1).split(', ').map(parseFloat);
          d = new google.maps.LatLng(pos[1], pos[0]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
        return d3.select(this).style("left", (1000000 - padding) + "px").style("top", (1000000 - padding) + "px");;
      }
      var marker = layer.selectAll("svg")
        .data(d3.entries(data))
        .each(transformB)
        .enter().append("svg")
        .each(transformB)
        .attr("class", "marker");
      marker.append("circle")
        .attr("r", padding/2.0)
        .attr("cx", padding)
        .attr("cy", padding);
    };
  };
  overlay.setMap(map);
}
function plotAccidents(){
  var quadtree = d3.quadtree();
  console.log("ksi")

  data=[]//ksi

  ksi.forEach((item, i) => {
    var month=parseInt(item.DATE.split('-')[1])
    if(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear && currentSelectedType.indexOf(item.ACCLASS)!=-1 && currentSelectedMonths.indexOf(month)!=-1){
      data.push(item)
    }
  });

  overlay = new google.maps.OverlayView();
  overlay.onRemove= function(){
    d3.selectAll("accident").remove();
  }
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      .attr("class", "accident");

    overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 6;
        function transformC(d) {
          if(view==="Accident view"){
            //console.log("C");
            if(noOverLap==0){
              var pos = [d.value.LATITUDE,d.value.LONGITUDE];
            }
            else{
              var pos= empty(d.value.LATITUDE,d.value.LONGITUDE,quadtree);
              quadtree.add([d.value.LATITUDE,d.value.LONGITUDE])
            }
            d = new google.maps.LatLng(pos[0], pos[1]);
            d = projection.fromLatLngToDivPixel(d);
            return d3.select(this)
              .style("left", (d.x - padding) + "px")
              .style("top", (d.y - padding) + "px");
          }
          return d3.select(this).style("left", (1000000 - padding) + "px").style("top", (1000000 - padding) + "px");;
        }

      var marker = layer.selectAll("svg")
        .data(d3.entries(data))
        .each(transformC)
        .enter().append("svg")
        .each(transformC)
        .attr("class", "marker");
      marker.append("circle")
        .attr("r", padding/2.0)
        .attr("cx", padding)
        .attr("cy", padding);
      //console.log(Math.random())

    };
  };
  overlay.setMap(map);
}
function empty(x,y,quadtree){
  //console.log("x,y:",x,y)
  if(quadtree.find(x,y,0.00001)!=-1){
    //console.log(x,y)
    //console.log(x+(Math.random()-0.5)/1000,y+(Math.random()-0.5)/1000)
    return [x+(Math.cos(x)+0.4)/100,y+(Math.sin(y)+0.4)/100];
  }
  /*var i=0,a=x,b=y;
  while(quadtree.find(x,y,0.00001)!=-1){
    //console.log("a,b:",a,b)
    a=x+Math.cos(i)/1000.0
    b=y+Math.sin(i)/1000.0
    i+=0.1
    if(i>50){
      break;
    }
  }*/
  return [x,y];
}
