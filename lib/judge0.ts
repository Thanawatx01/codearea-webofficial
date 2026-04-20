import { api } from "@/lib/api";

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
  enable_per_process_and_thread_time_limit?: boolean;
  enable_per_process_and_thread_memory_limit?: boolean;
}

export interface SubmissionResponse {
  token: string;
}

export interface SubmissionStatus {
  id: number;
  description: string;
}

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

export const JUDGE0_LANGUAGES = [
  { id: 63, name: "JavaScript (Node.js 12.14.0)", label: "JavaScript" },
  { id: 74, name: "TypeScript (3.7.4)", label: "TypeScript" },
  { id: 76, name: "C++ (Clang 7.0.1)", label: "C++ (Clang)" },
  { id: 71, name: "Python (3.8.1)", label: "Python 3" },
];

/**
 * Submits code for execution to Judge0
 */
export async function submitCode(request: SubmissionRequest, baseUrl?: string): Promise<SubmissionResponse> {
  try {
    const payload = {
      source_code: request.source_code,
      language_id: request.language_id,
      stdin: request.stdin,
      expected_output: request.expected_output,
      cpu_time_limit: request.cpu_time_limit,
      memory_limit: request.memory_limit,
      enable_per_process_and_thread_time_limit: false,
      enable_per_process_and_thread_memory_limit: false,
      executor_url: baseUrl, 
    };

    const response = await api.post<SubmissionResponse>('/executor/execute', payload as any);

    if (!response.ok || !response.data) {
      throw new Error(`Failed to submit code: ${response.error || "Unknown error"}`);
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Retrieves the result of a submission by token
 */
export async function getSubmissionResult(token: string, baseUrl?: string): Promise<SubmissionResult> {
  try {
    const params: Record<string, string> = { base64_encoded: "false" };
    if (baseUrl) {
      params.executor_url = baseUrl;
    }

    const response = await api.get<SubmissionResult>(`/executor/submissions/${token}`, { params });

    if (!response.ok || !response.data) {
      throw new Error(`Failed to get submission result: ${response.error || "Unknown error"}`);
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Polls for submission results until completion
 */
export async function pollSubmissionResult(
  token: string,
  intervalMs: number = 1000,
  maxAttempts: number = 30,
  baseUrl?: string
): Promise<SubmissionResult> {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = await getSubmissionResult(token, baseUrl);
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
export async function executeCode(request: SubmissionRequest, baseUrl?: string): Promise<SubmissionResult> {
  const { token } = await submitCode(request, baseUrl);
  return pollSubmissionResult(token, 1000, 30, baseUrl);
}
