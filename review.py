#!/usr/bin/env python3
"""
Cancer Literature Review Generator

Uses the arXiv API to find papers and the Perplexity API to synthesize
a full literature review (in Markdown) about a specific cancer type,
targetable proteins, and FDA-approved drugs that may interact with them.
"""

import argparse
import json
import os
from dotenv import load_dotenv
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_MODEL = "sonar-pro"

ARXIV_API_URL = "http://export.arxiv.org/api/query"
ARXIV_MAX_RESULTS = 15  # fetch up to 15 papers per query


# ---------------------------------------------------------------------------
# arXiv helpers
# ---------------------------------------------------------------------------

def search_arxiv(query: str, max_results: int = ARXIV_MAX_RESULTS) -> list[dict]:
    """Search arXiv and return a list of paper metadata dicts."""
    params = urllib.parse.urlencode({
        "search_query": query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "relevance",
        "sortOrder": "descending",
    })
    url = f"{ARXIV_API_URL}?{params}"
    print(f"[arXiv] Querying: {query!r}  (max {max_results} results)")

    with urllib.request.urlopen(url, timeout=30) as resp:
        xml_data = resp.read()

    root = ET.fromstring(xml_data)
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    papers = []
    for entry in root.findall("atom:entry", ns):
        paper = {
            "title": _text(entry, "atom:title", ns).replace("\n", " ").strip(),
            "summary": _text(entry, "atom:summary", ns).replace("\n", " ").strip(),
            "authors": [
                a.find("atom:name", ns).text
                for a in entry.findall("atom:author", ns)
            ],
            "published": _text(entry, "atom:published", ns)[:10],
            "arxiv_id": _text(entry, "atom:id", ns).split("/abs/")[-1],
            "link": _text(entry, "atom:id", ns),
        }
        papers.append(paper)

    print(f"[arXiv] Retrieved {len(papers)} papers.")
    return papers


def _text(element, tag, ns) -> str:
    node = element.find(tag, ns)
    return node.text.strip() if node is not None and node.text else ""


def format_papers_for_prompt(papers: list[dict]) -> str:
    """Format paper metadata into a readable block for the LLM prompt."""
    lines = []
    for i, p in enumerate(papers, 1):
        authors = ", ".join(p["authors"][:3])
        if len(p["authors"]) > 3:
            authors += " et al."
        lines.append(
            f"[{i}] {p['title']}\n"
            f"    Authors: {authors}\n"
            f"    Published: {p['published']}\n"
            f"    arXiv ID: {p['arxiv_id']}\n"
            f"    Abstract: {p['summary'][:500]}...\n"
        )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Perplexity helpers
# ---------------------------------------------------------------------------

def query_perplexity(system_prompt: str, user_prompt: str) -> str:
    """Send a chat-completion request to the Perplexity API and return the
    assistant's reply text."""
    if not PERPLEXITY_API_KEY:
        print("ERROR: PERPLEXITY_API_KEY environment variable is not set.",
              file=sys.stderr)
        sys.exit(1)

    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": PERPLEXITY_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 8000,
    }

    print("[Perplexity] Sending request …")
    resp = requests.post(PERPLEXITY_URL, json=payload, headers=headers, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    reply = data["choices"][0]["message"]["content"]
    print(f"[Perplexity] Received {len(reply)} chars.")
    return reply


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def build_cancer_query(cancer_type: str) -> str:
    """Build an arXiv search query for cancer biology / treatment papers."""
    return (
        f'all:("{cancer_type}" AND (treatment OR therapy OR target OR protein '
        f"OR pathway OR molecular OR biomarker))"
    )


def build_drug_query(cancer_type: str, proteins: list[str]) -> str:
    """Build an arXiv search query for FDA-approved drugs binding target
    proteins."""
    protein_clause = " OR ".join(f'"{p}"' for p in proteins[:6])
    return (
        f'all:("{cancer_type}" AND (FDA OR "approved drug" OR inhibitor '
        f"OR therapeutic) AND ({protein_clause}))"
    )


def build_repurposing_query(proteins: list[str]) -> str:
    """Build a broader arXiv query for drug repurposing, molecular docking,
    and off-target interaction studies for the given protein targets —
    intentionally NOT restricted to the cancer type."""
    protein_clause = " OR ".join(f'"{p}"' for p in proteins[:6])
    return (
        f'all:(({protein_clause}) AND ('
        f'"drug repurposing" OR "drug repositioning" OR "molecular docking" '
        f'OR "virtual screening" OR "off-target" OR "binding affinity" '
        f'OR "structure-activity" OR "polypharmacology"))'
    )


def extract_proteins_from_text(text: str) -> list[str]:
    """Ask Perplexity to extract a concise list of protein targets from the
    first-pass review."""
    system = (
        "You are a biomedical research assistant. "
        "Extract a concise list of protein targets from the following text. "
        "Return ONLY a Python-style list of short protein names/symbols, "
        "e.g. ['EGFR', 'HER2', 'BRAF']. No explanation."
    )
    raw = query_perplexity(system, text)
    # Parse the list from the response
    match = re.search(r"\[.*?\]", raw, re.DOTALL)
    if match:
        try:
            proteins = eval(match.group())  # safe-ish: only short names
            if isinstance(proteins, list):
                return [str(p) for p in proteins]
        except Exception:
            pass
    # Fallback: split comma-separated tokens
    return [tok.strip().strip("'\"") for tok in raw.split(",") if tok.strip()]


def main():
    parser = argparse.ArgumentParser(
        description="Generate a Markdown literature review about a cancer type."
    )
    parser.add_argument(
        "prompt",
        type=str,
        help="The specific cancer type to review (e.g., 'pancreatic cancer').",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default="review.md",
        help="Output Markdown file (default: review.md).",
    )
    args = parser.parse_args()

    cancer_type = args.prompt.strip()
    output_file = args.output

    print(f"\n{'='*60}")
    print(f"  Literature Review Generator  —  {cancer_type}")
    print(f"{'='*60}\n")

    # ----- Step 1: Search arXiv for cancer papers -----
    print(">> Step 1: Searching arXiv for papers on", cancer_type)
    cancer_query = build_cancer_query(cancer_type)
    cancer_papers = search_arxiv(cancer_query, max_results=ARXIV_MAX_RESULTS)

    if not cancer_papers:
        print("No papers found on arXiv. Try a different cancer type.",
              file=sys.stderr)
        sys.exit(1)

    cancer_papers_text = format_papers_for_prompt(cancer_papers)

    # ----- Step 2: Generate first-pass review (cancer + proteins) -----
    print("\n>> Step 2: Generating literature review via Perplexity …")
    system_review = (
        "You are an expert oncology researcher. Write a detailed, scholarly "
        "literature review in Markdown format. Use inline citations like "
        "[1], [2], etc., referencing the papers provided. Include proper "
        "section headings."
    )
    user_review = (
        f"Using the following arXiv papers as primary references, write a "
        f"comprehensive literature review about **{cancer_type}**.\n\n"
        f"The review MUST include:\n"
        f"1. An introduction to {cancer_type} (epidemiology, significance).\n"
        f"2. Molecular and genetic landscape of {cancer_type}.\n"
        f"3. **Key protein targets** that should be targeted for treatment "
        f"(explain the biological rationale for each).\n"
        f"4. Current therapeutic strategies and clinical relevance.\n"
        f"5. A references section listing each paper.\n\n"
        f"Papers:\n{cancer_papers_text}"
    )
    first_review = query_perplexity(system_review, user_review)

    # ----- Step 3: Extract protein targets -----
    print("\n>> Step 3: Extracting protein targets …")
    proteins = extract_proteins_from_text(first_review)
    print(f"    Identified proteins: {proteins}")

    if not proteins:
        proteins = ["EGFR", "p53", "KRAS"]  # sensible fallback
        print(f"    (Using fallback protein list: {proteins})")

    # ----- Step 4: Search arXiv for FDA-approved drugs -----
    # Brief pause to respect arXiv rate limits (≤1 req / 3 sec)
    time.sleep(3)
    print("\n>> Step 4a: Searching arXiv for mainstream drugs targeting these proteins …")
    drug_query = build_drug_query(cancer_type, proteins)
    drug_papers = search_arxiv(drug_query, max_results=ARXIV_MAX_RESULTS)

    # Step 4b: broader repurposing / docking / off-target search
    time.sleep(3)
    print("\n>> Step 4b: Searching arXiv for drug-repurposing & off-target interaction studies …")
    repurpose_query = build_repurposing_query(proteins)
    repurpose_papers = search_arxiv(repurpose_query, max_results=ARXIV_MAX_RESULTS)

    # Deduplicate by arxiv_id, keeping order
    seen_ids = {p["arxiv_id"] for p in drug_papers}
    for rp in repurpose_papers:
        if rp["arxiv_id"] not in seen_ids:
            drug_papers.append(rp)
            seen_ids.add(rp["arxiv_id"])

    drug_papers_text = format_papers_for_prompt(drug_papers) if drug_papers else "(No papers found.)"

    # ----- Step 5: Generate drug section -----
    print("\n>> Step 5a: Generating mainstream drug analysis via Perplexity …")

    # Reference numbering continues from the cancer papers
    offset = len(cancer_papers)
    re_numbered_drug_text = drug_papers_text
    if drug_papers:
        for i, _ in enumerate(drug_papers, 1):
            re_numbered_drug_text = re_numbered_drug_text.replace(
                f"[{i}]", f"[{i + offset}]", 1
            )

    system_drugs = (
        "You are an expert pharmacology researcher. Write a detailed Markdown "
        "section for a literature review. Use inline citations like [N] "
        "referencing the papers provided (numbering starts as indicated). "
        "Be precise about drug names, mechanisms, and protein interactions."
    )
    user_drugs = (
        f"Continue the literature review on **{cancer_type}**.\n\n"
        f"The identified protein targets are: {', '.join(proteins)}.\n\n"
        f"Using the arXiv papers below (citation numbers start at "
        f"[{offset + 1}]), write the following sections:\n\n"
        f"1. **FDA-Approved Drugs and Candidate Compounds**: For each protein "
        f"target, discuss FDA-approved drugs (or promising candidates) that "
        f"bind to or inhibit these proteins. Include drug names, mechanism of "
        f"action, and clinical evidence.\n"
        f"2. **Drug–Protein Interaction Summary Table** (Markdown table): "
        f"columns = Protein Target | Drug Name | Mechanism | FDA Status | Key Ref.\n"
        f"3. **Conclusion and Future Directions**: Summarise the therapeutic "
        f"landscape and open research questions.\n"
        f"4. **References** for papers [{offset + 1}] onward.\n\n"
        f"Papers:\n{re_numbered_drug_text}"
    )
    drug_review = query_perplexity(system_drugs, user_drugs)

    # ----- Step 5b: Speculative / repurposing drug discovery via Perplexity -----
    print("\n>> Step 5b: Searching for non-obvious repurposable FDA drugs via Perplexity …")
    repurposing_review = _discover_repurposing_candidates(cancer_type, proteins)

    # ----- Step 6: Assemble final document -----
    print("\n>> Step 6: Assembling final Markdown document …")

    # Build combined references
    all_papers = cancer_papers + drug_papers
    references_block = _build_references(all_papers)

    today = datetime.now().strftime("%B %d, %Y")
    final_md = (
        f"# Literature Review: {cancer_type.title()}\n\n"
        f"*Auto-generated on {today} using arXiv and Perplexity AI.*\n\n"
        f"---\n\n"
        f"{first_review}\n\n"
        f"---\n\n"
        f"{drug_review}\n\n"
        f"---\n\n"
        f"{repurposing_review}\n\n"
        f"---\n\n"
        f"## Consolidated References\n\n{references_block}\n"
    )

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(final_md)

    # ----- Step 8: Generate view.json (drug → protein mapping) -----
    print("\n>> Step 8: Generating view.json (drug–protein mapping) …")
    combined_drug_text = drug_review + "\n\n" + repurposing_review
    drug_protein_json = _extract_drug_protein_map(
        combined_drug_text, cancer_type, proteins
    )
    with open("view.json", "w", encoding="utf-8") as f:
        json.dump(drug_protein_json, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"  Review saved to: {output_file}")
    print(f"  Drug map saved to: view.json")
    print(f"  Total papers cited: {len(all_papers)}")
    print(f"{'='*60}\n")


def _discover_repurposing_candidates(
    cancer_type: str, proteins: list[str]
) -> str:
    """Use Perplexity (with web search) to find FDA-approved drugs from ANY
    therapeutic area that have structural, mechanistic, or computational
    evidence of interacting with the target proteins — even if they are not
    currently studied for this cancer."""
    system = (
        "You are a computational pharmacology expert specialising in drug "
        "repurposing and polypharmacology. You have access to web search. "
        "Write a detailed Markdown section for a literature review. "
        "Be exhaustive: include drugs from cardiology, psychiatry, "
        "infectious disease, metabolic disorders, autoimmune conditions, "
        "and any other field. Cite sources where possible."
    )
    user = (
        f"The following proteins have been identified as therapeutic targets "
        f"in **{cancer_type}**: {', '.join(proteins)}.\n\n"
        f"Search broadly across ALL FDA-approved drugs — not just oncology "
        f"drugs — and identify any that have known or computationally "
        f"predicted interactions with these proteins. Consider:\n"
        f"- Molecular docking studies showing binding affinity\n"
        f"- Shared binding-site homology with known inhibitors\n"
        f"- Off-target activity reported in pharmacovigilance data\n"
        f"- Structural similarity (Tanimoto ≥ 0.5) to known ligands\n"
        f"- Drug-gene interaction databases (DGIdb, DrugBank, STITCH)\n"
        f"- Repurposing screens or virtual screening hits\n\n"
        f"Write the following sections in Markdown:\n\n"
        f"## Non-Obvious & Repurposing Drug Candidates\n\n"
        f"For each drug, explain:\n"
        f"- Original indication / FDA-approved use\n"
        f"- Which target protein(s) it may interact with and the evidence\n"
        f"- Proposed mechanism of action against {cancer_type}\n"
        f"- Confidence level (strong evidence / computational prediction / "
        f"speculative)\n\n"
        f"## Repurposing Candidates Summary Table\n\n"
        f"Markdown table: Drug Name | Original Indication | Target Protein(s) "
        f"| Evidence Type | Confidence\n\n"
        f"Include at least 10 drugs. Prioritise non-obvious candidates that "
        f"are NOT already in mainstream {cancer_type} research."
    )
    return query_perplexity(system, user)


def _extract_drug_protein_map(drug_review_text: str, cancer_type: str, proteins: list[str]) -> dict:
    """Ask Perplexity to return a structured JSON of drugs and their
    protein targets, then parse and return it."""
    system = (
        "You are a biomedical data-extraction assistant. "
        "Return ONLY valid JSON with no extra text, no markdown fences. "
        "The JSON must be an object with a top-level key \"drugs\" whose value "
        "is an array of objects. Each object has: "
        "\"drug\" (string), \"proteins\" (list of target protein symbols), "
        "\"mechanism\" (string), \"fda_status\" (string), "
        "\"category\" (\"mainstream\" or \"repurposing_candidate\")."
    )
    user = (
        f"From the following literature review sections about {cancer_type}, "
        f"extract EVERY drug mentioned — both mainstream oncology drugs AND "
        f"repurposing candidates — and which of these proteins each may "
        f"bind to or react with: {', '.join(proteins)}.\n\n"
        f"Mark drugs that are commonly used for this cancer as "
        f"\"mainstream\". Mark drugs from other therapeutic areas or "
        f"speculative candidates as \"repurposing_candidate\".\n\n"
        f"Text:\n{drug_review_text}"
    )
    raw = query_perplexity(system, user)

    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback: try to find a JSON object in the response
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            data = {"drugs": [], "_parse_error": "Could not parse LLM response"}

    # Ensure consistent top-level structure
    if "drugs" not in data:
        data = {"drugs": data if isinstance(data, list) else []}

    data["cancer_type"] = cancer_type
    data["protein_targets"] = proteins
    return data


def _build_references(papers: list[dict]) -> str:
    lines = []
    for i, p in enumerate(papers, 1):
        authors = ", ".join(p["authors"][:3])
        if len(p["authors"]) > 3:
            authors += " et al."
        lines.append(
            f"[{i}] {authors}. \"{p['title']}.\" "
            f"arXiv:{p['arxiv_id']}, {p['published']}. {p['link']}"
        )
    return "\n\n".join(lines)


if __name__ == "__main__":
    main()
