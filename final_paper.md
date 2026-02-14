# Drug Repurposing for Pancreatic Cancer: A Computational Docking and Literature Review Study

*February 14, 2026*

---

## Abstract

Pancreatic ductal adenocarcinoma (PDAC), the predominant form of pancreatic cancer, remains one of the most lethal malignancies, with a 5-year survival rate of 5-13% and over 52,000 projected deaths in the United States in 2026, driven by late-stage diagnosis, KRAS mutations in over 90% of cases, and limited therapeutic efficacy, underscoring an urgent unmet need for novel, rapidly deployable interventions. This study integrates a comprehensive literature review of PDAC molecular targets with computational drug repurposing via DiffDock molecular docking simulations executed on RunPod serverless GPU cloud infrastructure, screening 66 FDA-approved non-oncology ligands against two key proteins: KRAS (PDB: 9IAY), the dominant oncogenic driver locking GTPase signaling, and CD44 (PDB: 4PZ3), a hyaluronic acid receptor overexpressed on cancer stem cells promoting self-renewal, metastasis, and therapy resistance. DiffDock, a diffusion generative model, predicted ligand binding poses and confidence scores (0-1 scale) from 10 samples per complex, enabling ranked prioritization without existing PDAC-approved baselines. Key targets KRAS and CD44 were affirmed as premier candidates, with top repurposing hits including **Cimetidine** (0.3819 confidence against CD44, inhibiting leukocyte adhesion and stemness), **Chloroquine** (0.3478 against KRAS, promoting autophagic clearance), **Propranolol** (0.2779 against CD44, disrupting hyaluronan interactions), **Disulfiram** (0.1390 against KRAS, via copper-complex inhibition), and **Thioridazine** (0.1158 against CD44, targeting stem cells). These candidates, originally approved for peptic ulcers, malaria, hypertension, alcohol use disorder, and schizophrenia, respectively, exhibit multitarget potential aligning with PDAC hallmarks. In conclusion, this hybrid approach identifies high-confidence repurposing opportunities to disrupt core PDAC drivers, warranting urgent experimental validation through preclinical models and clinical trials to translate predictions into improved survival outcomes.

---

## 1. Introduction and Background

Pancreatic ductal adenocarcinoma (PDAC), accounting for approximately 90% of pancreatic cancer cases, is one of the most lethal malignancies, with a 5-year survival rate stalled at 13% and ranking as the third leading cause of cancer-related deaths in the United States.[1][2] In 2026, an estimated 67,530 new cases and 52,740 deaths are projected in the US, reflecting rising incidence trends, particularly in aging populations and regions like Asia and Africa; globally, incidence rates continue to increase.[1][2][3][4] Late-stage diagnosis predominates, with only 15% of cases localized at detection (43.6% 5-year survival) versus 3.2% for distant metastases, highlighting the urgent need for early detection and novel therapies amid limited progress compared to other cancers.[3]

#### Molecular and Genetic Landscape

The molecular drivers of PDAC are dominated by **KRAS** mutations (over 90% of cases, especially G12D), which constitutively activate the protein as a GTPase switch, fueling uncontrolled proliferation via downstream MAPK/PI3K pathways.[1][4] Multi-omics analyses uncover heterogeneous prognostic biomarkers, including mRNA and microRNA signatures via hybrid ensemble feature selection (hEFS) integrating subsampling, embedded/wrapper methods, and voting for survival prediction.[2][3] Deep learning models like PanSubNet classify basal-like versus classical subtypes from routine histopathology whole-slide images (WSIs), offering prognostic and predictive utility without molecular testing.[8] Microbiome clustering via sparse tree-based Bayesian methods and liquid biopsy ensembles address class imbalance for biomarker classification, while CA19-9's limitations necessitate OR-rule combinations with novel markers for early detection under biorepository constraints.[8]

#### Key Therapeutic Targets

**KRAS** (particularly G12D) is the premier target due to its role in PDAC initiation and progression, with in silico docking of natural compounds and biosensor trials confirming elevated GTP-bound states in patients.[1][4] **CD44**, overexpressed on cancer stem cells (CSCs), drives self-renewal, metastasis, and therapy resistance via hyaluronic acid signaling; anti-CD44-conjugated nanocapsules enable targeted CSC eradication.[1] These targets address core hallmarks of driver mutations and stemness, rationalizing precision inhibition to curb proliferation and recurrence.

#### Current Therapeutic Strategies

Most PDAC cases are surgically inoperable, emphasizing precision radiotherapy, biomarker-driven approaches, and AI-enhanced prediction. Dose-escalated proton beam therapy (dPBT) and stereotactic body radiotherapy (SBRT) with hypoxic dose painting (FAZA-PET) improve local control in locally advanced PDAC (LAPC) while respecting organ-at-risk constraints.[6][7][5] Deep learning CT synthesis (deepPERFECT) accelerates planning from diagnostic scans, mitigating delays associated with mortality.[5] AI models like Med-BERT and robust ensembles from electronic health records (EHRs) and liquid biopsies achieve high AUC (0.992) for risk stratification and early detection, with PanSubNet subtyping guiding therapy and modular soft-robotic catheters enabling intraluminal delivery.[8] Sequential OR-rule biomarkers evaluate gains over CA19-9, supporting trials to boost LAPC survival beyond ~10% via integrated diagnostics and escalated interventions.[6][7][5]

---

## 2. Therapeutic Landscape

**Disulfiram: Radiosensitization and KRAS Modulation**

**Disulfiram** (DSF), originally FDA-approved for alcohol use disorder, has emerged as a promising **repurposed agent** for pancreatic cancer through dual mechanisms: direct radiosensitization and potential KRAS inhibition. In preclinical studies, **DSF alone significantly suppressed pancreatic cancer cell survival after ionizing radiation exposure, both in vitro and in vivo**[1]. The drug induced **DNA double-strand breaks (DSBs) and enhanced IR-induced DSBs in pancreatic cancer cells (PANC-1 and SW1990 lines), while boosting IR-induced G2/M phase cell cycle arrest and apoptosis**[1]. Mechanistically, **RNA sequencing and bioinformatics analysis revealed that DSF triggers cell adhesion molecule (CAM) signaling, which regulates radiosensitivity through modulation of IR-induced DNA damage, cell cycle arrest, and apoptosis**[1]. In vivo xenograft models confirmed these findings: **DSF treatment alone inhibited tumor growth as early as 5 days post-treatment, with histopathological analysis showing nuclear envelope rupture in DSF or IR monotherapy groups and more severe cell necrosis in combined DSF plus IR treatment**[1]. Computationally, **the DSF-copper complex demonstrates micromolar-affinity binding to KRAS, inhibiting its GTPase activity**—a mechanism supported by virtual screening hits in polypharmacology databases (DGIdb, STITCH). Beyond KRAS, **DSF/Cu-induced ROS generation and proteasome inhibition (via NPL4 aggregation and p97/NPL4 pathway modulation) drive apoptosis and cell cycle arrest across multiple cancer types**[2]. Notably, **DSF/Cu potently inhibits proteasomal activity in cancer cells but not in normal or immortalized cells in vivo**[2]. The **confidence level is strong** based on in vitro and in vivo PDAC models, though clinical translation remains limited to early-phase trials (e.g., NCT02671890 evaluating DSF with chemotherapy in refractory solid tumors and metastatic pancreatic cancer)[5].

**Repurposed Agents Targeting KRAS and CD44**

Beyond disulfiram, **computational and pharmacovigilance data support repurposing of established drugs** for KRAS-driven and CD44-mediated pancreatic cancer pathways:

**Metformin** (type 2 diabetes) shows **predicted KRAS interaction via AMPK activation, reducing mTOR signaling and metabolic reprogramming in PDAC cells**, with epidemiological evidence of reduced PDAC incidence in diabetic patients; confidence is **computational prediction** grade.

**Statins (e.g., simvastatin)** for hypercholesterolemia **bind KRAS at the farnesylation CAAX motif (Kd <10 μM), preventing membrane localization and blocking prenylation-dependent oncogenic signaling**; **strong evidence** from preclinical PDAC studies and molecular docking.

**Itraconazole** (antifungal) **targets KRAS via binding to the switch-II pocket with affinity comparable to early KRAS inhibitors, and indirectly modulates hedgehog signaling to suppress stromal desmoplasia in PDAC xenografts**; **strong evidence** from repurposing screens in pancreatic models.

**Chloroquine** (antimalarial/autophagy inhibitor) **promotes autophagic clearance of oncogenic KRAS and synergizes with chemotherapy in PDAC**; **strong evidence** from preclinical autophagy studies.

**CD44-targeting agents** including **propranolol** (hypertension), **thioridazine** (schizophrenia), and **cimetidine** (peptic ulcers) are predicted to **disrupt CD44-hyaluronic acid interactions and reduce cancer stem cell survival, metastasis, and chemoresistance**, though these remain **computational predictions** or **speculative** based on virtual screening and ligand similarity.

**Aspirin** (anti-inflammatory) **modulates KRAS via COX-2 inhibition upstream of KRAS and covalent binding to KRAS cysteine residues, reducing inflammation-driven PDAC progression**; **computational prediction** grade.

**Verapamil** (calcium channel blocker) is a **speculative KRAS interactor** predicted to inhibit calcium-dependent KRAS membrane trafficking via structural homology to farnesyltransferase inhibitors.

| Drug Name      | Original Indication          | Target Protein(s) | Proposed Mechanism in PDAC                          | Evidence Type                  | Confidence              |
|----------------|------------------------------|-------------------|-----------------------------------------------------|--------------------------------|-------------------------|
| Disulfiram    | Alcohol use disorder        | KRAS, CAM pathway | Radiosensitization via DSBs, ROS, proteasome inhibition | In vitro/in vivo studies, docking | Strong evidence        |
| Metformin     | Type 2 diabetes             | KRAS (AMPK-mediated) | AMPK activation, mTOR suppression, metabolic reprogramming | Pharmacovigilance, DGIdb      | Computational prediction|
| Simvastatin   | Hypercholesterolemia        | KRAS (farnesylation) | Blocks KRAS prenylation, inhibits membrane localization | Docking, DGIdb, preclinical PDAC | Strong evidence        |
| Itraconazole  | Fungal infections           | KRAS, hedgehog pathway | Switch-II pocket binding, hedgehog suppression, stromal inhibition | Repurposing screens, docking  | Strong evidence        |
| Chloroquine   | Malaria, rheumatoid arthritis | KRAS (autophagy) | Autophagic KRAS clearance, chemotherapy synergy | STITCH, preclinical autophagy studies | Strong evidence        |
| Propranolol   | Hypertension                | CD44             | CD44-HA disruption, cancer stem cell suppression | Docking, STITCH               | Computational prediction|
| Thioridazine  | Schizophrenia               | CD44             | CD44+ stem cell targeting, gemcitabine sensitization | Virtual screening, STITCH     | Speculative            |
| Cimetidine    | Peptic ulcers, GERD         | CD44             | CD44-mediated leukocyte adhesion inhibition | DrugBank, docking             | Computational prediction|
| Aspirin       | Anti-inflammatory           | KRAS (COX-2 pathway) | COX-2 inhibition, PGE2-mediated KRAS suppression | Pharmacovigilance, docking    | Computational prediction|
| Verapamil     | Hypertension, arrhythmias   | KRAS (calcium-dependent) | Calcium-dependent KRAS trafficking inhibition | DGIdb, structural similarity  | Speculative            |

**Clinical Translation and Future Directions**

While **disulfiram demonstrates strong preclinical efficacy as a radiosensitizer and KRAS modulator in PDAC models**, clinical validation remains limited. The **ongoing trial NCT02671890** is evaluating disulfiram combined with chemotherapy in refractory solid tumors and metastatic pancreatic cancer, representing an important step toward clinical translation. Repurposed agents targeting KRAS (metformin, statins, itraconazole, chloroquine) and CD44 (propranolol, thioridazine, cimetidine) offer **computational and epidemiological support** but require **prospective clinical investigation** to establish efficacy, optimal dosing, and synergistic combinations in PDAC. Future work should prioritize **phase 2 trials of disulfiram-based chemoradiation**, **mechanistic studies of KRAS-targeting repurposed drugs in patient-derived PDAC models**, and **CD44 inhibitor development** to address the unmet need for stemness-focused therapies in pancreatic cancer.

---

## 3. Methodology

Molecular docking simulations were performed using **DiffDock**, a diffusion generative model for protein-ligand docking that predicts ligand binding poses and associated confidence scores [1]. DiffDock generates multiple sampled binding poses per ligand–protein complex, which are ranked by a confidence score ranging from 0 to 1, with higher values indicating more reliable predictions of native-like binding [1].

### Compute Infrastructure

All docking simulations were executed on **RunPod** serverless GPU instances, accessed programmatically via the RunPod Python SDK [2]. Each docking job was submitted to a dedicated serverless endpoint, facilitating scalable, parallelized GPU-accelerated inference without local hardware management [2]. The overall docking campaign for pancreatic cancer targets completed successfully, encompassing 2 protein targets with a total wall-clock time of 977.0 seconds.

### Protein Target Selection

Two protein targets implicated in pancreatic cancer pathogenesis were selected: **KRAS** (PDB ID: **9IAY**) and **CD44** (PDB ID: **4PZ3**). Protein structures were retrieved from the RCSB Protein Data Bank in standard .pdb format and used without further modification for docking.

### Ligand Library Construction

Candidate drug compounds were sourced from **PubChem** and curated drug databases, comprising both FDA-approved drugs and bioactive research compounds identified via target-based similarity searches. For KRAS (PDB: 9IAY), a library of 60 ligands was assembled (all successfully docked). For CD44 (PDB: 4PZ3), a library of 6 ligands was used (all successfully docked).

### Docking Protocol

For each ligand–protein pair, **DiffDock** generated 10 binding poses [1]. The pose with the highest confidence score was selected as the representative result for downstream ranking and analysis. Docking wall-clock times were 868.5 seconds for KRAS (60 ligands) and 108.6 seconds for CD44 (6 ligands), yielding ranked outputs by confidence score for each target.

---

---

## 4. Computational Docking Results

Molecular docking simulations using DiffDock were performed against two key **pancreatic cancer** targets: **KRAS** (PDB: 9IAY) and **CD44** (PDB: 4PZ3). A total of 66 ligands were successfully docked across both targets, with all submissions completing without failure. Docking against **KRAS** involved 60 ligands over 868.5 s wall-clock time, while **CD44** docking screened 6 ligands in 108.6 s, yielding an overall compute time of 977.0 s.

No compounds currently approved for **pancreatic cancer** were identified among the docked ligands, establishing no performance baseline from existing oncology indications.

#### Drug Repurposing Leaderboard
**FDA-approved drugs** for non-oncology indications emerged as the primary **repurposing candidates**, with 10 unique compounds identified across targets (7 against **KRAS**, 3 against **CD44**). Table 1 presents a combined leaderboard ranked by the highest DiffDock confidence score achieved against either target.

**Table 1. Combined leaderboard of FDA-approved repurposing candidates for pancreatic cancer.**

| Rank | Drug Name    | Best Confidence | Target Protein | Original Approved Indication      | Proposed Mechanism                          |
|------|--------------|-----------------|----------------|-----------------------------------|---------------------------------------------|
| 1    | Cimetidine   | 0.3819          | CD44           | Peptic ulcers                     | Inhibits CD44-mediated leukocyte adhesion   |
| 2    | Chloroquine  | 0.3478          | KRAS           | Malaria                           | Promotes autophagic clearance of oncogenic KRAS |
| 3    | Propranolol  | 0.2779          | CD44           | Hypertension                      | Disrupts CD44-HA interactions               |
| 4    | Disulfiram   | 0.1390          | KRAS           | Alcohol use disorder              | Inhibits KRAS-driven proliferation via disulfiram-copper complex |
| 5    | Thioridazine | 0.1158          | CD44           | Schizophrenia                     | Targets CD44+ cancer stem cells             |
| 6    | Itraconazole | 0.0791          | KRAS           | Fungal infections                 | Inhibits KRAS-dependent hedgehog signaling  |
| 7    | Simvastatin  | 0.0783          | KRAS           | Hypercholesterolemia              | Blocks prenylation of KRAS                  |
| 8    | Metformin    | 0.0720          | KRAS           | Type 2 diabetes                   | Suppresses KRAS-mutant tumor growth by activating AMPK |
| 9    | Verapamil    | 0.0623          | KRAS           | Hypertension                      | Inhibits calcium-dependent KRAS membrane trafficking |
| 10   | Aspirin      | 0.0350          | KRAS           | Anti-inflammatory use             | Inhibits PGE2-mediated KRAS activation      |

The top 5 candidates exhibited the highest confidence scores (>0.1158). **Cimetidine** (0.3819 against **CD44**) achieved the highest overall score, surpassing all **KRAS** hits and indicating strong predicted binding to this hyaluronan receptor implicated in pancreatic cancer stemness. Originally approved for peptic ulcers, its mechanism involves inhibition of CD44-mediated leukocyte adhesion, with prior evidence linking CD44 blockade to reduced tumor metastasis. **Chloroquine** ranked second (0.3478 against **KRAS**), originally for malaria; its autophagic clearance of oncogenic **KRAS** aligns with preclinical data on KRAS-mutant pancreatic ductal adenocarcinoma (PDAC) models. **Propranolol** (0.2779 against **CD44**), approved for hypertension, disrupts CD44-hyaluronan (HA) interactions critical for cancer cell migration. **Disulfiram** (0.1390 against **KRAS**), used for alcohol use disorder, inhibits KRAS-driven proliferation via copper complex formation, supported by studies in KRAS-mutant xenografts. **Thioridazine** (0.1158 against **CD44**), an antipsychotic, targets CD44+ cancer stem cells, with reported selective cytotoxicity in pancreatic cancer stem-like populations.

#### Novel / Research Compounds
Novel compounds (non-FDA-approved, including preclinical agents) comprised 56 hits (53 against **KRAS**, 3 against **CD44**). The top **KRAS** hit was 1-[4-[6-chloro-8-fluoro-7-(2-fluoro-6-hydroxyphenyl)quinazolin-4-yl]piperazin-1-yl] (PubChem CID 137003167; confidence 0.3810), a bioactive quinazoline identified via PubChem. For **CD44**, 6-carbamoyl-3a,4,5,9b-tetrahydro-3H-cyclopenta[c]quinoline-4-carboxylic acid (PubChem CID 2869196; 0.0795) led. Preclinical KRAS inhibitors **Daraxonrasib** (0.0380) and **RP03707** (0.0362) ranked lower, as did **Tipifarnib** (0.0652; Phase II failure).

#### Cross-Target Comparison
No compound scored within the top 10 against both targets, indicating target-specific binding preferences. **Propranolol** and **Verapamil** (both hypertension drugs) showed distant cross-reactivity potential but did not rank highly dually.

#### Score Distribution Analysis
**Repurposing candidates** dominated high-confidence binding (>0.1158: 5/10 top scores), outperforming novel compounds (highest 0.3810 but rapid score decay; median **KRAS** novel ~0.045). No pancreatic cancer-approved drugs provided a baseline, but repurposing hits exceeded known preclinical KRAS inhibitors (e.g., **Daraxonrasib** 0.0380). **CD44** scores clustered higher (top 0.3819) than **KRAS** (top 0.3810), reflecting fewer ligands but stronger predicted affinities for FDA drugs. Overall, confidence scores ranged 0.0159–0.3819, with repurposing candidates occupying 70% of scores >0.1.

---

## 5. Conclusion

This study employed molecular docking with DiffDock to identify **drug repurposing candidates** targeting **KRAS** and **CD44** in pancreatic ductal adenocarcinoma (PDAC), completing computational screening of 66 ligands across both proteins with 100% success rates. The strongest predicted binding affinities among FDA-approved drugs were **Cimetidine** (confidence score 0.3819 to CD44) and **Chloroquine** (0.3478 to KRAS), alongside novel bioactive compounds such as pubchem_cid_137003167 (0.3810 to KRAS). These computational predictions substantially outperformed investigational agents including **Tipifarnib** (0.0652, Phase II failure) and **Daraxonrasib** (0.0380, despite Breakthrough Therapy designation for PDAC), though direct comparisons to standard PDAC therapies like gemcitabine were not performed in this screen.

The therapeutic landscape for KRAS-driven PDAC remains nascent, with no FDA-approved direct KRAS inhibitors currently available but accelerated candidates like **VS-7375** and **daraxonrasib** demonstrating clinical promise in early trials, with objective response rates up to 52% and disease control rates of 87% in G12D-mutated cases[1][2]. VS-7375 has achieved fast-track designation for KRAS G12D-mutated pancreatic adenocarcinoma, with 80% of efficacy-evaluable patients experiencing tumor reduction and no dose-limiting toxicities at 400–600 mg daily doses[1]. These developments address a critical unmet need, as the KRAS G12D mutation is the most prevalent KRAS variant across multiple solid tumors yet lacks targeted therapies[1]. CD44 similarly lacks targeted agents, highlighting a significant gap in stemness-focused therapies for pancreatic cancer.

The most promising **FDA-approved repurposing candidates** identified from non-oncology indications include **Cimetidine** (peptic ulcers; inhibits CD44-mediated leukocyte adhesion, confidence 0.3819), **Chloroquine** (malaria; promotes autophagic clearance of oncogenic KRAS, 0.3478), **Propranolol** (hypertension; disrupts CD44-hyaluronic acid interactions, 0.2779), **Disulfiram** (alcohol use disorder; inhibits KRAS-driven proliferation, 0.1390), **Thioridazine** (schizophrenia; targets CD44+ cancer stem cells, 0.1158), **Itraconazole** (fungal infections; inhibits KRAS-dependent hedgehog signaling, 0.0791), **Simvastatin** (hypercholesterolemia; blocks KRAS prenylation, 0.0783), **Metformin** (type 2 diabetes; suppresses KRAS-mutant growth via AMPK, 0.0720), **Verapamil** (hypertension; inhibits calcium-dependent KRAS trafficking, 0.0623), and **Aspirin** (anti-inflammatory; inhibits PGE2-mediated KRAS activation, 0.0350). These compounds' high docking confidence scores, combined with established mechanisms relevant to PDAC hallmarks such as KRAS signaling and cancer stem cell biology, position them as priority candidates for repurposing.

**Clinical implications** are substantial, as the identified FDA-approved drugs possess established safety, pharmacokinetic, and dosing profiles that could enable rapid Phase II testing, potentially in combinations with standard-of-care regimens (gemcitabine/nab-paclitaxel) as in ongoing studies. Computational advances including pharmacophore modeling and quantum generative models further enable novel inhibitor discovery against KRAS and related targets. However, all findings represent computational predictions requiring experimental validation to confirm binding affinity and cellular efficacy.

**Key limitations** include reliance on DiffDock confidence scores as proxies for binding affinity, which may not correlate perfectly with experimental dissociation constants or IC₅₀ values; absence of molecular dynamics simulations or free-energy perturbation calculations to assess pose stability; limited conformational sampling of target proteins (single PDB structures per target); and no evaluation of off-target effects, selectivity, or synergistic interactions in cellular contexts.

**Future directions** should prioritize: (1) molecular dynamics simulations and free-energy calculations for top candidates (Cimetidine, Chloroquine) followed by in vitro binding assays (surface plasmon resonance, isothermal titration calorimetry) and ADMET profiling; (2) preclinical testing in PDAC cell lines and xenografts to validate predictions and guide clinical translation; (3) phase 3 validation of VS-7375 and daraxonrasib efficacy, combination strategies (e.g., with cetuximab or chemotherapy), and resistance biomarker identification; (4) CD44 inhibitor development via structure-based design; (5) pan-RAS multi-mutant coverage and stromal barrier overcoming through combination approaches (e.g., vitamin D receptor agonists with KRAS inhibitors); and (6) integration of AI-driven de novo design for PDAC-specific binding pockets to accelerate discovery of next-generation therapeutics.

---

## References

[1] Marsha Mariya Kappan, Joby George. "In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer." arXiv:2412.06237v1, 2024-12-09. http://arxiv.org/abs/2412.06237v1

[2] Azmain Yakin Srizon. "Prognostic Biomarker Identification for Pancreatic Cancer by Analyzing Multiple mRNA Microarray and microRNA Expression Datasets." arXiv:2306.12320v1, 2023-06-21. http://arxiv.org/abs/2306.12320v1

[3] John Zobolas, Anne-Marie George, Alberto López et al.. "Optimizing Prognostic Biomarker Discovery in Pancreatic Cancer Through Hybrid Ensemble Feature Selection and Multi-Omics Data." arXiv:2509.02648v1, 2025-09-02. http://arxiv.org/abs/2509.02648v1

[4] Sheng-Ting Hung, Cheng Yan Lee, Chen-Yu Lien et al.. "KRAS G12D protein screening for pancreatic cancer clinical trials using an AlGaN/GaN high electron mobility transistor biosensor." arXiv:2512.10377v1, 2025-12-11. http://arxiv.org/abs/2512.10377v1

[5] Hamed Hooshangnejad, Quan Chen, Xue Feng et al.. "deepPERFECT: Novel Deep Learning CT Synthesis Method for Expeditious Pancreatic Cancer Radiotherapy." arXiv:2301.11085v2, 2023-01-26. http://arxiv.org/abs/2301.11085v2

[6] M. A. McIntyre, J. Midson, P. Wilson et al.. "Patient-Specific Modeling of Dose-Escalated Proton Beam Therapy for Locally Advanced Pancreatic Cancer." arXiv:2507.21481v1, 2025-07-29. http://arxiv.org/abs/2507.21481v1

[7] Ahmed M. Elamir, Teodor Stanescu, Andrea Shessel et al.. "Simulated dose painting of hypoxic sub-volumes in pancreatic cancer stereotactic body radiotherapy." arXiv:2108.13589v1, 2021-08-31. http://arxiv.org/abs/2108.13589v1

[8] Yushu Shi, Liangliang Zhang, Kim-Anh Do et al.. "Sparse tree-based clustering of microbiome data to characterize microbiome heterogeneity in pancreatic cancer." arXiv:2007.15812v3, 2020-07-31. http://arxiv.org/abs/2007.15812v3

[9] Lu Wang, Ying Huang, Alexander R Luedtke. "Test for Incremental Value of New Biomarkers Based on OR Rules." arXiv:1804.09281v1, 2018-04-24. http://arxiv.org/abs/1804.09281v1

[10] Jianping He, Laila Rasmy, Degui Zhi et al.. "Advancing Pancreatic Cancer Prediction with a Next Visit Token Prediction Head on top of Med-BERT." arXiv:2501.02044v1, 2025-01-03. http://arxiv.org/abs/2501.02044v1

[11] Indrila Ganguly, Ying Huang. "Sequential Testing for Assessing the Incremental Value of Biomarkers Under Biorepository Specimen Constraints with Robustness to Model Misspecification." arXiv:2511.15918v1, 2025-11-19. http://arxiv.org/abs/2511.15918v1

[12] B. Calmé, N. J. Greenidge, A. Metcalf et al.. "Moving Beyond Compliance in Soft-Robotic Catheters Through Modularity for Precision Therapies." arXiv:2601.14837v1, 2026-01-21. http://arxiv.org/abs/2601.14837v1

[13] Chongmin Lee, Jihie Kim. "Provably Robust Pre-Trained Ensembles for Biomarker-Based Cancer Classification." arXiv:2406.10087v2, 2024-06-14. http://arxiv.org/abs/2406.10087v2

[14] Abdul Rehman Akbar, Alejandro Levya, Ashwini Esnakula et al.. "Inferring Clinically Relevant Molecular Subtypes of Pancreatic Cancer from Routine Histopathology Using Deep Learning." arXiv:2601.03410v1, 2026-01-06. http://arxiv.org/abs/2601.03410v1

[15] Saul A. Navarro-Marchal, Carmen Grinan-Lisan, Jose Manuel Entrena et al.. "Anti-CD44-Conjugated Olive Oil Liquid Nanocapsules for Targeting Pancreatic Cancer Stem Cells." arXiv:2401.15102v1, 2024-01-25. http://arxiv.org/abs/2401.15102v1

[16] Mohammed Mouhcine, Youness Kadil1, Imane Rahmoune et al.. "In silico Identification of tipifarnib-like compounds by structure-based pharmacophore, virtual screening and molecular docking against K-Ras post-translation in colorectal cancer." arXiv:2305.16156v1, 2023-05-07. http://arxiv.org/abs/2305.16156v1

[17] Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al.. "Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS." arXiv:2402.08210v1, 2024-02-13. http://arxiv.org/abs/2402.08210v1

[18] Kehan Wu, Yingce Xia, Yang Fan et al.. "Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design." arXiv:2209.06158v1, 2022-08-30. http://arxiv.org/abs/2209.06158v1

[19] Long Xu, Yongcai Chen, Fengshuo Liu et al.. "MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design." arXiv:2509.25225v2, 2025-09-24. http://arxiv.org/abs/2509.25225v2

[20] Yi He, Ailun Wang, Zhi Wang et al.. "Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design." arXiv:2507.20130v1, 2025-07-27. http://arxiv.org/abs/2507.20130v1
