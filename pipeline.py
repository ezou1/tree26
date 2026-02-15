#!/usr/bin/env python3
"""
Autonomous Drug Discovery Pipeline

Single orchestrator that runs the full pipeline: literature review →
structure retrieval → docking → **reasoning loop** → report → paper.

The reasoning loop is the agentic part: after each docking round,
Perplexity Sonar analyzes results, looks for patterns (e.g. drug-class
clustering), and decides whether to expand the search (3D similarity,
more drugs of a promising class) or proceed to synthesis.

Usage:
    python pipeline.py "pancreatic ductal adenocarcinoma"
    python pipeline.py "pleural mesothelioma" --max-rounds 3
    python pipeline.py --resume   # resume from last saved state
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Import existing pipeline functions (NO rewrites)
# ---------------------------------------------------------------------------

from review import (
    search_arxiv,
    query_perplexity,
    extract_proteins_from_text,
    format_papers_for_prompt,
    build_cancer_query,
    build_drug_query,
    build_repurposing_query,
    _discover_repurposing_candidates,
    _extract_drug_protein_map,
    _parse_json_response,
    _build_references,
)
from agent2 import (
    search_pdb,
    pick_best_structure,
    download_pdb,
    lookup_smiles,
    search_compounds_for_target,
    search_3d_similar,
    canonicalize_smiles,
)
from agent3 import run_docking
from results import (
    summarise_target,
    classify_compound,
    build_overview_block,
    build_classified_overview,
    format_target_summary_for_prompt,
    generate_methodology,
    generate_results,
    generate_conclusion,
)
from final import (
    generate_abstract,
    merge_introduction_and_background,
    merge_drug_landscape,
    merge_results as merge_results_section,
    merge_conclusions,
    _get_review_intro_sections,
    _get_review_drug_sections,
    _get_review_conclusion,
    _get_results_methodology,
    _get_results_body,
    _get_results_conclusion,
    _extract_references,
    _deduplicate_references,
    _strip_leading_header,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

STATE_FILE = "pipeline_state.json"
STRUCTURES_DIR = "structures"
MAX_EXPANSION_ROUNDS = 2
PUBCHEM_DELAY = 0.25


# ---------------------------------------------------------------------------
# Pipeline state
# ---------------------------------------------------------------------------

def new_state(cancer_type: str) -> dict:
    """Create a fresh pipeline state."""
    return {
        "cancer_type": cancer_type,
        "status": "initialized",
        "round": 0,
        "protein_targets": [],
        "drugs": [],
        "targets": [],          # agent2-style target entries (protein, pdb_id, pdb_file, ligands)
        "all_docking_results": [],  # accumulated across rounds
        "hypotheses": [],
        "expansion_history": [],
        "review_md": "",
        "results_md": "",
        "final_paper_md": "",
        "started_at": datetime.now().isoformat(),
    }


def save_state(state: dict):
    """Persist pipeline state to disk."""
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    os.replace(tmp, STATE_FILE)


def load_state() -> dict:
    """Load pipeline state from disk."""
    with open(STATE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Stage 1: Literature review + target identification
# ---------------------------------------------------------------------------

def stage_literature(state: dict) -> dict:
    """Run literature search, identify protein targets and drug candidates."""
    cancer_type = state["cancer_type"]

    print(f"\n{'='*60}")
    print(f"  Stage 1: Literature Review — {cancer_type}")
    print(f"{'='*60}\n")

    # Search arXiv
    print(">> Searching arXiv for cancer papers …")
    cancer_papers = search_arxiv(build_cancer_query(cancer_type))
    cancer_papers_text = format_papers_for_prompt(cancer_papers)

    # Generate literature review via Perplexity
    print(">> Generating literature review …")
    system_review = (
        "You are an expert oncology researcher. Write a detailed, scholarly "
        "literature review in Markdown format. Use inline citations like "
        "[1], [2], etc., referencing the papers provided."
    )
    user_review = (
        f"Using the following arXiv papers, write a comprehensive literature "
        f"review about **{cancer_type}**.\n\n"
        f"Include:\n"
        f"1. Introduction (epidemiology, significance)\n"
        f"2. Molecular and genetic landscape\n"
        f"3. **Key protein targets** for treatment\n"
        f"4. Current therapeutic strategies\n"
        f"5. References\n\n"
        f"Papers:\n{cancer_papers_text}"
    )
    first_review = query_perplexity(system_review, user_review)

    # Extract protein targets
    print(">> Extracting protein targets …")
    proteins = extract_proteins_from_text(first_review)
    if not proteins:
        proteins = ["EGFR", "p53", "KRAS"]
        print(f"    (Using fallback: {proteins})")
    print(f"    Targets: {proteins}")

    # Search for drug papers
    time.sleep(3)
    print(">> Searching arXiv for drug papers …")
    drug_papers = search_arxiv(build_drug_query(cancer_type, proteins))
    time.sleep(3)
    repurpose_papers = search_arxiv(build_repurposing_query(proteins))

    # Dedup
    seen_ids = {p["arxiv_id"] for p in drug_papers}
    for rp in repurpose_papers:
        if rp["arxiv_id"] not in seen_ids:
            drug_papers.append(rp)
            seen_ids.add(rp["arxiv_id"])

    drug_papers_text = format_papers_for_prompt(drug_papers) if drug_papers else "(No papers found.)"

    # Generate drug section
    print(">> Generating drug analysis …")
    offset = len(cancer_papers)
    system_drugs = (
        "You are an expert pharmacology researcher. Write a detailed Markdown "
        "section about FDA-approved drugs and repurposing candidates. "
        "Be precise about drug names, mechanisms, and protein interactions."
    )
    user_drugs = (
        f"Continue the review on **{cancer_type}**.\n\n"
        f"Protein targets: {', '.join(proteins)}.\n\n"
        f"Write sections on:\n"
        f"1. FDA-Approved Drugs and Candidate Compounds per target\n"
        f"2. Drug-Protein Interaction Summary Table\n"
        f"3. Conclusion and Future Directions\n\n"
        f"Papers:\n{drug_papers_text}"
    )
    drug_review = query_perplexity(system_drugs, user_drugs)

    # Repurposing candidates
    print(">> Searching for repurposing candidates …")
    repurposing_review = _discover_repurposing_candidates(cancer_type, proteins)

    # Assemble review markdown
    all_papers = cancer_papers + drug_papers
    references_block = _build_references(all_papers)
    today = datetime.now().strftime("%B %d, %Y")
    review_md = (
        f"# Literature Review: {cancer_type.title()}\n\n"
        f"*Auto-generated on {today}*\n\n---\n\n"
        f"{first_review}\n\n---\n\n"
        f"{drug_review}\n\n---\n\n"
        f"{repurposing_review}\n\n---\n\n"
        f"## Consolidated References\n\n{references_block}\n"
    )

    with open("review.md", "w", encoding="utf-8") as f:
        f.write(review_md)

    # Extract drug-protein map
    print(">> Extracting drug-protein map …")
    combined = drug_review + "\n\n" + repurposing_review
    drug_map = _extract_drug_protein_map(combined, cancer_type, proteins)

    with open("review.json", "w", encoding="utf-8") as f:
        json.dump(drug_map, f, indent=2, ensure_ascii=False)

    # Update state
    state["protein_targets"] = proteins
    state["drugs"] = drug_map.get("drugs", [])
    state["review_md"] = review_md
    state["status"] = "literature_complete"
    save_state(state)

    print(f"\n  >> Literature complete: {len(proteins)} targets, {len(state['drugs'])} drugs")
    return state


# ---------------------------------------------------------------------------
# Stage 2: Structure retrieval
# ---------------------------------------------------------------------------

def stage_structure(state: dict, extra_ligands: dict | None = None) -> dict:
    """Retrieve PDB structures and drug SMILES.

    extra_ligands: optional dict mapping protein name → list of
      {"name": str, "smiles": str, "mechanism": str, "source": str}
      from expansion rounds.
    """
    cancer_type = state["cancer_type"]
    proteins = state["protein_targets"]
    drugs = state["drugs"]

    print(f"\n{'='*60}")
    print(f"  Stage 2: Structure Retrieval")
    print(f"{'='*60}\n")

    targets = []

    for protein in proteins:
        print(f"\n{'─'*40}")
        print(f"  Processing: {protein}")
        print(f"{'─'*40}\n")

        # Search PDB
        candidates = search_pdb(protein)
        if not candidates:
            gene = protein.split()[0]
            if gene != protein:
                candidates = search_pdb(gene)

        pdb_id = None
        pdb_file = None
        if candidates:
            best = pick_best_structure(candidates)
            if best:
                pdb_id = best["pdb_id"]
                pdb_file = download_pdb(pdb_id, STRUCTURES_DIR)

        # Look up SMILES for known drugs
        ligands = []
        for drug_info in drugs:
            if protein not in drug_info.get("proteins", []):
                continue
            drug_name = drug_info["drug"]
            time.sleep(PUBCHEM_DELAY)
            result = lookup_smiles(drug_name)
            ligands.append({
                "name": drug_name,
                "smiles": result["smiles"] if result else "",
                "mechanism": drug_info.get("mechanism", ""),
                "fda_status": drug_info.get("fda_status", "Unknown"),
                "source": f"pubchem_cid_{result['cid']}" if result else "no_smiles",
            })

        # Discover bioactive compounds
        extra = search_compounds_for_target(protein, max_compounds=50)
        existing_smiles = {l["smiles"] for l in ligands if l["smiles"]}
        for c in extra:
            if c["smiles"] and c["smiles"] not in existing_smiles:
                ligands.append({
                    "name": c.get("iupac_name", f"CID_{c['cid']}"),
                    "smiles": c["smiles"],
                    "mechanism": "Bioactive — PubChem target search",
                    "fda_status": "Unknown — requires verification",
                    "source": f"pubchem_cid_{c['cid']}",
                })
                existing_smiles.add(c["smiles"])

        # Add expansion ligands if provided
        if extra_ligands and protein in extra_ligands:
            for lig in extra_ligands[protein]:
                if lig["smiles"] and lig["smiles"] not in existing_smiles:
                    ligands.append(lig)
                    existing_smiles.add(lig["smiles"])

        # Drop empty SMILES
        ligands = [l for l in ligands if l["smiles"]]

        targets.append({
            "protein": protein,
            "pdb_id": pdb_id,
            "pdb_file": pdb_file,
            "ligands": ligands,
        })

        print(f"  >> {protein}: PDB={pdb_id}, {len(ligands)} ligands")

    state["targets"] = targets
    state["status"] = "structures_complete"
    save_state(state)

    # Also write agent2_output.json for compatibility
    with open("agent2_output.json", "w", encoding="utf-8") as f:
        json.dump({"cancer_type": cancer_type, "targets": targets}, f, indent=2)

    return state


# ---------------------------------------------------------------------------
# Stage 3: Docking
# ---------------------------------------------------------------------------

def stage_docking(state: dict, targets_to_dock: list[dict] | None = None) -> dict:
    """Run DiffDock on all targets (or a subset for expansion rounds)."""
    targets = targets_to_dock or state["targets"]
    round_num = state["round"]

    print(f"\n{'='*60}")
    print(f"  Stage 3: DiffDock Docking — Round {round_num}")
    print(f"{'='*60}\n")

    round_results = []

    for target in targets:
        protein = target["protein"]
        pdb_file = target.get("pdb_file")
        ligands = target.get("ligands", [])

        if not pdb_file or not os.path.exists(pdb_file):
            print(f"  WARNING: No PDB file for {protein}, skipping")
            continue

        dock_ligands = [
            {"name": l["name"], "smiles": l["smiles"]}
            for l in ligands if l.get("smiles")
        ]

        if not dock_ligands:
            print(f"  WARNING: No ligands for {protein}, skipping")
            continue

        print(f"\n  Docking {len(dock_ligands)} ligands against {protein} …")
        results, elapsed = run_docking(
            protein_pdb_path=pdb_file,
            ligands=dock_ligands,
        )

        # Merge metadata back
        ligand_meta = {l["name"]: l for l in ligands}
        for r in results:
            meta = ligand_meta.get(r["name"], {})
            r["mechanism"] = meta.get("mechanism", "")
            r["fda_status"] = meta.get("fda_status", "")
            r["source"] = meta.get("source", "")
            r["protein_target"] = protein
            r["pdb_id"] = target.get("pdb_id", "")
            r["round"] = round_num

        round_results.extend(results)

        print(f"  Top 5 for {protein}:")
        for i, r in enumerate(results[:5]):
            print(f"    {i+1}. {r['name'][:40]:40s} score={r['confidence_score']:.4f}")

    state["all_docking_results"].extend(round_results)
    state["status"] = f"docking_round_{round_num}_complete"
    save_state(state)

    # Write agent3_output.json for compatibility
    _write_docking_output(state)

    return state


def _write_docking_output(state: dict):
    """Write agent3_output.json from accumulated results."""
    results_by_protein = {}
    for r in state["all_docking_results"]:
        prot = r.get("protein_target", "unknown")
        results_by_protein.setdefault(prot, []).append(r)

    target_entries = []
    for target in state["targets"]:
        protein = target["protein"]
        results = results_by_protein.get(protein, [])
        results.sort(key=lambda x: x.get("confidence_score", 0), reverse=True)
        target_entries.append({
            "protein": protein,
            "pdb_id": target.get("pdb_id"),
            "pdb_file": target.get("pdb_file"),
            "status": "completed",
            "num_ligands_total": len(target.get("ligands", [])),
            "num_ligands_docked": len(results),
            "docking_time_seconds": 0,
            "results": results,
        })

    output = {
        "cancer_type": state["cancer_type"],
        "status": "completed",
        "completed_targets": len(target_entries),
        "total_targets": len(target_entries),
        "total_docking_time_seconds": 0,
        "targets": target_entries,
    }
    with open("agent3_output.json", "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Stage 4: Reasoning loop (THE AGENTIC PART)
# ---------------------------------------------------------------------------

def analyze_and_decide(state: dict) -> dict:
    """Ask Perplexity to analyze docking results and decide next action.

    This is the core agentic reasoning: Perplexity examines the results,
    looks for patterns (drug class clustering, structural similarity),
    forms a hypothesis, and decides whether to expand the search or
    proceed to paper generation.

    Returns: {"action": "expand_3d_similar"|"expand_class"|"proceed",
              "rationale": str, "hypothesis": str, ...}
    """
    cancer_type = state["cancer_type"]
    round_num = state["round"]
    results = state["all_docking_results"]
    hypotheses = state["hypotheses"]

    # Build a summary of top results for the prompt
    top_results = sorted(results, key=lambda x: x.get("confidence_score", 0), reverse=True)[:30]
    results_summary = []
    for r in top_results:
        results_summary.append({
            "name": r["name"],
            "score": round(r.get("confidence_score", 0), 4),
            "mechanism": r.get("mechanism", "")[:100],
            "fda_status": r.get("fda_status", "")[:60],
            "protein": r.get("protein_target", ""),
            "source": r.get("source", ""),
            "round": r.get("round", 1),
        })

    system = (
        "You are a computational pharmacology researcher analyzing molecular "
        "docking results for drug repurposing. You must return ONLY valid JSON.\n\n"
        "Analyze the top docking hits and look for patterns:\n"
        "- Are drugs from the same therapeutic class clustering as top hits?\n"
        "  (e.g., multiple statins, multiple SSRIs, multiple kinase inhibitors)\n"
        "- Do top-scoring compounds share structural features?\n"
        "- Are there unexplored drug classes that might work?\n\n"
        "Return a JSON object with:\n"
        '  "action": one of "expand_3d_similar", "expand_class", or "proceed"\n'
        '  "rationale": your analysis of the patterns (2-3 sentences)\n'
        '  "hypothesis": a specific scientific hypothesis (1 sentence)\n'
        '  "seed_cids": [list of CID numbers] (if action is expand_3d_similar)\n'
        '  "drug_class": "class name" (if action is expand_class)\n'
        '  "drug_names": ["drug1", "drug2", ...] (if action is expand_class)\n\n'
        "Rules:\n"
        f"- This is round {round_num}. Max rounds: {MAX_EXPANSION_ROUNDS + 1}.\n"
        f'- If round >= {MAX_EXPANSION_ROUNDS + 1}, you MUST choose "proceed".\n'
        '- Only choose "expand" if you see a clear pattern worth investigating.\n'
        '- If expanding, be specific about which CIDs or drug names to test.'
    )

    user = (
        f"Cancer type: {cancer_type}\n"
        f"Round: {round_num}\n"
        f"Previous hypotheses: {json.dumps(hypotheses)}\n"
        f"Previous expansions: {json.dumps(state['expansion_history'])}\n\n"
        f"Top 30 docking results (sorted by confidence score):\n"
        f"{json.dumps(results_summary, indent=2)}\n\n"
        f"Analyze these results and return your decision as JSON."
    )

    print(f"\n{'='*60}")
    print(f"  Stage 4: Reasoning — Round {round_num}")
    print(f"{'='*60}\n")
    print(">> Asking Perplexity to analyze results …")

    raw = query_perplexity(system, user)
    decision = _parse_json_response(raw)

    # Ensure required fields
    if "action" not in decision:
        decision["action"] = "proceed"
    if decision["action"] not in ("expand_3d_similar", "expand_class", "proceed"):
        decision["action"] = "proceed"
    decision.setdefault("rationale", "")
    decision.setdefault("hypothesis", "")

    # Force proceed if we've hit max rounds
    if round_num >= MAX_EXPANSION_ROUNDS + 1:
        decision["action"] = "proceed"
        decision["rationale"] += " (Max rounds reached, proceeding to synthesis.)"

    print(f"\n  Decision: {decision['action']}")
    print(f"  Rationale: {decision['rationale']}")
    print(f"  Hypothesis: {decision['hypothesis']}")

    # Record
    state["hypotheses"].append(decision.get("hypothesis", ""))
    state["expansion_history"].append({
        "round": round_num,
        "action": decision["action"],
        "rationale": decision["rationale"],
    })
    save_state(state)

    return decision


def execute_expansion(state: dict, decision: dict) -> dict:
    """Execute an expansion decision: fetch new compounds and dock them."""
    action = decision["action"]
    cancer_type = state["cancer_type"]

    print(f"\n{'='*60}")
    print(f"  Expansion: {action}")
    print(f"{'='*60}\n")

    new_ligands_by_protein = {}  # protein → [ligand dicts]

    if action == "expand_3d_similar":
        seed_cids = decision.get("seed_cids", [])
        if not seed_cids:
            # Fall back to top-scoring compounds that have CIDs
            for r in sorted(
                state["all_docking_results"],
                key=lambda x: x.get("confidence_score", 0),
                reverse=True,
            ):
                src = r.get("source", "")
                if src.startswith("pubchem_cid_"):
                    try:
                        cid = int(src.split("_")[-1])
                        seed_cids.append(cid)
                    except ValueError:
                        pass
                if len(seed_cids) >= 5:
                    break

        print(f"  Expanding 3D similarity for CIDs: {seed_cids}")
        for cid in seed_cids:
            time.sleep(PUBCHEM_DELAY)
            similar = search_3d_similar(cid, max_results=10)
            for c in similar:
                if c["smiles"]:
                    lig = {
                        "name": c.get("iupac_name", f"CID_{c['cid']}"),
                        "smiles": c["smiles"],
                        "mechanism": f"3D-similar to CID {cid} (ST≥0.80, CT≥0.50)",
                        "fda_status": "Unknown — requires verification",
                        "source": f"pubchem_3dsim_cid_{c['cid']}_from_{cid}",
                    }
                    # Add to all protein targets
                    for protein in state["protein_targets"]:
                        new_ligands_by_protein.setdefault(protein, []).append(lig)

    elif action == "expand_class":
        drug_names = decision.get("drug_names", [])
        drug_class = decision.get("drug_class", "")

        if not drug_names and drug_class:
            # Ask Perplexity for specific drug names in this class
            print(f"  Asking Perplexity for {drug_class} drugs …")
            raw = query_perplexity(
                "You are a pharmacology expert. Return ONLY a JSON list of "
                "FDA-approved drug names (generic names). No explanation.",
                f"List 10 FDA-approved drugs in the class: {drug_class}. "
                f"Exclude any already in this list: "
                f"{[r['name'] for r in state['all_docking_results'][:20]]}",
            )
            try:
                match = re.search(r"\[.*?\]", raw, re.DOTALL)
                if match:
                    drug_names = json.loads(match.group())
            except (json.JSONDecodeError, AttributeError):
                pass

        print(f"  Looking up SMILES for {len(drug_names)} drugs: {drug_names}")
        for name in drug_names[:10]:
            time.sleep(PUBCHEM_DELAY)
            result = lookup_smiles(str(name))
            if result and result["smiles"]:
                lig = {
                    "name": str(name),
                    "smiles": result["smiles"],
                    "mechanism": f"Class expansion: {drug_class}",
                    "fda_status": "FDA-approved (class expansion)",
                    "source": f"pubchem_cid_{result['cid']}",
                }
                for protein in state["protein_targets"]:
                    new_ligands_by_protein.setdefault(protein, []).append(lig)

    # Count new compounds
    total_new = sum(len(v) for v in new_ligands_by_protein.values())
    print(f"\n  >> Added {total_new} new ligands across {len(new_ligands_by_protein)} targets")

    if not new_ligands_by_protein:
        print("  >> No new compounds found, proceeding to synthesis")
        return state

    # Build docking targets for just the new compounds
    expansion_targets = []
    for target in state["targets"]:
        protein = target["protein"]
        new_ligs = new_ligands_by_protein.get(protein, [])
        if new_ligs and target.get("pdb_file"):
            expansion_targets.append({
                "protein": protein,
                "pdb_id": target.get("pdb_id"),
                "pdb_file": target["pdb_file"],
                "ligands": new_ligs,
            })

    # Dock the new compounds
    state["round"] += 1
    state = stage_docking(state, targets_to_dock=expansion_targets)
    return state


# ---------------------------------------------------------------------------
# Stage 5 & 6: Report generation + paper assembly
# ---------------------------------------------------------------------------

def stage_report(state: dict) -> dict:
    """Generate results.md from docking data."""
    cancer_type = state["cancer_type"]

    print(f"\n{'='*60}")
    print(f"  Stage 5: Report Generation")
    print(f"{'='*60}\n")

    # Load docking data from the file we wrote
    from results import load_docking_data
    data = load_docking_data("agent3_output.json")

    target_summaries = [summarise_target(t) for t in data.get("targets", [])]
    overview = build_overview_block(data, target_summaries)
    classified = build_classified_overview(target_summaries, cancer_type)

    # Include reasoning history in the report
    reasoning_note = ""
    if state["hypotheses"]:
        reasoning_note = (
            "\n\n### Autonomous Reasoning History\n\n"
            "The following hypotheses were generated and tested autonomously "
            "by the pipeline's reasoning loop:\n\n"
        )
        for i, (hyp, exp) in enumerate(
            zip(state["hypotheses"], state["expansion_history"]), 1
        ):
            reasoning_note += (
                f"**Round {i}:** {hyp}\n"
                f"- Action: {exp['action']}\n"
                f"- Rationale: {exp['rationale']}\n\n"
            )

    print(">> Generating Methodology …")
    methodology = generate_methodology(cancer_type, overview)

    print(">> Generating Results …")
    results_text = generate_results(cancer_type, overview, classified)

    print(">> Generating Conclusion …")
    conclusion = generate_conclusion(cancer_type, overview, classified)

    # Strip duplicate headers
    methodology = _strip_leading_header(methodology)
    results_text = _strip_leading_header(results_text)
    conclusion = _strip_leading_header(conclusion)

    today = datetime.now().strftime("%B %d, %Y")
    results_md = (
        f"# Molecular Docking Analysis: {cancer_type.title()}\n\n"
        f"*Auto-generated on {today}*\n\n---\n\n"
        f"## Methodology\n\n{methodology}\n\n---\n\n"
        f"## Results\n\n{results_text}\n\n"
        f"{reasoning_note}\n\n---\n\n"
        f"## Conclusion\n\n{conclusion}\n"
    )

    with open("results.md", "w", encoding="utf-8") as f:
        f.write(results_md)

    state["results_md"] = results_md
    state["status"] = "report_complete"
    save_state(state)

    return state


def stage_paper(state: dict) -> dict:
    """Assemble the final research paper from review.md + results.md."""
    cancer_type = state["cancer_type"]

    print(f"\n{'='*60}")
    print(f"  Stage 6: Final Paper Assembly")
    print(f"{'='*60}\n")

    review_md = state.get("review_md", "")
    results_md = state.get("results_md", "")

    if not review_md:
        with open("review.md", "r") as f:
            review_md = f.read()
    if not results_md:
        with open("results.md", "r") as f:
            results_md = f.read()

    # Extract sections
    review_intro = _get_review_intro_sections(review_md)
    review_drugs = _get_review_drug_sections(review_md)
    review_conclusion = _get_review_conclusion(review_md)
    results_methodology = _get_results_methodology(results_md)
    results_body = _get_results_body(results_md)
    results_conclusion = _get_results_conclusion(results_md)
    review_refs = _extract_references(review_md)

    print(">> Generating abstract …")
    abstract = _strip_leading_header(generate_abstract(review_md, results_md))

    print(">> Merging Introduction …")
    intro = _strip_leading_header(
        merge_introduction_and_background(review_intro, results_md)
    )

    print(">> Merging Therapeutic Landscape …")
    landscape = _strip_leading_header(merge_drug_landscape(review_drugs))

    methodology = _strip_leading_header(results_methodology)

    print(">> Merging Results …")
    docking_results = _strip_leading_header(merge_results_section(results_body))

    print(">> Merging Conclusions …")
    conclusion = _strip_leading_header(
        merge_conclusions(review_conclusion, results_conclusion)
    )

    unified_refs = _deduplicate_references(review_refs, "")

    today = datetime.now().strftime("%B %d, %Y")
    final_md = (
        f"# Drug Repurposing for {cancer_type.title()}: A Computational Docking "
        f"and Literature Review Study\n\n"
        f"*{today}*\n\n---\n\n"
        f"## Abstract\n\n{abstract}\n\n---\n\n"
        f"## 1. Introduction and Background\n\n{intro}\n\n---\n\n"
        f"## 2. Therapeutic Landscape\n\n{landscape}\n\n---\n\n"
        f"## 3. Methodology\n\n{methodology}\n\n---\n\n"
        f"## 4. Computational Docking Results\n\n{docking_results}\n\n---\n\n"
        f"## 5. Conclusion\n\n{conclusion}\n\n---\n\n"
        f"## References\n\n{unified_refs}\n"
    )

    with open("final_paper.md", "w", encoding="utf-8") as f:
        f.write(final_md)

    state["final_paper_md"] = final_md
    state["status"] = "complete"
    save_state(state)

    print(f"\n  >> Final paper: final_paper.md ({len(final_md):,} chars)")
    return state


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------

def run_pipeline(cancer_type: str, max_rounds: int = MAX_EXPANSION_ROUNDS):
    """Run the full autonomous pipeline."""
    state = new_state(cancer_type)

    print(f"\n{'#'*60}")
    print(f"  Autonomous Drug Discovery Pipeline")
    print(f"  Target: {cancer_type}")
    print(f"  Max expansion rounds: {max_rounds}")
    print(f"{'#'*60}\n")

    # Stage 1: Literature
    state = stage_literature(state)

    # Stage 2: Structure retrieval
    state = stage_structure(state)

    # Stage 3: First docking round
    state["round"] = 1
    state = stage_docking(state)

    # Stage 4: Reasoning loop
    for _ in range(max_rounds):
        decision = analyze_and_decide(state)

        if decision["action"] == "proceed":
            print("\n  >> Reasoning decided: proceed to synthesis")
            break

        # Execute expansion and re-dock
        state = execute_expansion(state, decision)

        # Analyze again after expansion
        # (the loop continues and will call analyze_and_decide again)

    # Stage 5: Report
    state = stage_report(state)

    # Stage 6: Paper
    state = stage_paper(state)

    # Final summary
    total_compounds = len(state["all_docking_results"])
    total_rounds = state["round"]
    print(f"\n{'#'*60}")
    print(f"  Pipeline Complete")
    print(f"  Cancer type:     {cancer_type}")
    print(f"  Docking rounds:  {total_rounds}")
    print(f"  Total compounds: {total_compounds}")
    print(f"  Hypotheses:      {len(state['hypotheses'])}")
    print(f"  Output:          final_paper.md")
    print(f"{'#'*60}\n")

    return state


def resume_pipeline():
    """Resume from the last saved state."""
    if not os.path.exists(STATE_FILE):
        print(f"ERROR: No state file found ({STATE_FILE})", file=sys.stderr)
        sys.exit(1)

    state = load_state()
    status = state["status"]
    cancer_type = state["cancer_type"]

    print(f"\n  Resuming pipeline for '{cancer_type}' (status: {status})")

    if status == "literature_complete":
        state = stage_structure(state)
        state["round"] = 1
        state = stage_docking(state)
        decision = analyze_and_decide(state)
        if decision["action"] != "proceed":
            state = execute_expansion(state, decision)
        state = stage_report(state)
        state = stage_paper(state)

    elif "docking" in status:
        # Rewrite agent3_output.json with correct schema before report
        _write_docking_output(state)
        state = stage_report(state)
        state = stage_paper(state)

    elif status == "report_complete":
        state = stage_paper(state)

    elif status == "complete":
        print("  Pipeline already complete.")

    else:
        print(f"  Unknown status: {status}. Starting from structures.")
        state = stage_structure(state)
        state["round"] = 1
        state = stage_docking(state)
        decision = analyze_and_decide(state)
        if decision["action"] != "proceed":
            state = execute_expansion(state, decision)
        state = stage_report(state)
        state = stage_paper(state)

    return state


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Autonomous Drug Discovery Pipeline"
    )
    parser.add_argument(
        "cancer_type",
        nargs="?",
        type=str,
        help="Cancer type to analyze (e.g. 'pancreatic ductal adenocarcinoma')",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from last saved pipeline state.",
    )
    parser.add_argument(
        "--max-rounds",
        type=int,
        default=MAX_EXPANSION_ROUNDS,
        help=f"Max expansion rounds (default: {MAX_EXPANSION_ROUNDS}).",
    )
    args = parser.parse_args()

    if args.resume:
        resume_pipeline()
    elif args.cancer_type:
        run_pipeline(args.cancer_type, max_rounds=args.max_rounds)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
