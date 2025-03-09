import React, { Component } from "react";
import Chart from "react-apexcharts";

/**
 * A component to render a bar chart
 *
 * This component is a wrapper around the ReactApexChart component. It takes two
 * props: chartData and chartOptions.
 *
 * @prop {Object[]} chartData - The data to render on the chart. Each element in the
 * array should have an 'x' key and a 'y' key.
 * @prop {Object} chartOptions - Options to pass to the ReactApexChart component.
 * See the ReactApexChart documentation for more information.
 */
class ColumnChart extends Component {
  /**
   * Construct a new ColumnChart component
   * @param {Object} props - Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  /**
   * Lifecycle method called once the component mounts
   * Sets the component's state with the props values
   */
  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  /**
   * Render the chart component
   * @returns {JSX.Element} The rendered chart element
   */
  render() {
    return (
      <Chart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='bar'
        width='100%'
        height='100%'
      />
    );
  }
}

export default ColumnChart;
