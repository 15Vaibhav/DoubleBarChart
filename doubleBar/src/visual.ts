module powerbi.extensibility.visual {
    interface DataPoint {
        categories: string,
        value_1_values: number
        value_1_growth: number
        value_2_values: number
        value_2_growth: number
    };
    interface ViewModel {
        dataPoints: DataPoint[];
        maxValue_Y: number;
        minValue_Y: number;
        category_1: string;
        category_2: string
    };

    "use strict";
    export class Visual implements IVisual {
        private settings: VisualSettings;
        private visualSettings: VisualSettings;

        private viewModel: ViewModel;
        private svg: d3.Selection<SVGElement>;
        private xAxisGroup: d3.Selection<SVGElement>;
        private yAxisGroup: d3.Selection<SVGElement>;
        private BarGroup: d3.Selection<SVGElement>;

        private setting = {
            axis: {
                x: { padding: 30 },
                y: { padding: 30 }
            }
        };


        constructor(options: VisualConstructorOptions) {
            this.svg = d3.select(options.element)
                .append('svg')
                .classed('svgClass', true);
            this.xAxisGroup = this.svg.append('g')
                .classed('x-axis', true)
            this.yAxisGroup = this.svg.append('g')
                .classed('y-axis', true)
            this.BarGroup = this.svg.append('g')
                .classed('barGroup', true)
        }

        public update(options: VisualUpdateOptions) {
            this.viewModel = this.getViewModel(options);
            console.log('this is the view model', this.viewModel)
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            console.log('this is the view model', this.settings.Arc.axis_text_size)


            let width: number = options.viewport.width;
            let height: number = options.viewport.height;
            this.svg.attr({ width: width, height: height });
            this.svg.selectAll('path').remove()
            this.svg.selectAll('barGroup').remove()
            this.svg.selectAll('rect').remove()
            this.svg.selectAll('.text3').remove()
            this.svg.selectAll('.text4').remove()
            this.svg.selectAll('.text2').remove()


            function wrap(text, width) {
                console.log('width', width)
                text.each(function () {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (this.getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }


            let xScale = d3.scale.ordinal()
                .domain(this.viewModel.dataPoints.map(d => d.categories))
                .rangeRoundBands([this.setting.axis.x.padding, width - this.setting.axis.x.padding], .2);




            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickSize(2)
            this.xAxisGroup.call(xAxis)
                .attr({ transform: 'translate(' + 0 + ',' + (height - 3 * this.setting.axis.y.padding) + ')' })
                .selectAll("text")
                .style("color", "black")
                .style("font-size", this.settings.Arc.axis_text_size + "px")
                .style('font-weight', 'bolder')
                .style("font-family", 'sans-serif')
                .call(wrap, 10);


            let yScale = d3.scale.linear()
                .domain([0, 110])
                .range([height - 3 * this.setting.axis.y.padding, 1.5 * this.setting.axis.y.padding])

            let yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .tickSize(2)
                .tickFormat(function (d) { return <any>null });

            this.yAxisGroup
                .call(yAxis)
                .attr({ transform: 'translate(' + (this.setting.axis.y.padding) + ',0)' })
            let red = this.settings.Arc.text_negative
            let green = this.settings.Arc.text_postive
            function colorset(color) {
                console.log('color_d', color)
                let x = '';

                if (parseInt(color) >= 0) {
                    console.log('dfdf')
                    x = green
                } else {
                    x = red
                }
                return x
                // return '#D3D3D3'
            }

            for (let i = 0; i < (this.viewModel.dataPoints.length); i++) {
                let x = colorset(this.viewModel.dataPoints[i].value_1_growth)

                let bars_1 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_1.enter()
                    .append("rect")
                    .attr({
                        width: xScale.rangeBand() / 2,
                        height: height - yScale(100) - 3 * this.setting.axis.y.padding,
                        y: yScale(100),
                        x: xScale(this.viewModel.dataPoints[i].categories)
                    })
                    .style('fill', this.settings.Arc.backgroud_bar)

                let bar_1 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bar_1.enter()
                    .append("rect")
                    .attr({
                        width: xScale.rangeBand() / 2,
                        height: height - yScale(this.viewModel.dataPoints[i].value_1_values) - 3 * this.setting.axis.y.padding,
                        y: yScale(this.viewModel.dataPoints[i].value_1_values),
                        x: xScale(this.viewModel.dataPoints[i].categories)
                    })
                    .style('fill', this.settings.Arc.first_bar)


                this.BarGroup.append("text")
                    .attr({
                        y: yScale(this.viewModel.dataPoints[i].value_1_values) - 4,
                        x: xScale(this.viewModel.dataPoints[i].categories) + xScale.rangeBand() / 4
                    })
                    .text((Math.round(this.viewModel.dataPoints[i].value_1_values)) + '%')
                    .style('text-anchor', 'right')
                    .style('fill', this.settings.Arc.first_bar)
                    .style('font-size', width * .001 + 'em')
                    .classed('text3', true)
                    .style('text-anchor', 'middle')


                let bars_2 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_2.enter()
                    .append("rect")
                    .attr({
                        width: xScale.rangeBand() / 2,
                        height: height - yScale(100) - 3 * this.setting.axis.y.padding,
                        y: yScale(100),
                        x: xScale(this.viewModel.dataPoints[i].categories) + xScale.rangeBand() / 2 + 4
                    })
                    .style('fill', this.settings.Arc.backgroud_bar)

                let bar_2 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bar_2.enter()
                    .append("rect")
                    .attr({
                        width: xScale.rangeBand() / 2,
                        height: height - yScale(this.viewModel.dataPoints[i].value_2_values) - 3 * this.setting.axis.y.padding,
                        y: yScale(this.viewModel.dataPoints[i].value_2_values),
                        x: xScale(this.viewModel.dataPoints[i].categories) + xScale.rangeBand() / 2 + 4

                    })
                    .style('fill', this.settings.Arc.seconed_bar)


                this.BarGroup.append("text")
                    .attr({
                        y: yScale(this.viewModel.dataPoints[i].value_2_values) - 4,
                        x: xScale(this.viewModel.dataPoints[i].categories) + 3 * xScale.rangeBand() / 4 + 4
                    })
                    .text(Math.round(this.viewModel.dataPoints[i].value_2_values) + '%')
                    .style('text-anchor', 'middle')
                    .style('fill', this.settings.Arc.seconed_bar)
                    .style('font-size', width * .001 + 'em')
                    .style('font-family', 'arial')
                    .classed('text4', true)




                let bars_5 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_5.enter()
                    .append("rect")
                bars_5.attr({
                    width: xScale.rangeBand() / 2,
                    height: "20px",
                    y: 15,
                    x: xScale(this.viewModel.dataPoints[i].categories)
                })
                    .style("fill", '#D3D3D3');

                this.BarGroup.append("text")
                    .attr({
                        y: 29,
                        x: xScale(this.viewModel.dataPoints[i].categories) + xScale.rangeBand() / 4
                    })
                    .classed('text2', true)
                    .text((this.viewModel.dataPoints[i].value_1_growth).toFixed(1) + '%')
                    .style('fill', x)
                    .style('font-size', this.settings.Arc.growth_chart_text / 10 + 'em')
                    .style('text-anchor', 'middle')
                    .style('font-family', 'arial')





                let bars_6 = this.BarGroup
                    .selectAll(".bar")
                    .data(this.viewModel.dataPoints)
                bars_6.enter()
                    .append("rect")
                bars_6.attr({
                    width: xScale.rangeBand() / 2,
                    height: "20px",
                    y: 15,
                    x: xScale(this.viewModel.dataPoints[i].categories) + xScale.rangeBand() / 2 + 4
                })
                    .style("fill", '#D3D3D3');


                this.BarGroup.append("text")
                    .attr({
                        y: 29,
                        x: xScale(this.viewModel.dataPoints[i].categories) + 3 * xScale.rangeBand() / 4 + 4
                    })
                    .classed('text2', true)
                    .text((this.viewModel.dataPoints[i].value_2_growth).toFixed(1) + '%')
                    .style('fill', x)
                    .style('font-size', this.settings.Arc.growth_chart_text / 10 + 'em')
                    .style('text-anchor', 'middle')
                    .style('font-family', 'arial')

            }



        }
        private static parseSettings(dataView: DataView): VisualSettings {
            console.log('dvvv', VisualSettings.parse(dataView) as VisualSettings)
            return VisualSettings.parse(dataView) as VisualSettings;
        }
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            const settings: VisualSettings = this.visualSettings ||
                VisualSettings.getDefault() as VisualSettings;
            return VisualSettings.enumerateObjectInstances(settings, options);
        }

        private getViewModel(options: VisualUpdateOptions): ViewModel {
            let viewModel = {
                dataPoints: [],
                maxValue_Y: 0,
                minValue_Y: 0,
                category_1: '',
                category_2: ''
            }
            let dv = options.dataViews;
            let view = dv[0].categorical;
            let categories = view.categories[0];
            console.log('categories', categories)
            let value_1_values = view.values[0];
            let value_1_growth = view.values[1];
            let value_2_values = view.values[2];
            let value_2_growth = view.values[3];

            console.log('values', view.values)
            console.log('value_1_values', value_1_values)
            console.log('value_1_growth', value_1_growth)
            console.log('value_2_value', value_2_values)
            console.log('value_2_growth', value_2_growth)

            for (let i = 0; i < categories.values.length; i++) {
                viewModel.dataPoints.push({
                    categories: <String>categories.values[i],
                    value_1_values: <number>value_1_values.values[i],
                    value_1_growth: <number>value_1_growth.values[i],
                    value_2_values: <number>value_2_values.values[i],
                    value_2_growth: <number>value_2_growth.values[i]

                })
            }

            let x_1 = d3.min(viewModel.dataPoints, d => d.value_1_values)
            let x_2 = d3.min(viewModel.dataPoints, d => d.value_2_values)

            viewModel.minValue_Y = d3.min(viewModel.dataPoints, d => d.value_1_values)
            viewModel.maxValue_Y = d3.min(viewModel.dataPoints, d => d.value_2_values)
            viewModel.category_1 = value_1_values.source.groupName.toString(),
                viewModel.category_2 = value_2_values.source.groupName.toString()
            return viewModel
        }


    }
}




    let bars = this.BarGroup.
                selectAll(".bar")
                .data(this.viewModel.dataPoints)
                .enter()

            //append rects
            bars.append("rect")
                .attr("class", "bar")
                .attr("y", function (d) {
                    return yScale(d.categories);
                })
                .attr("height", yScale.rangeBand())
                .attr("x", this.setting.axis.x.padding)
                .attr("width", function (d) {
                    return xScale(d.nsrValue);
                })
                .style('fill','blue')

                this.svg.
                append('line')
                .style("stroke", "lightgreen")
                .style("stroke-width", 2)
                .attr("x1",this.setting.axis.x.padding)
                .attr("y1", yScale.rangeBand()+ 3*yScale.rangeBand()/4)
                .attr("x2", width)
                .attr("y2", this.setting.axis.x.padding+12)