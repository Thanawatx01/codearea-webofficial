/**
 * Judge0 API Submission Request Interface
 */
export interface SubmissionRequest {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
  // Setting to false enables cgroup-based limits (--cg), which is more stable
  // for multi-threaded runtimes like Node.js when supported by the host.
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
}

/**
 * Judge0 API Submission Response Interface (Polling Token)
 */
export interface SubmissionResponse {
  token: string;
}

/**
 * Judge0 API Status Interface
 */
export interface SubmissionStatus {
  id: number;
  description: string;
}

/**
 * Judge0 API Result Interface
 */
export interface SubmissionResult {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: SubmissionStatus;
}

/**
 * Language mappings for Judge0
 * IDs based on Judge0 default configuration
 */
export const JUDGE0_LANGUAGES = [
  { id: 63, name: "JavaScript (Node.js 12.14.0)", label: "JavaScript" },
  { id: 74, name: "TypeScript (3.7.4)", label: "TypeScript" },
  { id: 76, name: "C++ (Clang 7.0.1)", label: "C++ (Clang)" },
  { id: 71, name: "Python (3.8.1)", label: "Python 3" },
];

const JUDGE0_BASE_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || "http://localhost:5000/api/executor";

/**
 * Submits code for execution to Judge0
 */
export async function submitCode(request: SubmissionRequest): Promise<SubmissionResponse> {
  try {
    // Strictly pick only supported fields for Judge0 API
    const payload = {
      source_code: request.source_code,
      language_id: request.language_id,
      stdin: request.stdin,
      expected_output: request.expected_output,
      cpu_time_limit: request.cpu_time_limit,
      memory_limit: request.memory_limit,
      enable_per_process_and_thread_time_limit: false,
      enable_per_process_and_thread_memory_limit: false,
    };

    const response = await fetch(`${JUDGE0_BASE_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(`Failed to submit code: ${errorDetail}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("cannot access executor check your connection");
    }
    throw error;
  }
}

/**
 * Retrieves the result of a submission by token
 */
export async function getSubmissionResult(token: string): Promise<SubmissionResult> {
  try {
    const response = await fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to get submission result from Judge0: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("cannot access executor check your connection");
    }
    throw error;
  }
}

/**
 * Polls for submission results until completion
 */
export async function pollSubmissionResult(
  token: string,
  intervalMs: number = 1000,
  maxAttempts: number = 30
): Promise<SubmissionResult> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = await getSubmissionResult(token);
        // Status IDs 1 (In Queue) and 2 (Processing) mean it's still running
        if (result.status.id <= 2) {
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error("Polling timed out"));
            return;
          }
          setTimeout(poll, intervalMs);
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Convenience function to execute code and wait for result
 */
export async function executeCode(request: SubmissionRequest): Promise<SubmissionResult> {
  const { token } = await submitCode(request);
  return pollSubmissionResult(token);
}
