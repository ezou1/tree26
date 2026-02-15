// RunPod API client — ported from agent3.py (raw REST, no SDK)

const RUNPOD_API_BASE = "https://api.runpod.ai/v2"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface RunPodJobResult {
  id: string
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "TIMED_OUT" | "CANCELLED"
  output?: {
    results?: RunPodDockingResult[]
    processing_time_seconds?: number
  }
}

export interface RunPodDockingResult {
  name: string
  confidence_score: number
  confidence_raw: number
  all_poses?: unknown[]
}

/**
 * Submit a docking job to RunPod.
 * Port of agent3.py:submit_chunk()
 */
export async function submitJob(
  proteinPdbB64: string,
  ligands: { name: string; smiles: string }[],
  samplesPerComplex: number = 10
): Promise<string> {
  const apiKey = process.env.RUNPOD_API_KEY
  const endpointId = process.env.RUNPOD_ENDPOINT_ID || "5h7ezi9wyaqk5u"

  if (!apiKey) throw new Error("RUNPOD_API_KEY not set")

  const res = await fetch(`${RUNPOD_API_BASE}/${endpointId}/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        protein_pdb_b64: proteinPdbB64,
        ligands,
        samples_per_complex: samplesPerComplex,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`RunPod submit error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.id
}

/**
 * Check job status on RunPod.
 */
export async function checkStatus(jobId: string): Promise<RunPodJobResult> {
  const apiKey = process.env.RUNPOD_API_KEY
  const endpointId = process.env.RUNPOD_ENDPOINT_ID || "5h7ezi9wyaqk5u"

  if (!apiKey) throw new Error("RUNPOD_API_KEY not set")

  const res = await fetch(
    `${RUNPOD_API_BASE}/${endpointId}/status/${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`RunPod status error ${res.status}: ${text}`)
  }

  return res.json()
}

/**
 * Poll a job until completion.
 * Returns the output results or throws on failure.
 */
export async function waitForJob(
  jobId: string,
  pollIntervalMs: number = 5000
): Promise<RunPodDockingResult[]> {
  while (true) {
    const status = await checkStatus(jobId)

    if (status.status === "COMPLETED") {
      return status.output?.results || []
    }

    if (["FAILED", "TIMED_OUT", "CANCELLED"].includes(status.status)) {
      throw new Error(`RunPod job ${jobId} ${status.status}`)
    }

    await delay(pollIntervalMs)
  }
}

/**
 * Make ligand names safe for RunPod (filesystem-safe, max 80 chars).
 * Port of agent3.py:_safe_ligand_name()
 */
export function safeLigandName(name: string, idx: number, maxLen: number = 80): string {
  let safe = name.replace(/[/\\:*?"<>|]/g, "_")
  if (safe.length <= maxLen) return safe

  const prefix = name.slice(0, 30).replace(/[^A-Za-z0-9_-]/g, "_")
  return `lig${idx}_${prefix}`
}

/**
 * Split array into chunks.
 * Port of agent3.py:chunk_list()
 */
export function chunkList<T>(list: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < list.length; i += chunkSize) {
    chunks.push(list.slice(i, i + chunkSize))
  }
  return chunks
}
