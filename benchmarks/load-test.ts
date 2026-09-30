import http from 'node:http';

interface LoadTestOptions {
  host: string;
  port: number;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  totalRequests: number;
  concurrency: number;
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  durationMs: number;
  requestsPerSecond: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export async function runLoadTest(options: LoadTestOptions): Promise<LoadTestResult> {
  const { host, port, path, method, headers = {}, body, totalRequests, concurrency } = options;
  const latencies: number[] = [];
  let completed = 0;
  let successCount = 0;
  let failCount = 0;

  const startTime = performance.now();

  function makeRequest(): Promise<void> {
    return new Promise((resolve) => {
      const reqStart = performance.now();
      const req = http.request(
        {
          host,
          port,
          path,
          method,
          headers: {
            ...headers,
            ...(body ? { 'Content-Length': Buffer.byteLength(body).toString() } : {}),
          },
        },
        (res) => {
          res.on('data', () => {});
          res.on('end', () => {
            const reqEnd = performance.now();
            latencies.push(reqEnd - reqStart);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
              successCount++;
            } else {
              failCount++;
            }
            resolve();
          });
        }
      );

      req.on('error', () => {
        const reqEnd = performance.now();
        latencies.push(reqEnd - reqStart);
        failCount++;
        resolve();
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  // Worker pool for concurrency
  let index = 0;
  async function worker() {
    while (index < totalRequests) {
      index++;
      await makeRequest();
      completed++;
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const durationMs = performance.now() - startTime;
  latencies.sort((a, b) => a - b);

  return {
    totalRequests: completed,
    successfulRequests: successCount,
    failedRequests: failCount,
    durationMs,
    requestsPerSecond: Math.round((completed / (durationMs / 1000))),
    p50Ms: latencies[Math.floor(latencies.length * 0.5)] || 0,
    p95Ms: latencies[Math.floor(latencies.length * 0.95)] || 0,
    p99Ms: latencies[Math.floor(latencies.length * 0.99)] || 0,
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('  VIBEPERSONALIZE CONSOLE API LOAD TEST');
  console.log('  Testing /api/sdk/[siteId] and /api/collect throughput');
  console.log('='.repeat(70));
  console.log();

  // Test against local server if running
  const port = Number(process.env.PORT) || 3000;
  console.log(`Targeting localhost:${port}`);
  console.log('Running 500 requests with concurrency=25 against /api/sdk/site_demo...');

  try {
    const sdkResult = await runLoadTest({
      host: 'localhost',
      port,
      path: '/api/sdk/site_demo',
      method: 'GET',
      totalRequests: 500,
      concurrency: 25,
    });

    console.log(`Completed ${sdkResult.totalRequests} requests in ${(sdkResult.durationMs / 1000).toFixed(2)}s`);
    console.log(`Throughput: ${sdkResult.requestsPerSecond} req/sec`);
    console.log(`p50 Latency: ${sdkResult.p50Ms.toFixed(2)} ms`);
    console.log(`p95 Latency: ${sdkResult.p95Ms.toFixed(2)} ms`);
    console.log(`p99 Latency: ${sdkResult.p99Ms.toFixed(2)} ms`);
    console.log(`Success Rate: ${((sdkResult.successfulRequests / sdkResult.totalRequests) * 100).toFixed(1)}%`);
  } catch (err: any) {
    console.log('Note: Local server not running or connection refused. Start with `pnpm dev` before running full live load test.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
