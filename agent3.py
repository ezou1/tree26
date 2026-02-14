#!/usr/bin/env python3
"""
Agent 3 — DiffDock Simulation Agent

Reads Agent 2's output (agent2_output.json) containing protein structures and
drug SMILES strings, sends them to DiffDock running on a RunPod serverless GPU
endpoint, and returns ranked results with confidence scores normalized to 0-1.

Pipeline mode (reads Agent 2 output):
    python agent3.py

Manual mode:
    python agent3.py --protein structures/6GJ8.pdb --ligands ligands.json

Test mode:
    python agent3.py --test

Environment variables:
    RUNPOD_API_KEY      - Your RunPod API key
    RUNPOD_ENDPOINT_ID  - Your RunPod serverless endpoint ID (default: 5h7ezi9wyaqk5u)
"""

import argparse
import base64
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv

load_dotenv()

try:
    import runpod
except ImportError:
    runpod = None

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_ENDPOINT_ID = "5h7ezi9wyaqk5u"
INPUT_FILE = "agent2_output.json"
OUTPUT_FILE = "agent3_output.json"

EXAMPLE_LIGANDS = [
    {"name": "sotorasib", "smiles": "C=CC(=O)N1CCC(CC1)n2c(=O)c3cc(F)c(cc3n2c4ccc(cc4)c5nc(cnc5OC)N)OC"},
    {"name": "adagrasib", "smiles": "Cc1c(F)c(C)c(Cl)c(Nc2nc3c(c(n2)C(=O)N4CCC(CC4)N5CC(C)C(F)(F)C5)ccn3C(C)C)c1F"},
    {"name": "aspirin", "smiles": "CC(=O)Oc1ccccc1C(=O)O"},
    {"name": "ibuprofen", "smiles": "CC(C)Cc1ccc(cc1)C(C)C(=O)O"},
    {"name": "caffeine", "smiles": "Cn1c(=O)c2c(ncn2C)n(c1=O)C"},
]


# ---------------------------------------------------------------------------
# RunPod helpers
# ---------------------------------------------------------------------------

def encode_pdb(pdb_path: str) -> str:
    """Base64-encode a PDB file."""
    with open(pdb_path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def chunk_list(lst: list, chunk_size: int) -> list[list]:
    """Split a list into chunks of at most chunk_size."""
    return [lst[i : i + chunk_size] for i in range(0, len(lst), chunk_size)]


def submit_chunk(endpoint, protein_pdb_b64: str, ligand_chunk: list[dict],
                 samples_per_complex: int, chunk_idx: int):
    """Submit a single chunk to RunPod and return the result."""
    payload = {
        "input": {
            "protein_pdb_b64": protein_pdb_b64,
            "ligands": ligand_chunk,
            "samples_per_complex": samples_per_complex,
        }
    }

    print(f"    [chunk {chunk_idx}] Submitting {len(ligand_chunk)} ligands …")
    run_request = endpoint.run(payload)

    # Poll for completion
    while True:
        status = run_request.status()
        if status == "COMPLETED":
            break
        if status in ("FAILED", "TIMED_OUT", "CANCELLED"):
            print(f"    [chunk {chunk_idx}] RunPod status: {status}", flush=True)
            try:
                err_output = run_request.output()
                if err_output:
                    print(f"    [chunk {chunk_idx}] RunPod error: {err_output}", flush=True)
            except Exception:
                pass
            return {"error": f"Chunk {chunk_idx} {status}", "results": []}
        time.sleep(5)

    output = run_request.output()
    if output is None:
        print(f"    [chunk {chunk_idx}] Warning: output is None", flush=True)
        return {"results": []}
    print(f"    [chunk {chunk_idx}] Done ({output.get('processing_time_seconds', '?')}s)", flush=True)
    return output


def _safe_ligand_name(name: str, idx: int, max_len: int = 80) -> str:
    """Return a short, filesystem-safe ligand identifier.

    The DiffDock RunPod handler uses the ligand name as a directory name, so it
    must be ≤255 chars and contain no path separators.  IUPAC names from
    PubChem can be 300+ chars, causing OSError errno 36 on the worker.
    """
    # Strip characters that are unsafe in filenames
    safe = re.sub(r'[/\\:*?"<>|]', '_', name)
    if len(safe) <= max_len:
        return safe
    # Too long — use a compact indexed identifier
    prefix = re.sub(r'[^A-Za-z0-9_-]', '_', name[:30])
    return f"lig{idx}_{prefix}"


def run_docking(
    protein_pdb_path: str,
    ligands: list[dict],
    endpoint_id: str = None,
    api_key: str = None,
    chunk_size: int = 10,
    samples_per_complex: int = 10,
) -> list[dict]:
    """
    Run DiffDock molecular docking via RunPod serverless.

    Args:
        protein_pdb_path: Path to the protein .pdb file
        ligands: List of dicts with "name" and "smiles" keys
        endpoint_id: RunPod endpoint ID
        api_key: RunPod API key
        chunk_size: Number of ligands per RunPod job
        samples_per_complex: Number of poses to generate per drug-protein pair

    Returns:
        List of result dicts sorted by confidence_score (descending).
    """
    if runpod is None:
        raise ImportError("Install runpod SDK: pip install runpod")

    api_key = api_key or os.environ.get("RUNPOD_API_KEY")
    endpoint_id = endpoint_id or os.environ.get("RUNPOD_ENDPOINT_ID", DEFAULT_ENDPOINT_ID)

    if not api_key:
        raise ValueError("RUNPOD_API_KEY not set. Get it from https://www.runpod.io/console/user/settings")
    if not endpoint_id:
        raise ValueError("RUNPOD_ENDPOINT_ID not set")

    runpod.api_key = api_key
    endpoint = runpod.Endpoint(endpoint_id)

    protein_pdb_b64 = encode_pdb(protein_pdb_path)

    # Build RunPod-safe ligands with short names; keep a mapping back to
    # the original metadata so we can restore real names in the results.
    safe_to_original = {}   # safe_name -> original ligand dict
    safe_ligands = []
    for i, lig in enumerate(ligands):
        safe_name = _safe_ligand_name(lig["name"], i)
        safe_to_original[safe_name] = lig
        safe_ligands.append({"name": safe_name, "smiles": lig["smiles"]})

    chunks = chunk_list(safe_ligands, chunk_size)
    n_chunks = len(chunks)
    print(f"  Docking {len(ligands)} ligands in {n_chunks} chunk(s) of ≤{chunk_size}")

    all_results = []
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=min(n_chunks, 3)) as executor:
        futures = {
            executor.submit(
                submit_chunk, endpoint, protein_pdb_b64, chunk,
                samples_per_complex, i
            ): i
            for i, chunk in enumerate(chunks)
        }

        for future in as_completed(futures):
            chunk_idx = futures[future]
            try:
                output = future.result()
                if output is None:
                    print(f"    [chunk {chunk_idx}] Warning: empty output")
                    continue
                chunk_results = output.get("results", [])
                all_results.extend(chunk_results)
            except Exception as e:
                print(f"    [chunk {chunk_idx}] Error: {e}")

    elapsed = time.time() - start_time

    # Restore original ligand names in the results
    for r in all_results:
        orig = safe_to_original.get(r.get("name", ""))
        if orig:
            r["name"] = orig["name"]

    all_results.sort(key=lambda x: x.get("confidence_score", 0), reverse=True)

    print(f"  Completed {len(all_results)}/{len(ligands)} ligands in {elapsed:.1f}s")
    return all_results, elapsed


# ---------------------------------------------------------------------------
# Pipeline mode: read Agent 2 output, dock all targets
# ---------------------------------------------------------------------------

def _flush_output(output_file: str, data: dict):
    """Atomically write the current pipeline state to disk."""
    tmp = output_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, output_file)


def run_pipeline(
    input_file: str,
    output_file: str,
    samples_per_complex: int = 10,
    chunk_size: int = 10,
    endpoint_id: str = None,
    api_key: str = None,
) -> dict:
    """
    Read agent2_output.json, run docking for every target, write agent3_output.json.
    The output file is updated live after each target so progress can be monitored.
    """
    print(f"\n{'=' * 60}")
    print(f"  Agent 3 — DiffDock Simulation")
    print(f"{'=' * 60}\n")

    if not os.path.exists(input_file):
        print(f"ERROR: Input file '{input_file}' not found.", file=sys.stderr)
        sys.exit(1)

    with open(input_file) as f:
        agent2_data = json.load(f)

    cancer_type = agent2_data.get("cancer_type", "unknown")
    targets = agent2_data.get("targets", [])

    print(f"  Cancer type:  {cancer_type}")
    print(f"  Targets:      {len(targets)}")
    for t in targets:
        print(f"    • {t['protein']} — PDB: {t.get('pdb_id', 'N/A')}, {len(t.get('ligands', []))} ligands")
    print()

    # Pre-build all target entries with "queued" status so the JSON shows
    # the full queue from the start.
    output_targets = []
    for target in targets:
        output_targets.append({
            "protein": target["protein"],
            "pdb_id": target.get("pdb_id"),
            "pdb_file": target.get("pdb_file"),
            "status": "queued",
            "num_ligands_total": len(target.get("ligands", [])),
            "num_ligands_docked": 0,
            "docking_time_seconds": 0,
            "results": [],
        })

    output = {
        "cancer_type": cancer_type,
        "status": "running",
        "completed_targets": 0,
        "total_targets": len(targets),
        "total_docking_time_seconds": 0,
        "targets": output_targets,
    }
    _flush_output(output_file, output)

    total_time = 0

    for idx, target in enumerate(targets):
        protein = target["protein"]
        pdb_file = target.get("pdb_file")
        ligands = target.get("ligands", [])

        print(f"\n{'─' * 40}")
        print(f"  Docking: {protein} ({len(ligands)} ligands)")
        print(f"{'─' * 40}\n")

        # Mark this target as "docking" and flush
        output_targets[idx]["status"] = "docking"
        _flush_output(output_file, output)

        if not pdb_file or not os.path.exists(pdb_file):
            print(f"  WARNING: PDB file not found: {pdb_file}")
            print(f"  Skipping target {protein}")
            output_targets[idx]["status"] = "error"
            output_targets[idx]["error"] = f"PDB file not found: {pdb_file}"
            output["completed_targets"] += 1
            _flush_output(output_file, output)
            continue

        if not ligands:
            print(f"  WARNING: No ligands for target {protein}")
            output_targets[idx]["status"] = "error"
            output_targets[idx]["error"] = "No ligands provided"
            output["completed_targets"] += 1
            _flush_output(output_file, output)
            continue

        # Format ligands for RunPod (needs "name" and "smiles")
        dock_ligands = [
            {"name": lig["name"], "smiles": lig["smiles"]}
            for lig in ligands
            if lig.get("smiles")
        ]

        results, elapsed = run_docking(
            protein_pdb_path=pdb_file,
            ligands=dock_ligands,
            endpoint_id=endpoint_id,
            api_key=api_key,
            chunk_size=chunk_size,
            samples_per_complex=samples_per_complex,
        )
        total_time += elapsed

        # Merge Agent 2 metadata back into results
        ligand_meta = {lig["name"]: lig for lig in ligands}
        for r in results:
            meta = ligand_meta.get(r["name"], {})
            r["mechanism"] = meta.get("mechanism", "")
            r["fda_status"] = meta.get("fda_status", "")
            r["source"] = meta.get("source", "")

        output_targets[idx].update({
            "status": "completed",
            "num_ligands_docked": len(results),
            "docking_time_seconds": round(elapsed, 2),
            "results": results,
        })
        output["completed_targets"] += 1
        output["total_docking_time_seconds"] = round(total_time, 2)
        _flush_output(output_file, output)

        # Print top 5 for this target
        print(f"\n  Top hits for {protein}:")
        print(f"  {'Rank':<6} {'Drug':<30} {'Score':<10} {'Raw':<10}")
        print(f"  {'-' * 56}")
        for i, r in enumerate(results[:5]):
            name = r["name"][:28]
            print(f"  {i+1:<6} {name:<30} {r['confidence_score']:<10.4f} {r['confidence_raw']:<10.4f}")

    # ----- Final write -----
    output["status"] = "completed"
    output["total_docking_time_seconds"] = round(total_time, 2)
    _flush_output(output_file, output)

    # ----- Summary -----
    total_docked = sum(t.get("num_ligands_docked", 0) for t in output_targets)
    print(f"\n{'=' * 60}")
    print(f"  Agent 3 complete")
    print(f"  Output:         {output_file}")
    print(f"  Targets docked: {len([t for t in output_targets if t['status'] == 'completed'])}")
    print(f"  Total ligands:  {total_docked}")
    print(f"  Total time:     {total_time:.1f}s")
    print(f"{'=' * 60}\n")

    return output


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _print_results_table(results: list[dict]):
    """Print a formatted results table."""
    print(f"\nTop results:")
    print(f"{'Rank':<6} {'Drug':<30} {'Score':<10} {'Raw':<10}")
    print("-" * 56)
    for i, r in enumerate(results[:10]):
        name = r["name"][:28]
        print(f"{i+1:<6} {name:<30} {r['confidence_score']:<10.4f} {r['confidence_raw']:<10.4f}")


def main():
    parser = argparse.ArgumentParser(
        description="Agent 3: DiffDock Simulation Agent"
    )
    parser.add_argument(
        "-i", "--input",
        type=str,
        default=INPUT_FILE,
        help=f"Input JSON from Agent 2 (default: {INPUT_FILE}). Used in pipeline mode.",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=OUTPUT_FILE,
        help=f"Output JSON for Agent 4 (default: {OUTPUT_FILE}).",
    )
    parser.add_argument(
        "--protein",
        type=str,
        default=None,
        help="Path to protein .pdb file (manual mode — bypasses Agent 2 input).",
    )
    parser.add_argument(
        "--ligands",
        type=str,
        default=None,
        help="Path to JSON file with ligands [{name, smiles}, ...] (manual mode).",
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Use built-in example ligands (requires --protein).",
    )
    parser.add_argument("--endpoint-id", type=str, default=None)
    parser.add_argument("--api-key", type=str, default=None)
    parser.add_argument("--chunk-size", type=int, default=10)
    parser.add_argument("--samples", type=int, default=10,
                        help="Poses per drug-protein pair (default: 10)")

    args = parser.parse_args()

    # ----- Manual mode -----
    if args.protein:
        if args.test:
            ligands = EXAMPLE_LIGANDS
        elif args.ligands:
            with open(args.ligands) as f:
                ligands = json.load(f)
        else:
            print("Error: --protein requires --ligands <file.json> or --test")
            sys.exit(1)

        print(f"\n{'=' * 60}")
        print(f"  Agent 3 — DiffDock Simulation (manual mode)")
        print(f"{'=' * 60}\n")

        results, elapsed = run_docking(
            protein_pdb_path=args.protein,
            ligands=ligands,
            endpoint_id=args.endpoint_id,
            api_key=args.api_key,
            chunk_size=args.chunk_size,
            samples_per_complex=args.samples,
        )

        _print_results_table(results)

        output = {
            "results": results,
            "processing_time_seconds": round(elapsed, 2),
        }
        with open(args.output, "w") as f:
            json.dump(output, f, indent=2)
        print(f"\nResults saved to {args.output}")
        return

    # ----- Pipeline mode -----
    run_pipeline(
        input_file=args.input,
        output_file=args.output,
        samples_per_complex=args.samples,
        chunk_size=args.chunk_size,
        endpoint_id=args.endpoint_id,
        api_key=args.api_key,
    )


if __name__ == "__main__":
    main()
