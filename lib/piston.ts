import { SubmissionResult, SubmissionStatus } from "./judge0";

export interface PistonFile {
  name?: string;
  content: string;
}

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: PistonFile[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
    cpu_time?: number;
    wall_time?: number;
    memory?: number;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
    cpu_time?: number;
    wall_time?: number;
    memory?: number;
  };
}

const PISTON_BASE_URL = process.env.NEXT_PUBLIC_PISTON_URL || "http://localhost:5000/api/executor";

// Map our internal IDs (from judge0.ts for compatibility) to Piston language/version
export const PISTON_LANGUAGE_MAP: Record<number, { language: string; version: string }> = {
  63: { language: "javascript", version: "20.11.1" },
  74: { language: "typescript", version: "5.0.3" },
  71: { language: "python", version: "3.12.0" },
  76: { language: "c++", version: "10.2.0" },
};

/**
 * Converts Piston response to our common SubmissionResult format
 */
function mapPistonToSubmissionResult(pistonRes: PistonExecuteResponse): SubmissionResult {
  const isError = pistonRes.run.code !== 0 || (pistonRes.compile && pistonRes.compile.code !== 0);

  let status: SubmissionStatus = { id: 3, description: "Accepted" };
  if (pistonRes.compile && pistonRes.compile.code !== 0) {
    status = { id: 6, description: "Compilation Error" };
  } else if (pistonRes.run.code !== 0) {
    status = { id: 11, description: "Runtime Error (NZEC)" };
  }

  return {
    stdout: pistonRes.run.stdout,
    stderr: pistonRes.run.stderr,
    compile_output: pistonRes.compile?.stderr || pistonRes.compile?.stdout || null,
    time: pistonRes.run.wall_time ? (pistonRes.run.wall_time / 1000).toFixed(3) : null,
    memory: pistonRes.run.memory ? Math.round(pistonRes.run.memory / 1024) : null,
    token: "piston-" + Date.now(),
    message: pistonRes.run.signal ? `Signal: ${pistonRes.run.signal}` : null,
    status: status,
  };
}

export async function executeCodePiston(
  languageId: number,
  sourceCode: string,
  stdin?: string
): Promise<SubmissionResult> {
  const config = PISTON_LANGUAGE_MAP[languageId];
  if (!config) {
    throw new Error(`Unsupported language ID for Piston: ${languageId}`);
  }

  const payload: PistonExecuteRequest = {
    language: config.language,
    version: config.version,
    files: [
      {
        content: sourceCode,
      },
    ],
    stdin: stdin,
  };

  try {
    const response = await fetch(`${PISTON_BASE_URL}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Piston execution failed: ${errorText}`);
    }

    const data: PistonExecuteResponse = await response.json();
    return mapPistonToSubmissionResult(data);
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("cannot access executor check your connection");
    }
    throw error;
  }
}
