var hash = location.hash;
var bardata = [];
var sentiment = [];
var topics = [];
    d3.tsv('data.tsv', function(data) {
        console.log(data);

        for (key in data) {
            bardata.push(data[key].interactions)
            sentiment.push(data[key].sentiment)
            topics.push(data[key].topics)
        }

    var margin = { top: 30, right: 30, bottom: 40, left:50 }

    var height = 400 - margin.top - margin.bottom,
        width = 960 - margin.left - margin.right,
        barWidth = 50,
        barOffset = 5;

    var tempColor;

    var colors = d3.scale.linear()
    .domain([0, 50, 100])
    .range(['#FF1C38', '#3696DF', '#36DF4B'])

    var yScale = d3.scale.linear()
            .domain([0, d3.max(bardata)])
            .range([0, 120]);

    var xScale = d3.scale.ordinal()
            .domain(d3.range(0, bardata.length))
            .rangeBands([0, width], 0.2)

    var tooltip = d3.select('body').append('div')
            .style('position', 'absolute')
            .style('padding', '0 10px')
            .style('background', 'white')
            .style('opacity', 0)
    
    
    //d3.select('#key').html(topics)

    var myChart = d3.select('#chart').append('svg')
        .style('background', '#EEEEEE')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
        .selectAll('rect').data(bardata)
        .enter().append('rect')
            .style('fill', function(d,i) {
                return colors(sentiment[i]);
            })
            .attr('width', xScale.rangeBand())
            .attr('x', function(d,i) {
                return xScale(i);
            })
            .attr('height', 0)
            .attr('y', height)

        .on('mouseover', function(d,i) {

            tooltip.transition()
                .style('opacity', .9)

            tooltip.html(topics[i])
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top',  (d3.event.pageY - 30) + 'px')


            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .5)
                .style('fill', 'yellow')
        })

        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
        })
        
        .on('click', function(d,i) {
            window.location.href = 'folder.html#'+topics[i];
        })

    myChart.transition()
        .attr('height', function(d) {
            return yScale(d);
        })
        .attr('y', function(d) {
            return height - yScale(d);
        })
        .delay(function(d, i) {
            return i * 20;
        })
        .duration(1000)


    var hAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickValues(xScale.domain().filter(function(d, i) {
            return (["mp1", "mp2", "mp3", "mp4", "mp5", "mp6", "mp7", "mp8", "mp9", "mp15", "exam", "logistics", "other", "mp0", "c", "systemcalls","synchronization","system-theory", "osx"]);
        }))

    var hGuide = d3.select('svg').append('g')
        hAxis(hGuide)
        hGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
        hGuide.selectAll('path')
            .style({ fill: 'none', stroke: "#000"})
        hGuide.selectAll('line')
            .style({ stroke: "#000"})
});
