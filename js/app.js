var width = 600;
var height = 400;

var AudioContext = window.AudioContext || window.webkitAudioContext;
var context =  new AudioContext();
var source = context.createBufferSource();

// Create analyser
var analyser = context.createAnalyser();
analyser.fftSize =  256;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);

// Make request
var xhr = new XMLHttpRequest();
var url = 'test.mp3';
xhr.open('GET', url);
xhr.responseType = "arraybuffer";
xhr.onload = function() {
    context.decodeAudioData(this.response, function(data) {
        source.buffer = data;
        source.connect(analyser);
        analyser.connect(context.destination);
        source.start(0);
    });
};
xhr.send();

// d3 stuff
var x = d3.scale.linear()
    .rangeRound([0, width])
    .domain([0,  analyser.frequencyBinCount * 0.6]);

var y = d3.scale.linear()
    .range([0, height])
    .domain([analyser.minDecibels, analyser.maxDecibels / 2])
    .clamp(true);

var color = d3.scale.linear()
    .range(['lightblue', 'lightgreen', 'red'])
    .domain([analyser.minDecibels, analyser.maxDecibels / 2])
    .clamp(true);

var convas = d3.select(document.body).append('svg')
    .attr({
        width: width,
        height: height
    });



function redraw() {
    analyser.getFloatFrequencyData(dataArray);
    var bars = convas.selectAll('circle').data(dataArray);
    bars
        .attr('cx', function(d, i) { return x(i); })
        .attr('cy', function(d, i) { return y(d); })
        .attr('r', 5)
        .style('fill', function(d) { return color(d); });

    bars.enter()
        .append('circle')
        .attr('cx', function(d, i) { return x(i); })
        .attr('cy', function(d, i) { return y(i); })
        .attr('r', 5)
        .style('fill', function(d) { return color(d); });
    bars.exit()
        .remove();
    window.requestAnimationFrame(redraw);
}
redraw();
