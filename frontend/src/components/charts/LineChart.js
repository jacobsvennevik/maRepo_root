import React from "react";
import ReactApexChart from "react-apexcharts";

/**
 * A component to render a line chart
 *
 * This component is a wrapper around the ReactApexChart component. It takes two
 * props: chartData and chartOptions.
 *
 * @prop {Object[]} chartData - The data to render on the chart. Each element in the
 * array should have an 'x' key and a 'y' key.
 * @prop {Object} chartOptions - Options to pass to the ReactApexChart component.
 * See the ReactApexChart documentation for more information.
 */
class LineChart extends React.Component {
  /**
   * Constructor
   *
   * @param {Object} props - The component props.
   */
  constructor(props) {
    super(props);

    /**
     * State
     *
     * @type {Object}
     * @property {Object[]} chartData - The data to render on the chart. Each element in the
     * array should have an 'x' key and a 'y' key.
     * @property {Object} chartOptions - Options to pass to the ReactApexChart component.
     * See the ReactApexChart documentation for more information.
     */
    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  /**
   * Lifecycle method called once the component mounts
   *
   * Sets the component's state with the props values.
   */
  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  /**
   * Render the chart component
   *
   * @return {ReactElement} The rendered chart element
   */
  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='line'
        width='100%'
        height='100%'
      />
    );
  }
}

export default LineChart;
