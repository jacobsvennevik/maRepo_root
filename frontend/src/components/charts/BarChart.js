import React, { Component } from "react";
import Chart from "react-apexcharts";

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
