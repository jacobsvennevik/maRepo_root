import React from "react";
import ReactApexChart from "react-apexcharts";

/**
 * A component to render a pie chart
 *
 * This component is a wrapper around the ReactApexChart component. It takes two
 * props: chartData and chartOptions.
 *
 * @prop {Object[]} chartData - The data to render on the chart. Each element in the
 * array should have a 'name' key and a 'value' key.
 * @prop {Object} chartOptions - Options to pass to the ReactApexChart component.
 * See the ReactApexChart documentation for more information.
 */
class PieChart extends React.Component {
  /**
   * Constructor
   *
   * @param {Object} props - The component props.
   */
  constructor(props) {
    super(props);

    /**
     * Initial component state
     *
     * @type {Object}
     * @property {Object[]} chartData - The data to render on the chart. Each element in the
     * array should have a 'name' key and a 'value' key.
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
   *
   * @returns {ReactElement} The rendered chart element
   */
  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='pie'
        width='100%'
        height='55%'
      />
    );
  }
}

export default PieChart;
