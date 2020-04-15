var currentSelectedIntersection;
var currentLowYear;
var currentHighYear;
var currentLowSeverity;
var currentHighSeverity;
var currentSelectedMonths;

function filterInit(){
    //all selected intersection for init
    currentSelectedIntersection = ["MJRSL", "MNRSL", "MJRML", "MNRML"];
    currentLowYear=2008;
    currentHighYear=2018;
    currentLowSeverity=0;
    currentHighSeverity=100;

    $("#rate-slider-range").slider({
        range: true,
        min: 0,
        max: 100,
        values: [0, 100],
        slide: function(event, ui) {
            $("#rate-slider-text").text(`SEVERITY RATING : ${ui.values[ 0 ]}% - ${ui.values[ 1 ]}%`);
            currentLowSeverity = Number | ui.values[0];
            currentHighSeverity = Number | ui.values[1];
            updateData();
        }
    });
    //showing all points with 0-100 severity rating
    $("#rate-slider-text").text(`SEVERITY RATING : ${0}% - ${100}%`);

    let ksiYears = [];
    ksi.forEach(accident => {
        ksiYears.push(accident.YEAR);
    });

    let minMaxKSIYears = d3.extent([...new Set(ksiYears)]);

    $("#year-slider-range").slider({
        range: true,
        min: minMaxKSIYears[0],
        max: minMaxKSIYears[1],
        values: [minMaxKSIYears[0], minMaxKSIYears[1]],
        slide: function(event, ui) {
            $("#year-slider-text").text(`YEAR : ${ui.values[ 0 ]} - ${ui.values[ 1 ]}`);
            currentLowYear = Number | ui.values[0];
            currentHighYear = Number | ui.values[1];
            updateData();
        }
    });

    //showing all points with 0-100 severity rating
    $("#year-slider-text").text(`YEAR : ${minMaxKSIYears[0]} - ${minMaxKSIYears[1]}`);

    $.fn.roundSlider.prototype._invertRange = true;
    $("#month").roundSlider({
        sliderType: "range",
        min: 1,
        max: 12,
        editableTooltip: false,
        value: "1,12",
        animation: false,
        change: function(args){
            console.log(args.value);
            let lowMonth = Number | args.value.split(",")[0];
            let highMonth = Number | args.value.split(",")[1];
            if (lowMonth === highMonth){
                currentSelectedMonths = [lowMonth];
            } else if (lowMonth < highMonth){
                currentSelectedMonths = [];
                for (let i = 0; i <= highMonth - lowMonth; i++){
                    currentSelectedMonths.push(lowMonth + i);
                }
            } else {
                currentSelectedMonths = [];
                for (let i = lowMonth; i <= 12; i++) {
                    currentSelectedMonths.push(i);
                }

                for (let i = 1; i <= highMonth; i++) {
                    currentSelectedMonths.push(i);
                }
            }
            updateData();
        },
        tooltipFormat: function(args) {
            var months = ["", "Jan", "Feb", "Mar",
                "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct",
                "Nov", "Dec"
            ];
            return months[args.value];
        },
    });

    currentSelectedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

function checkboxChange(){
    currentSelectedIntersection = [];
    $('#intersection-type-filter :input:checkbox:checked').each(function(){
        currentSelectedIntersection.push(this.value);
    });
    updateData();
}

function updateData(){
    console.log("update data");
    //console.log(currentHighYear)
    //console.log(currentLowYear)
    //console.log(currentLowSeverity)
    //console.log(currentHighSeverity)
    //console.log(currentSelectedMonths)
    //console.log(currentSelectedIntersection)

    clearOverview();
    plotSeverity();

    //all the needed filter variables will have the prefix of
    //current..... (see top)
}
