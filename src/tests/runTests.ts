import { runPlatformTestSuite } from './app.test';

console.log('========================================================');
console.log('🧪 RUNNING FOODRESCUE AI INTEGRATION TEST SUITE');
console.log('========================================================\n');

const result = runPlatformTestSuite();

result.results.forEach((r) => console.log(r));

console.log('\n--------------------------------------------------------');
console.log(`TOTAL PASSED: ${result.passed}`);
console.log(`TOTAL FAILED: ${result.failed}`);
console.log('--------------------------------------------------------');

if (result.failed > 0) {
  process.exit(1);
} else {
  console.log('✨ All tests passed successfully!\n');
  process.exit(0);
}
