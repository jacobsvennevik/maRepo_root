import React from "react";
import ReactApexChart from "react-apexcharts";

class LineChart extends React.Component {
  /**
   * Construct a new LineChart component
   * @param {Object} props - Component properties
   */
  constructor(props) {
    super(props);

    /**
     * Initial component state
     */
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
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='area'
        width='100%'
        height='100%'
      />
    );
  }
}

export default LineChart;
