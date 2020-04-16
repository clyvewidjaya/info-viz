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
  console.log("clear")
  d3.selectAll("svg > *").remove();

  document.getElementById("legend").innerHTML="";
  overlay=null;
  data=null
}
function createSeverity(data){
  var counts={},details={},cat={};
  var positions2=intersection.map((s)=>{return s.MODGEOMETRY.slice(2,s.MODGEOMETRY.length-1).split(', ').map(parseFloat);});
  var cat2=intersection.map((s)=>{return s.CLASSIFICATION;});
  positions=[];
  positions2.forEach((item, i) => {
    positions.push(item)

  });
cat2.forEach((item, i) => {
  cat[positions[i][0]+','+positions[i][1]]=item;
});

  var quadtree = d3.quadtree().addAll(positions);
  positions.forEach((pos, i) => {
    counts[pos[0]+','+pos[1]]=0;
    details[pos[0]+','+pos[1]]='Details:<br>';
  });
  data.forEach((item, i) => {
    var year=parseInt(item.DATE.split('-')[1])
    if(item.YEAR>=currentLowYear && item.YEAR<=currentHighYear && currentSelectedMonths.indexOf(year)!=-1 && currentSelectedType.indexOf(item.ACCLASS)!=-1){
      var found=quadtree.find(item.LONGITUDE,item.LATITUDE);
      //console.log(item)
      if(currentSelectedIntersection.indexOf(cat[found[0]+','+found[1]])!=-1){
        counts[found[0]+','+found[1]]=counts[found[0]+','+found[1]]+1;
        details[found[0]+','+found[1]]=details[found[0]+','+found[1]]+" "+item.DATE+" <br> "+item.ACCLASS+" <br> "+item.INVOLVED+" <hr>"
      }
    }
  });
  for (const [ key, value ] of Object.entries(counts)) {
    if(value==0){
      //console.log(counts[key])
      delete counts[key];
      delete details[key];
    }
  }
  return {counts, details};
}

function plotSeverity(){
  var overlay;
  var parts=createSeverity(ksi);
  var severity=parts["counts"]
  var details=parts["details"]
  console.log("severity");
  var myColor = d3.scaleLinear()
    .domain([0,d3.max(Object.values(severity))])
    .range([d3.rgb("#DDE800"),d3.rgb("#E80000")]);


  var keysSorted = Object.keys(severity).sort(function(a,b){return severity[a]-severity[b]})

  data=keysSorted

  overlay = new google.maps.OverlayView();
  overlay.onRemove = function(){
      d3.selectAll("severityMark").remove();
  }
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
      .attr("class", "severityMark");
    var pop;
    overlay.draw = function() {
      if(view=="Severity summary"){
        var svgL = d3.select("#legend");
        var max=d3.max(Object.values(severity));
        svgL.append('rect').attr("x",1).attr("y",1).attr("width",130).attr("height",22).attr('fill',"grey")
        svgL.append("circle").attr("cx",20).attr("cy",12).attr("r", 8).style("fill", myColor(0))
        svgL.append("circle").attr("cx",40).attr("cy",12).attr("r", 8).style("fill", myColor(max/5.0))
        svgL.append("circle").attr("cx",60).attr("cy",12).attr("r", 8).style("fill", myColor(2*max/5.0))
        svgL.append("circle").attr("cx",80).attr("cy",12).attr("r", 8).style("fill", myColor(3*max/5.0))
        svgL.append("circle").attr("cx",100).attr("cy",12).attr("r", 8).style("fill", myColor(4*max/5.0))
        svgL.append("circle").attr("cx",120).attr("cy",12).attr("r", 8).style("fill", myColor(5*max/5.0))

        svgL.append('text').attr('x',16).attr('y',17).text(0);
        svgL.append('text').attr('x',111).attr('y',17).text(max).attr('fill','white');
      }

      var projection = this.getProjection(),
        padding = 10;
      function transformA(d) {
        if(view==="Severity summary"){
          var pos = d.value.split(',').map(parseFloat);
          d = new google.maps.LatLng(pos[1], pos[0]);
          d = projection.fromLatLngToDivPixel(d);
          return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
        }
        return d3.select(this).style("left", (1000000) + "px").style("top", (1000000) + "px");
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
        .attr("fill", (s)=>myColor(severity[s.value]))
        .on("mouseover",function(d){
          pop.html(details[d.value])
          pop.transition().style("opacity",1)
            .style("left", (d3.event.pageX-window.innerWidth*0.325) + "px")
            .style("top", (d3.event.pageY-window.innerHeight*0.6) + "px");
        })
        .on("mouseout",function(d){
          console.log("out")
          pop.transition().style("opacity",0)
        })
        .on("click",function(d){
          console.log("click")
          pop.transition().style("opacity",0)
        });
        $('.pop').remove();
        pop = layer.append("div")
          .attr("class", "pop")
          .style("opacity", 0);


    };
  };
  overlay.setMap(map);
}
function plotIntersections(){
  var overlay;
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
  var overlay;
  var quadtree = d3.quadtree();
  console.log("ksi")

  data=[]

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
