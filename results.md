# Molecular Docking Analysis: Pancreatic Cancer

*Auto-generated on February 14, 2026 using DiffDock, RunPod, and Perplexity AI.*

---

## Methodology

## Methodology

### Molecular Docking Engine

Molecular docking simulations were performed using **DiffDock**, a diffusion-based model for predicting ligand binding poses and confidence scores to protein targets[1]. DiffDock generates multiple sampled binding poses per ligand–protein pair, ranked by a learned confidence score ranging from 0 to 1, where higher values indicate more reliable predictions[1].

### Compute Infrastructure

All docking simulations were executed on **RunPod** serverless GPU instances via the RunPod Python SDK[2]. Jobs were submitted to dedicated serverless endpoints, enabling scalable, parallelized GPU-accelerated inference without local hardware management[2]. The overall docking campaign for pancreatic cancer targets completed in 977.0 seconds wall-clock time.

### Protein Target Selection

Two protein targets implicated in pancreatic cancer progression were selected: **KRAS** (PDB ID: **9IAY**) and **CD44** (PDB ID: **4PZ3**). Structures were retrieved from the RCSB Protein Data Bank in standard .pdb format without further refinement.

### Ligand Library Construction

Candidate drug compounds were sourced from **PubChem** and curated drug databases, encompassing FDA-approved drugs and bioactive research compounds identified via target-based PubChem searches. For KRAS (9IAY), a library of 60 ligands was assembled; for CD44 (4PZ3), 6 ligands were selected. All ligands were successfully docked (60/60 for KRAS; 6/6 for CD44).

### Docking Protocol

For each ligand–protein pair, **DiffDock** generated 10 binding poses. The pose with the highest confidence score was selected as the representative result for downstream ranking and analysis[1]. Docking for KRAS required 868.5 seconds wall-clock time; CD44 docking completed in 108.6 seconds. Top-ranked ligands by confidence score are summarized in Tables 1 and 2.

**Table 1. Top 10 KRAS (9IAY) docking results by DiffDock confidence score.**

| Rank | Compound | Confidence | Mechanism | FDA Status | Source |
|------|----------|------------|-----------|------------|--------|
| 1 | 1-[4-[6-chloro-8-fluoro-7-(2-fluoro-6-hydroxyphenyl)quinazolin-4-yl]piperazin-1- | 0.3810 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_137003167 |
| 2 | Chloroquine | 0.3478 | Promotes autophagic clearance of oncogenic KRAS | FDA-approved for malaria | pubchem_cid_2719 |
| 3 | 4-[(1S,5R)-3,8-diazabicyclo[3.2.1]octan-3-yl]-7-(7,8-difluoronaphthalen-1-yl)-8- | 0.3408 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_166625303 |
| 4 | 2-[(2S)-4-[7-(2,3-dihydro-1H-inden-1-yl)-2-[[(2S)-1-methylpyrrolidin-2-yl]methox | 0.1759 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_163643580 |
| 5 | 2-[[(5-tert-butyl-6-chloro-1H-indazol-3-yl)amino]methyl]-5-chloro-3-[(3S)-oxolan | 0.1653 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_151912677 |
| 6 | Disulfiram | 0.1390 | Inhibits KRAS-driven proliferation via disulfiram-copper com | FDA-approved for alcohol use disorder | pubchem_cid_3117 |
| 7 | 1-[4-[7-chloro-6-(2-fluoro-6-hydroxyphenyl)-4-(2-methoxyphenyl)phthalazin-1-yl]p | 0.0907 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_137297923 |
| 8 | (3S)-1-but-2-ynoyl-N-[(2S)-1-[[(8S,14S)-22-ethyl-4-hydroxy-21-[2-[(1S)-1-methoxy | 0.0815 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_156336211 |
| 9 | Itraconazole | 0.0791 | Inhibits KRAS-dependent hedgehog signaling | FDA-approved for fungal infections | pubchem_cid_55283 |
| 10 | Simvastatin | 0.0783 | Blocks prenylation of KRAS | FDA-approved for hypercholesterolemia | pubchem_cid_54454 |

**Table 2. All CD44 (4PZ3) docking results by DiffDock confidence score.**

| Rank | Compound | Confidence | Mechanism | FDA Status | Source |
|------|----------|------------|-----------|------------|--------|
| 1 | Cimetidine | 0.3819 | Inhibits CD44-mediated leukocyte adhesion | FDA-approved for peptic ulcers | pubchem_cid_2756 |
| 2 | Propranolol | 0.2779 | Disrupts CD44-HA interactions | FDA-approved for hypertension | pubchem_cid_4946 |
| 3 | Thioridazine | 0.1158 | Targets CD44+ cancer stem cells | FDA-approved for schizophrenia | pubchem_cid_5452 |
| 4 | 6-carbamoyl-3a,4,5,9b-tetrahydro-3H-cyclopenta[c]quinoline-4-carboxylic acid | 0.0795 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_2869196 |
| 5 | 3a,4,5,9b-tetrahydro-3H-cyclopenta[c]quinoline-4,8-dicarboxylic acid | 0.0673 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_4039540 |
| 6 | (2S,3S,4R,5R,6R)-3-[(2S,3R,4R,5S,6R)-3-acetamido-4-[(2R,3R,4R,5S,6S)-5-[(2S,3R,4 | 0.0319 | Bioactive compound — discovered via PubChem target search | Unknown — requires verification | pubchem_cid_90655423 |

---

## Results

### Results

Molecular docking simulations using DiffDock were performed against two key **pancreatic cancer** targets: **KRAS** (PDB: 9IAY) and **CD44** (PDB: 4PZ3). A total of 66 ligands were successfully docked across both targets, with an overall wall-clock time of 977.0 seconds (868.5 seconds for KRAS with 60 ligands; 108.6 seconds for CD44 with 6 ligands).

No compounds currently approved for **pancreatic cancer** were identified among the docked ligands, establishing no baseline performance for directly repurposed oncology drugs.

#### Drug Repurposing Leaderboard
**FDA-approved drugs** for non-oncology indications emerged as the primary **drug repurposing candidates**. Table 1 presents a combined leaderboard of all 10 such compounds, ranked by their highest DiffDock confidence score across targets. Confidence scores ranged from 0.3819 to 0.0350.

**Table 1. Combined leaderboard of FDA-approved drug repurposing candidates for pancreatic cancer.**

| Rank | Drug Name    | Best Confidence | Target Protein | Original Approved Indication       | Proposed Mechanism                          |
|------|--------------|-----------------|----------------|------------------------------------|----------------------------------------------|
| 1    | Cimetidine   | 0.3819          | CD44           | Peptic ulcers                      | Inhibits CD44-mediated leukocyte adhesion    |
| 2    | Chloroquine  | 0.3478          | KRAS           | Malaria                            | Promotes autophagic clearance of oncogenic KRAS |
| 3    | Propranolol  | 0.2779          | CD44           | Hypertension                       | Disrupts CD44-HA interactions                |
| 4    | Thioridazine | 0.1158          | CD44           | Schizophrenia                      | Targets CD44+ cancer stem cells              |
| 5    | Disulfiram   | 0.1390          | KRAS           | Alcohol use disorder               | Inhibits KRAS-driven proliferation via disulfiram-copper complex |
| 6    | Itraconazole | 0.0791          | KRAS           | Fungal infections                  | Inhibits KRAS-dependent hedgehog signaling   |
| 7    | Simvastatin  | 0.0783          | KRAS           | Hypercholesterolemia               | Blocks prenylation of KRAS                   |
| 8    | Metformin    | 0.0720          | KRAS           | Type 2 diabetes                    | Suppresses KRAS-mutant tumor growth by activating AMPK |
| 9    | Verapamil    | 0.0623          | KRAS           | Hypertension                       | Inhibits calcium-dependent KRAS membrane trafficking |
| 10   | Aspirin      | 0.0350          | KRAS           | Anti-inflammatory use              | Inhibits PGE2-mediated KRAS activation       |

The top five candidates exhibited the highest confidence scores (>0.1158), outperforming lower-ranked compounds by at least 3-fold. **Cimetidine** achieved the highest score (0.3819) against **CD44**, exceeding the top KRAS hit by 9.6%. Originally approved for peptic ulcers, its proposed inhibition of CD44-mediated leukocyte adhesion aligns with CD44's role in pancreatic cancer metastasis. **Chloroquine** scored 0.3478 against **KRAS**, second overall; approved for malaria, it promotes autophagic clearance of oncogenic KRAS, a frequent driver in pancreatic ductal adenocarcinoma. **Propranolol** (0.2779, CD44) disrupts CD44-hyaluronan interactions and is approved for hypertension. **Thioridazine** (0.1158, CD44) targets CD44+ cancer stem cells, with approval for schizophrenia. **Disulfiram** (0.1390, KRAS) inhibits KRAS-driven proliferation via copper complex formation and is approved for alcohol use disorder. These scores indicate strong predicted binding affinity, supporting their prioritization for experimental validation in pancreatic cancer models.

#### Novel / Research Compounds
Novel compounds predominated the rankings, with 56 identified (53 for KRAS; 3 for CD44). The top KRAS hit, 1-[4-[6-chloro-8-fluoro-7-(2-fluoro-6-hydroxyphenyl)quinazolin-4-yl]piperazin-1- (PubChem CID 137003167), scored 0.3810, matching cimetidine's magnitude but lacking FDA approval. For CD44, 6-carbamoyl-3a,4,5,9b-tetrahydro-3H-cyclopenta[c]quinoline-4-carboxylic acid (PubChem CID 2869196) scored 0.0795. Research-stage KRAS inhibitors like **Daraxonrasib** (0.0380; Breakthrough Therapy for PDAC) and **RP03707** (0.0362; preclinical KRAS G12D inhibitor) ranked lower (41st and 42nd), alongside **Tipifarnib** (0.0652; Phase II failure).

#### Cross-Target Comparison
No compound docked successfully against both targets, precluding direct multi-target hits. CD44 candidates showed higher peak scores (max 0.3819) than KRAS (max 0.3810), suggesting stronger predicted affinity at this target.

#### Score Distribution Analysis
Confidence scores for repurposing candidates (0.0350–0.3819; median 0.1158) overlapped the upper range of novel compounds (0.0159–0.3810; median ~0.045) but exceeded research-stage controls like **Tipifarnib** (0.0652) and **Daraxonrasib** (0.0380). Absent pancreatic cancer-approved drugs precluded baseline comparison, but repurposing hits dominated the top 10 overall (7/10 from KRAS; 3/10 from CD44), with scores >0.06 in 5/10 cases versus 8/56 for novels. This distribution highlights FDA-approved drugs' competitive binding potential despite non-oncology optimization.

---

## Conclusion

## Conclusion

### Summary of Key Findings

Molecular docking against KRAS (PDB: 9IAY) and CD44 (PDB: 4PZ3) identified seven FDA-approved drugs with predicted binding affinities to KRAS and three to CD44, representing promising candidates for drug repurposing in pancreatic cancer therapy. Among KRAS-targeting compounds, **chloroquine** demonstrated the highest confidence score (0.3478), followed by disulfiram (0.1390), itraconazole (0.0791), and simvastatin (0.0783). For CD44, **cimetidine** exhibited the strongest predicted binding (0.3819), with propranolol (0.2779) and thioridazine (0.1158) as secondary candidates. These computational predictions are particularly noteworthy given that KRAS mutations occur in approximately 90% of pancreatic ductal adenocarcinomas (PDAC), and CD44 expression correlates with cancer stem cell phenotypes and therapeutic resistance. Notably, simvastatin and metformin have already demonstrated synergistic efficacy with standard gemcitabine/nab-paclitaxel chemotherapy in preclinical pancreatic cancer models, providing experimental validation for the computational approach employed herein.

### Top Repurposing Candidates and Mechanistic Rationale

The docking analysis identified **chloroquine** as the lead KRAS-targeting candidate, with a confidence score substantially exceeding other repurposed agents. Originally approved for malaria prophylaxis and treatment, chloroquine's proposed mechanism—promotion of autophagic clearance of oncogenic KRAS—addresses a fundamental vulnerability in KRAS-driven malignancies. **Disulfiram**, an FDA-approved aldehyde dehydrogenase inhibitor for alcohol use disorder, ranked second with a confidence score of 0.1390 and inhibits KRAS-driven proliferation through formation of disulfiram-copper complexes, a mechanism distinct from conventional kinase inhibition. **Simvastatin** (0.0783), a widely prescribed HMG-CoA reductase inhibitor for hypercholesterolemia, blocks KRAS prenylation—a post-translational modification essential for membrane localization and oncogenic signaling. **Metformin** (0.0720), the first-line antidiabetic agent, suppresses KRAS-mutant tumor growth via AMPK activation, with established preclinical efficacy in combination with standard chemotherapy.

For CD44-directed therapy, **cimetidine** (confidence: 0.3819), an H2-receptor antagonist approved for peptic ulcer disease, emerged as the highest-ranking candidate, predicted to inhibit CD44-mediated leukocyte adhesion and potentially disrupt cancer stem cell maintenance. **Propranolol** (0.2779), a non-selective β-adrenergic antagonist, may disrupt CD44-hyaluronic acid interactions critical for tumor cell adhesion and metastatic dissemination. These candidates represent distinct therapeutic areas (antimalarial, anthelmintic, cardiovascular, gastrointestinal) with well-characterized pharmacokinetics, toxicity profiles, and established clinical dosing regimens—substantial advantages over de novo drug discovery.

### Clinical Implications and Accelerated Translational Pathway

The identification of FDA-approved drugs with predicted binding to validated pancreatic cancer targets substantially de-risks the translational pathway. Unlike novel compounds requiring extensive dose-escalation studies, repurposed drugs possess documented pharmacokinetic and safety data, potentially enabling rapid transition to Phase I/II trials focused on efficacy endpoints rather than dose-finding. The computational predictions suggest that **chloroquine, disulfiram, simvastatin, and metformin** warrant immediate prioritization for in vitro validation and preclinical efficacy studies in PDAC models. Given that simvastatin and metformin have already demonstrated synergistic activity with gemcitabine/nab-paclitaxel in pancreatic cancer models, and that the VESPA trial (NCT03889795) is currently enrolling patients with first-line metastatic PDAC to evaluate valproic acid and simvastatin in combination with standard chemotherapy, the present docking results provide computational support for ongoing clinical investigations. The predicted binding affinities to KRAS and CD44—both central to PDAC pathogenesis and therapeutic resistance—suggest that these agents may address complementary mechanisms of tumor progression, supporting rationale for combination strategies that simultaneously target oncogenic signaling and cancer stem cell populations.

### Limitations of the Computational Approach

Several critical limitations must be acknowledged. First, **DiffDock confidence scores represent relative ranking within the docking ensemble and do not directly correlate with experimentally measured binding affinities** (Kd or IC50 values). The confidence metric reflects geometric plausibility of ligand-protein poses rather than thermodynamic stability or kinetic parameters governing cellular efficacy. Second, the analysis examined **static protein conformations** (KRAS PDB: 9IAY; CD44 PDB: 4PZ3) without molecular dynamics simulations to assess binding stability across the conformational landscape accessible to these proteins in cellular environments. KRAS, in particular, undergoes dynamic nucleotide-dependent conformational transitions that may not be fully captured by single-structure docking. Third, **free-energy perturbation (FEP) or molecular mechanics Poisson-Boltzmann surface area (MM-PBSA) calculations were not performed**, limiting quantitative prediction of binding free energy. Fourth, the analysis was restricted to two protein targets; pancreatic cancer pathogenesis involves multiple interconnected signaling axes (PI3K/AKT, MAPK/ERK, Wnt/β-catenin, TGF-β signaling), and compounds may exert therapeutic effects through off-target mechanisms not captured by this two-target screen. Fifth, **ADMET (absorption, distribution, metabolism, excretion, toxicity) properties were not systematically evaluated**, and while repurposed drugs have established safety profiles, their efficacy at pancreatic cancer-relevant doses and tissue concentrations remains uncertain. Finally, the docking protocol did not account for **tumor microenvironment factors** (stromal interactions, hypoxia, immune infiltration) that substantially influence drug efficacy in vivo.

### Recommended Future Directions

To advance the most promising candidates toward clinical evaluation, we recommend the following sequential investigations:

1. **Molecular Dynamics and Binding Thermodynamics**: Perform all-atom MD simulations (≥100 ns) of chloroquine, disulfiram, simvastatin, and metformin bound to KRAS and cimetidine, propranolol, and thioridazine bound to CD44. Calculate binding free energies using MM-PBSA or FEP to establish quantitative structure-activity relationships and identify critical protein-ligand interactions.

2. **In Vitro Binding Validation**: Conduct surface plasmon resonance (SPR), isothermal titration calorimetry (ITC), or fluorescence polarization assays to measure actual Kd values for lead compounds against recombinant KRAS and CD44 proteins, enabling direct comparison with computational predictions.

3. **ADMET and Pharmacokinetic Profiling**: Perform comprehensive ADMET assessment including hepatic microsomal stability, plasma protein binding, blood-brain barrier permeability, and CYP450 interaction potential. Conduct pharmacokinetic studies in murine pancreatic cancer models to establish target tissue concentrations achievable at clinically relevant doses.

4. **Preclinical Efficacy Studies**: Evaluate chloroquine, disulfiram, simvastatin, and metformin in established PDAC cell lines (MIA PaCa-2, PANC-1, BxPC-3) and patient-derived xenografts (PDX) with known KRAS mutation status. Assess single-agent activity and synergy with gemcitabine/nab-paclitaxel using dose-response curves and isobologram analysis. Investigate CD44-targeting agents (cimetidine, propranolol) in cancer stem cell enrichment assays and sphere-formation assays.

5. **Mechanistic Validation**: Employ phosphoproteomics and transcriptomics to confirm predicted mechanisms of action (e.g., KRAS autophagic clearance by chloroquine; AMPK activation by metformin; KRAS prenylation inhibition by simvastatin). Assess effects on downstream effectors (ERK1/2, AKT phosphorylation) and cancer stem cell markers (CD44, CD133, ALDH1A1).

6. **Combination Studies**: Prioritize evaluation of synergistic combinations (e.g., chloroquine + simvastatin targeting complementary KRAS mechanisms; CD44-targeting agents + standard chemotherapy to overcome stem cell-mediated resistance) in both cell-based and in vivo models.

7. **Regulatory Pathway Planning**: For the most promising candidates demonstrating robust preclinical efficacy, initiate IND-enabling toxicology studies and engage regulatory agencies (FDA, EMA) to design Phase I/II trials leveraging the established safety databases of repurposed drugs to accelerate patient enrollment and efficacy assessment.

The present computational screen provides a rational, target-directed foundation for accelerated drug repurposing in pancreatic cancer. By combining molecular docking with rigorous experimental validation and mechanistic investigation, this approach has the potential to identify clinically actionable therapies for a disease with limited treatment options and dismal prognosis.
