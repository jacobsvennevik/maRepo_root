#!/usr/bin/env python3
"""
Advanced Test Runner for Generation App

This script provides comprehensive testing capabilities including:
- Unit tests
- Integration tests
- Performance tests
- Coverage analysis
- Test reporting
- Parallel execution
"""

import os
import sys
import argparse
import subprocess
import time
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TestRunner:
    """Advanced test runner with multiple testing strategies."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the test runner.
        
        Args:
            config: Test configuration dictionary
        """
        self.config = config
        self.project_root = Path(__file__).parent.parent.parent.parent
        self.test_dir = Path(__file__).parent
        self.results_dir = self.project_root / 'test_results'
        self.coverage_dir = self.project_root / 'coverage'
        
        # Create results directories
        self.results_dir.mkdir(exist_ok=True)
        self.coverage_dir.mkdir(exist_ok=True)
    
    def run_unit_tests(self) -> Dict[str, Any]:
        """Run unit tests."""
        logger.info("🚀 Running unit tests...")
        
        start_time = time.time()
        
        # Run Django unit tests
        cmd = [
            sys.executable, 'manage.py', 'test',
            'backend.apps.generation.tests',
            '--verbosity=2',
            '--parallel=4',
            '--keepdb',
            '--settings=backend.settings'
        ]
        
        if self.config.get('failfast'):
            cmd.append('--failfast')
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=self.config.get('timeout', 300)
            )
            
            success = result.returncode == 0
            output = result.stdout
            error = result.stderr
            
        except subprocess.TimeoutExpired:
            success = False
            output = ""
            error = "Test execution timed out"
        
        execution_time = (time.time() - start_time) * 1000
        
        return {
            'test_type': 'unit',
            'success': success,
            'execution_time_ms': execution_time,
            'output': output,
            'error': error,
            'return_code': result.returncode if 'result' in locals() else -1
        }
    
    def run_integration_tests(self) -> Dict[str, Any]:
        """Run integration tests."""
        logger.info("🔗 Running integration tests...")
        
        start_time = time.time()
        
        # Run integration tests with specific markers
        cmd = [
            sys.executable, '-m', 'pytest',
            str(self.test_dir),
            '-m', 'integration',
            '--tb=short',
            '--durations=10',
            '--maxfail=5'
        ]
        
        if self.config.get('parallel'):
            cmd.extend(['-n', 'auto'])
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=self.config.get('timeout', 600)
            )
            
            success = result.returncode == 0
            output = result.stdout
            error = result.stderr
            
        except subprocess.TimeoutExpired:
            success = False
            output = ""
            error = "Integration test execution timed out"
        
        execution_time = (time.time() - start_time) * 1000
        
        return {
            'test_type': 'integration',
            'success': success,
            'execution_time_ms': execution_time,
            'output': output,
            'error': error,
            'return_code': result.returncode if 'result' in locals() else -1
        }
    
    def run_performance_tests(self) -> Dict[str, Any]:
        """Run performance tests."""
        if not self.config.get('enable_performance_tests'):
            logger.info("⏭️ Performance tests disabled, skipping...")
            return {
                'test_type': 'performance',
                'success': True,
                'skipped': True,
                'reason': 'Performance tests disabled in configuration'
            }
        
        logger.info("⚡ Running performance tests...")
        
        start_time = time.time()
        
        # Run performance tests
        cmd = [
            sys.executable, '-m', 'pytest',
            str(self.test_dir),
            '-m', 'performance',
            '--tb=short',
            '--durations=10'
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=self.config.get('performance_timeout', 900)
            )
            
            success = result.returncode == 0
            output = result.stdout
            error = result.stderr
            
        except subprocess.TimeoutExpired:
            success = False
            output = ""
            error = "Performance test execution timed out"
        
        execution_time = (time.time() - start_time) * 1000
        
        return {
            'test_type': 'performance',
            'success': success,
            'execution_time_ms': execution_time,
            'output': output,
            'error': error,
            'return_code': result.returncode if 'result' in locals() else -1
        }
    
    def run_coverage_analysis(self) -> Dict[str, Any]:
        """Run coverage analysis."""
        logger.info("📊 Running coverage analysis...")
        
        start_time = time.time()
        
        # Run coverage
        cmd = [
            sys.executable, '-m', 'coverage', 'run',
            '--source=backend/apps/generation',
            '--omit=*/tests/*,*/migrations/*,*/__pycache__/*',
            'manage.py', 'test',
            'backend.apps.generation.tests',
            '--verbosity=1',
            '--settings=backend.settings'
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=self.config.get('timeout', 300)
            )
            
            # Generate coverage report
            report_cmd = [
                sys.executable, '-m', 'coverage', 'report',
                '--show-missing',
                '--fail-under=90'
            ]
            
            report_result = subprocess.run(
                report_cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True
            )
            
            # Generate HTML report
            html_cmd = [
                sys.executable, '-m', 'coverage', 'html',
                '--directory', str(self.coverage_dir)
            ]
            
            html_result = subprocess.run(
                html_cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True
            )
            
            success = result.returncode == 0 and report_result.returncode == 0
            output = report_result.stdout
            error = report_result.stderr
            
        except subprocess.TimeoutExpired:
            success = False
            output = ""
            error = "Coverage analysis timed out"
        
        execution_time = (time.time() - start_time) * 1000
        
        return {
            'test_type': 'coverage',
            'success': success,
            'execution_time_ms': execution_time,
            'output': output,
            'error': error,
            'return_code': result.returncode if 'result' in locals() else -1,
            'html_report_path': str(self.coverage_dir / 'htmlcov' / 'index.html')
        }
    
    def run_stress_tests(self) -> Dict[str, Any]:
        """Run stress tests."""
        if not self.config.get('enable_stress_tests'):
            logger.info("⏭️ Stress tests disabled, skipping...")
            return {
                'test_type': 'stress',
                'success': True,
                'skipped': True,
                'reason': 'Stress tests disabled in configuration'
            }
        
        logger.info("🔥 Running stress tests...")
        
        start_time = time.time()
        
        # Run stress tests
        cmd = [
            sys.executable, '-m', 'pytest',
            str(self.test_dir),
            '-m', 'stress',
            '--tb=short',
            '--durations=10'
        ]
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=self.config.get('stress_timeout', 1800)
            )
            
            success = result.returncode == 0
            output = result.stdout
            error = result.stderr
            
        except subprocess.TimeoutExpired:
            success = False
            output = ""
            error = "Stress test execution timed out"
        
        execution_time = (time.time() - start_time) * 1000
        
        return {
            'test_type': 'stress',
            'success': success,
            'execution_time_ms': execution_time,
            'output': output,
            'error': error,
            'return_code': result.returncode if 'result' in locals() else -1
        }
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all test types."""
        logger.info("🎯 Starting comprehensive test suite...")
        
        overall_start_time = time.time()
        results = {}
        
        # Run different test types
        test_types = [
            ('unit', self.run_unit_tests),
            ('integration', self.run_integration_tests),
            ('performance', self.run_performance_tests),
            ('coverage', self.run_coverage_analysis),
            ('stress', self.run_stress_tests),
        ]
        
        for test_type, test_runner in test_types:
            try:
                logger.info(f"Running {test_type} tests...")
                results[test_type] = test_runner()
                
                if results[test_type].get('skipped'):
                    logger.info(f"⏭️ {test_type.title()} tests skipped")
                elif results[test_type]['success']:
                    logger.info(f"✅ {test_type.title()} tests passed")
                else:
                    logger.warning(f"❌ {test_type.title()} tests failed")
                    
            except Exception as e:
                logger.error(f"Error running {test_type} tests: {e}")
                results[test_type] = {
                    'test_type': test_type,
                    'success': False,
                    'error': str(e),
                    'execution_time_ms': 0
                }
        
        overall_execution_time = (time.time() - overall_start_time) * 1000
        
        # Generate overall summary
        summary = self._generate_summary(results, overall_execution_time)
        
        # Save results
        self._save_results(results, summary)
        
        return {
            'summary': summary,
            'results': results,
            'overall_execution_time_ms': overall_execution_time
        }
    
    def _generate_summary(self, results: Dict[str, Any], overall_time: float) -> Dict[str, Any]:
        """Generate test summary."""
        total_tests = len(results)
        passed_tests = sum(1 for r in results.values() if r.get('success', False))
        failed_tests = total_tests - passed_tests
        skipped_tests = sum(1 for r in results.values() if r.get('skipped', False))
        
        # Calculate total execution time
        total_execution_time = sum(
            r.get('execution_time_ms', 0) for r in results.values() 
            if not r.get('skipped', False)
        )
        
        return {
            'total_test_types': total_tests,
            'passed_test_types': passed_tests,
            'failed_test_types': failed_tests,
            'skipped_test_types': skipped_tests,
            'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            'total_execution_time_ms': total_execution_time,
            'overall_execution_time_ms': overall_time,
            'timestamp': time.time(),
        }
    
    def _save_results(self, results: Dict[str, Any], summary: Dict[str, Any]):
        """Save test results to files."""
        timestamp = int(time.time())
        
        # Save detailed results
        results_file = self.results_dir / f'test_results_{timestamp}.json'
        with open(results_file, 'w') as f:
            json.dump({
                'summary': summary,
                'results': results,
                'timestamp': timestamp
            }, f, indent=2, default=str)
        
        # Save summary
        summary_file = self.results_dir / f'test_summary_{timestamp}.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        
        # Generate HTML report
        html_file = self.results_dir / f'test_report_{timestamp}.html'
        self._generate_html_report(results, summary, html_file)
        
        logger.info(f"📁 Test results saved to:")
        logger.info(f"   - Detailed results: {results_file}")
        logger.info(f"   - Summary: {summary_file}")
        logger.info(f"   - HTML report: {html_file}")
    
    def _generate_html_report(self, results: Dict[str, Any], summary: Dict[str, Any], 
                            output_file: Path):
        """Generate HTML test report."""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Results Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; }}
                .summary {{ margin: 20px 0; }}
                .test-type {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }}
                .success {{ border-left: 5px solid #28a745; }}
                .failure {{ border-left: 5px solid #dc3545; }}
                .skipped {{ border-left: 5px solid #ffc107; }}
                .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
                .metric {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #007bff; }}
                .metric-label {{ color: #6c757d; margin-top: 5px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚀 Test Results Report</h1>
                <p>Generated at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(summary['timestamp']))}</p>
            </div>
            
            <div class="summary">
                <h2>📊 Test Summary</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{summary['total_test_types']}</div>
                        <div class="metric-label">Total Test Types</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #28a745;">{summary['passed_test_types']}</div>
                        <div class="metric-label">Passed</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #dc3545;">{summary['failed_test_types']}</div>
                        <div class="metric-label">Failed</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #ffc107;">{summary['skipped_test_types']}</div>
                        <div class="metric-label">Skipped</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #007bff;">{summary['success_rate']:.1f}%</div>
                        <div class="metric-label">Success Rate</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #6c757d;">{summary['total_execution_time_ms']/1000:.1f}s</div>
                        <div class="metric-label">Total Time</div>
                    </div>
                </div>
            </div>
            
            <div class="test-results">
                <h2>🔍 Detailed Results</h2>
        """
        
        for test_type, result in results.items():
            status_class = 'success' if result.get('success', False) else 'failure'
            if result.get('skipped'):
                status_class = 'skipped'
            
            status_icon = '✅' if result.get('success', False) else '❌'
            if result.get('skipped'):
                status_icon = '⏭️'
            
            html_content += f"""
                <div class="test-type {status_class}">
                    <h3>{status_icon} {test_type.title()} Tests</h3>
                    <p><strong>Status:</strong> {'Passed' if result.get('success', False) else 'Failed'}</p>
                    <p><strong>Execution Time:</strong> {result.get('execution_time_ms', 0):.2f}ms</p>
            """
            
            if result.get('skipped'):
                html_content += f'<p><strong>Reason:</strong> {result.get("reason", "Unknown")}</p>'
            elif result.get('error'):
                html_content += f'<p><strong>Error:</strong> {result.get("error", "")}</p>'
            
            html_content += "</div>"
        
        html_content += """
            </div>
        </body>
        </html>
        """
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(html_content)


def create_default_config() -> Dict[str, Any]:
    """Create default test configuration."""
    return {
        'enable_performance_tests': True,
        'enable_stress_tests': False,
        'parallel': True,
        'failfast': False,
        'timeout': 300,  # 5 minutes
        'performance_timeout': 900,  # 15 minutes
        'stress_timeout': 1800,  # 30 minutes
        'coverage_threshold': 90,
        'test_data_size': 'medium',
    }


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Advanced Test Runner for Generation App')
    parser.add_argument('--test-type', choices=['unit', 'integration', 'performance', 'coverage', 'stress', 'all'],
                       default='all', help='Type of tests to run')
    parser.add_argument('--config', help='Path to test configuration file')
    parser.add_argument('--parallel', action='store_true', help='Enable parallel test execution')
    parser.add_argument('--failfast', action='store_true', help='Stop on first failure')
    parser.add_argument('--timeout', type=int, help='Test timeout in seconds')
    parser.add_argument('--coverage', action='store_true', help='Run coverage analysis')
    parser.add_argument('--performance', action='store_true', help='Enable performance tests')
    parser.add_argument('--stress', action='store_true', help='Enable stress tests')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Load configuration
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = create_default_config()
    
    # Override config with command line arguments
    if args.parallel:
        config['parallel'] = True
    if args.failfast:
        config['failfast'] = True
    if args.timeout:
        config['timeout'] = args.timeout
    if args.coverage:
        config['enable_coverage'] = True
    if args.performance:
        config['enable_performance_tests'] = True
    if args.stress:
        config['enable_stress_tests'] = True
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create test runner
    runner = TestRunner(config)
    
    try:
        if args.test_type == 'all':
            results = runner.run_all_tests()
        elif args.test_type == 'unit':
            results = runner.run_unit_tests()
        elif args.test_type == 'integration':
            results = runner.run_integration_tests()
        elif args.test_type == 'performance':
            results = runner.run_performance_tests()
        elif args.test_type == 'coverage':
            results = runner.run_coverage_analysis()
        elif args.test_type == 'stress':
            results = runner.run_stress_tests()
        
        # Print summary
        if args.test_type == 'all':
            summary = results['summary']
            print(f"\n🎯 Test Summary:")
            print(f"   Total Test Types: {summary['total_test_types']}")
            print(f"   Passed: {summary['passed_test_types']}")
            print(f"   Failed: {summary['failed_test_types']}")
            print(f"   Skipped: {summary['skipped_test_types']}")
            print(f"   Success Rate: {summary['success_rate']:.1f}%")
            print(f"   Total Time: {summary['total_execution_time_ms']/1000:.1f}s")
        else:
            result = results
            print(f"\n🎯 {result['test_type'].title()} Test Results:")
            print(f"   Status: {'✅ Passed' if result['success'] else '❌ Failed'}")
            print(f"   Execution Time: {result['execution_time_ms']:.2f}ms")
            if result.get('error'):
                print(f"   Error: {result['error']}")
        
        # Exit with appropriate code
        if args.test_type == 'all':
            success = summary['failed_test_types'] == 0
        else:
            success = results['success']
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.info("Test execution interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Test execution failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
