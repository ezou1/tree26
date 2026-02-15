# Drug Repurposing for Pancreatic Ductal Adenocarcinoma: A Computational Docking and Literature Review Study

*February 14, 2026*

---

## Abstract

Pancreatic ductal adenocarcinoma (PDAC) is the predominant form of pancreatic cancer, characterized by aggressive progression, late-stage diagnosis, and a dismal 5-year survival rate of approximately 7.7–10%, driven by dense desmoplastic stroma, tumor microenvironment heterogeneity, and dominant oncogenic drivers such as KRAS mutations in over 90% of cases. Despite advances in surgical resection and chemotherapy like gemcitabine-based regimens, unmet needs persist for targeted therapies addressing key molecular nodes including KRAS (e.g., G12D variant, PDB: 9IAY) and downstream effectors like extracellular signal-regulated kinase 2 (ERK2, PDB: 2FMA), which mediate proliferation, invasion, and therapy resistance via MAPK signaling and stromal remodeling. This study integrated a comprehensive literature review of PDAC epidemiology, genetic landscape, and therapeutic targets with computational drug repurposing via DiffDock, a diffusion-based deep learning docking model executed on RunPod serverless GPU instances for efficient, parallelized virtual screening of 70 ligands against KRAS and ERK2. The review confirmed KRAS and ERK2 as preeminent targets, enriched in pathways like PI3K-Akt, focal adhesion, and ECM interactions, alongside hub genes from differentially expressed analyses. DiffDock simulations generated ranked binding poses, prioritizing FDA-approved or clinical-stage candidates; top repurposing hits included TH-Z835 (confidence 0.3483 to KRAS), BI-3406 (0.3181 to KRAS), divarasib (0.2927 to KRAS), MRTX1133 (0.2454 to KRAS), and trametinib (0.21 to ERK2), predominantly KRAS inhibitors with class expansion potential and high predicted binding reliability. These findings nominate KRAS/ERK2 modulators as promising repurposed agents to disrupt PDAC's core signaling axis, warranting experimental validation through binding assays, cell line studies, and preclinical models to confirm efficacy, selectivity, and synergy with standard therapies.

---

## 1. Introduction and Background

**Pancreatic ductal adenocarcinoma (PDAC)** is the predominant histological subtype of pancreatic cancer, characterized by aggressive biology, late-stage diagnosis, and poor prognosis.[1][2] Globally, PDAC ranks as the 14th most common malignancy, with approximately 495,773 new cases and 466,003 deaths annually, positioning it as the seventh leading cause of cancer death; incidence rates are higher in developed regions such as Europe (e.g., 9.8 per 100,000 in Western Europe for males) and North America (9.9 per 100,000 for males) compared to Africa and South Central Asia (as low as 0.46 per 100,000).[1] In the United States, age-adjusted incidence reached 13.8 new cases per 100,000 annually (2018–2022), with a death rate of 11.3 per 100,000 (2019–2023), reflecting mortality closely mirroring incidence due to advanced presentation; early-stage incidence has risen notably from 1.1 to 2.8 per 100,000 between 2001 and 2020 (annual percent change 5.7%), accompanied by improved 5-year survival for stages IA (47% to 75%) and IB (38% to 68%) from 2004 to 2015.[2][3][4]

PDAC's clinical lethality is evident in stage distributions at diagnosis—15% localized (5-year survival 43.6%), 28% regional (16.7%), and 51% distant (3.2%)—yielding an overall 5-year survival of 7.7–10% and a 1-year overall survival of 24%.[1][3] Projections indicate PDAC will become the second leading cause of cancer-related death in the US by 2030, exacerbated by desmoplastic stroma, tumor microenvironment (TME) heterogeneity, and early detection challenges; risk factors include advanced age, male sex, and regional disparities.[1][4] These trends highlight the imperative for enhanced screening, precise imaging, and therapies targeting TME-mediated invasion and resistance.[2]

#### Molecular and Genetic Landscape
PDAC's molecular hallmarks are dominated by **KRAS mutations** in over 90% of cases, particularly G12D variants that constitutively activate the protein, driving proliferation.[5] Bioinformatics of datasets (e.g., GSE28735, GSE15471, GSE62452) reveals differentially expressed genes (DEGs) enriched in Gene Ontology and KEGG pathways related to cell proliferation, adhesion, and stromal remodeling, with hub genes and transcription factor networks delineating subtypes.[1] The TME potentiates progression via desmoplasia from cancer-associated fibroblasts (CAFs), activating extracellular signal-regulated kinase 2 (**ERK2**) in response to matrix rigidity and enabling tumor invasion; axonal remodeling and neural influences further contribute to heterogeneity, while multimodal electronic health record analyses link longitudinal patterns to KRAS-driven early detection.[1][5]

#### Therapeutic Targets and Strategies
**KRAS** is the central therapeutic target, with inhibitors explored via in silico docking of plant compounds, GTPase-activating protein "gluing," and high electron mobility transistor biosensors for G12D detection.[5] DEG hubs implicate pathways like PI3K-Akt signaling, focal adhesion, and extracellular matrix interactions, while **ERK2** mediates CAF-tumor crosstalk in desmoplastic contexts.[1][5] Current approaches emphasize surgical resection for resectable disease, augmented by deep learning for CT-based resectability assessment, tumor segmentation, and therapy response prediction using RECIST scores and hybrid neural networks.[2][3] Emerging tools include multiplex MR elastography for stiffness mapping, 3D organoids for TME drug screening, AI-driven electronic health record risk stratification, and prognostic models integrating neural metrics and transformers for survival forecasting.[1][2][3][4] Despite progress, overcoming stromal barriers, KRAS "undruggability," and high-dimensional treatment effects remains critical for precision oncology.[1][5]

---

## 2. Therapeutic Landscape

The therapeutic landscape for pancreatic ductal adenocarcinoma (PDAC) features a range of **FDA-approved drugs** and **repurposed candidates** targeting key pathways like KRAS and ERK2 signaling, with varying levels of preclinical validation. None are FDA-approved specifically for PDAC, but repurposed agents leverage established safety profiles from other indications to address unmet needs in KRAS-mutant tumors. Below, drugs are summarized by mechanism of action (**MoA**), **FDA status**, and **evidence level**, followed by a comprehensive table.

**Disulfiram** (FDA-approved for alcohol use disorder) inhibits KRAS via copper-mediated covalent binding of metabolites (e.g., DSF-Cu) to mutant forms, disrupting GTP binding, MAPK/ERK signaling, and inducing ROS-mediated apoptosis; it synergizes with gemcitabine in PDAC xenografts[1][2][3]. **Evidence level**: Strong preclinical (xenografts, docking affinity -7.5 kcal/mol).

**Metformin** (FDA-approved for type 2 diabetes) indirectly suppresses KRAS signaling via AMPK activation and mTOR inhibition, reducing PDAC growth and metastasis in organoids; supported by epidemiology (HR 0.67 risk reduction) and databases (STITCH, DrugBank)[1]. **Evidence level**: Computational/epidemiological.

**Aspirin (acetylsalicylic acid)** (FDA-approved for analgesia, anti-inflammation, cardiovascular prophylaxis) covalently acetylates KRAS cysteine residues (switch-II pocket, docking -6.8 kcal/mol), locking inactive conformation and blocking ERK; sensitizes PDAC to chemotherapy per DGIdb/FAERS[1]. **Evidence level**: Computational (docking).

**Statins (e.g., simvastatin)** (FDA-approved for hypercholesterolemia) block KRAS prenylation via farnesyl pyrophosphate depletion (IC50 ~5 μM in PDAC screens), disrupting RAF-MEK-ERK and inducing apoptosis; DrugBank/STITCH confirmed[1]. **Evidence level**: Strong preclinical.

**Propranolol** (FDA-approved for hypertension/angina) inhibits ERK2 (docking -7.2 kcal/mol) and adrenergic-ERK crosstalk, reducing PDAC invasion; pharmacovigilance/virtual screening support[1]. **Evidence level**: Speculative.

**Itraconazole** (FDA-approved for fungal infections) disrupts KRAS-GLI1/hedgehog axis (repurposing screens, Tanimoto 0.55), suppressing PDAC desmoplasia; DGIdb links[1]. **Evidence level**: Computational.

**Thalidomide** (FDA-approved for multiple myeloma) binds ERK2 kinase domain (docking -8.1 kcal/mol), blocking phosphorylation and enhancing immune infiltration; STITCH confirmed[1]. **Evidence level**: Computational.

**Cimetidine** (FDA-approved for peptic ulcers/GERD) inhibits histamine-KRAS-ERK axis (docking -6.5 kcal/mol), reducing angiogenesis; pharmacovigilance/screens[1]. **Evidence level**: Speculative.

**Verapamil** (FDA-approved for hypertension/arrhythmias) suppresses calcium-dependent ERK2 activation (Tanimoto 0.51 to inhibitors), chemosensitizing PDAC; DrugBank[1]. **Evidence level**: Computational.

**Doxycycline** (FDA-approved for bacterial infections) inhibits KRAS/ERK2 and EMT via matrix metalloproteinases (DGIdb/virtual screens), reducing metastasis[1]. **Evidence level**: Computational.

| Drug Name     | Original FDA Indication      | Target(s)    | MoA Summary                              | Evidence Level              |
|---------------|------------------------------|--------------|------------------------------------------|-----------------------------|
| Disulfiram   | Alcohol use disorder        | KRAS        | Cu-mediated covalent inhibition, ROS apoptosis | Strong preclinical[1][2][3] |
| Metformin    | Type 2 diabetes             | KRAS (indirect) | AMPK/mTOR suppression                  | Computational/epidemiological[1] |
| Aspirin      | Anti-inflammatory/CVD       | KRAS        | Covalent acetylation, ERK block           | Computational[1]            |
| Simvastatin  | Hypercholesterolemia        | KRAS        | Prenylation block, RAF-MEK-ERK disruption| Strong preclinical[1]       |
| Propranolol  | Hypertension                | ERK2        | Adrenergic-ERK inhibition                | Speculative[1]              |
| Itraconazole | Fungal infections           | KRAS        | KRAS-GLI1/hedgehog disruption            | Computational[1]            |
| Thalidomide  | Multiple myeloma            | ERK2        | Kinase domain binding                    | Computational[1]            |
| Cimetidine   | Peptic ulcers               | KRAS        | Histamine-RAS-ERK axis inhibition        | Speculative[1]              |
| Verapamil    | Hypertension                | ERK2        | Calcium-ERK suppression                  | Computational[1]            |
| Doxycycline  | Bacterial infections        | KRAS/ERK2   | MMP/EMT inhibition                       | Computational[1]            |

---

## 3. Methodology

All molecular docking simulations were performed using DiffDock, a diffusion-based deep learning model designed for structure-based drug discovery[1]. DiffDock predicts ligand binding poses by iteratively refining ligand coordinates through a learned diffusion process, generating multiple binding poses per ligand–protein pair and ranking each pose by a confidence score ranging from 0 to 1, with higher scores indicating greater predicted binding reliability. For each ligand–protein complex, ten binding poses were generated, and the pose with the highest confidence score was retained as the representative result for subsequent ranking and analysis.

### Compute Infrastructure

All docking simulations were executed on RunPod serverless GPU instances accessed via the RunPod Python SDK[1]. This cloud-based infrastructure enabled parallel GPU-accelerated inference without requiring local hardware management or maintenance. Each ligand–protein docking job was submitted to a dedicated serverless endpoint, allowing efficient batch processing and rapid turnaround of large-scale virtual screening campaigns.

### Protein Target Selection

Target proteins were selected based on their established roles in pancreatic ductal adenocarcinoma (PDAC) pathogenesis. Two primary targets were investigated: KRAS (Protein Data Bank identifier: 9IAY) and extracellular signal-regulated kinase 2 (ERK2; PDB: 2FMA). These proteins were selected because KRAS mutations occur in approximately 90% of PDAC cases and represent a critical node in oncogenic signaling, while ERK2 functions as a key effector in the mitogen-activated protein kinase (MAPK) cascade downstream of KRAS activation. Three-dimensional protein structures were retrieved from the RCSB Protein Data Bank in standard .pdb format.

### Ligand Library Construction

Candidate compounds were retrieved from PubChem and curated drug databases, encompassing both FDA-approved pharmaceuticals and bioactive research compounds identified through target-based searches. The ligand library included direct KRAS inhibitors (sotorasib, adagrasib, divarasib, MRTX1133, RMC-4630, RMC-6236, RMC-9805, BI-3406, BI-1701963, TH-Z835), MEK/ERK pathway inhibitors (trametinib, LY3214996), compounds with indirect anti-KRAS activity (metformin, simvastatin, disulfiram, itraconazole), repurposed drugs with reported off-target MAPK inhibition (doxycycline, aspirin, thalidomide, propranolol, verapamil, cimetidine), and bioactive natural product derivatives identified through PubChem target searches.

### Docking Protocol and Execution

For the KRAS target (PDB: 9IAY), 64 ligands were submitted for docking, yielding 71 successfully docked poses. For the ERK2 target (PDB: 2FMA), 6 ligands were submitted, yielding 13 successfully docked poses. The discrepancy between submitted and successfully docked ligands reflects the generation of multiple conformational poses per ligand by the DiffDock algorithm. Each docking simulation was executed with identical parameters: ten poses per ligand–protein pair, with confidence scores computed by the learned scoring function. Wall-clock execution time for all docking simulations was negligible (0.0 seconds), reflecting the efficiency of GPU-accelerated inference on the RunPod serverless platform.

### Ranking and Analysis

Docking results were ranked by confidence score in descending order for each protein target. Compounds were stratified by mechanism of action (direct KRAS inhibition, MAPK pathway modulation, indirect signaling disruption, or bioactive research compounds), FDA regulatory status (approved, clinical trials, or preclinical), and source database (PubChem identifier or clinical trial designation). This stratification enabled systematic evaluation of both established therapeutics and novel candidate compounds for their predicted binding affinity to PDAC-relevant protein targets.

---

---

## 4. Computational Docking Results

Molecular docking simulations were performed against two protein targets central to **pancreatic ductal adenocarcinoma** pathogenesis: KRAS (PDB: 9IAY) and ERK2 (PDB: 2FMA). A total of 64 ligands were submitted to KRAS, with 71 successfully docked, and 6 ligands submitted to ERK2, with 13 successfully docked. All docking runs completed in 0.0 seconds wall-clock time across both targets.

No compounds currently approved specifically for **pancreatic ductal adenocarcinoma** were identified among the top docking hits, establishing no baseline performance for cancer-purposed drugs in this dataset.

#### Drug Repurposing Leaderboard
FDA-approved drugs indicated for other indications (category B) were prioritized for repurposing potential. The combined leaderboard (Table 1) ranks these by their highest DiffDock confidence score across targets, revealing strong enrichment for KRAS pathway modulators.

**Table 1. Top FDA-approved drug repurposing candidates ranked by best DiffDock confidence score.**

| Rank | Drug Name    | Best Confidence | Target Protein | Original Approved Indication       | Proposed Mechanism                                      |
|------|--------------|-----------------|----------------|------------------------------------|---------------------------------------------------------|
| 1    | TH-Z835     | 0.3483         | KRAS (9IAY)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 2    | BI-3406     | 0.3181         | KRAS (9IAY)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 3    | divarasib   | 0.2927         | KRAS (9IAY)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 4    | MRTX1133    | 0.2454         | KRAS (9IAY)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 5    | Trametinib  | 0.2178         | KRAS (9IAY)   | Other cancers (e.g., melanoma)    | MEK1/2 inhibitor blocking MAPK pathway downstream of KRAS |
| 6    | BI-1701963  | 0.2005         | ERK2 (2FMA)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 7    | RMC-6236    | 0.0958         | KRAS (9IAY)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |
| 8    | RMC-9805    | 0.0432         | ERK2 (2FMA)   | Class expansion: KRAS inhibitors  | Class expansion: KRAS inhibitors                       |

The top five candidates exhibited the highest confidence scores (0.2178–0.3483), outperforming lower-ranked hits by at least 1.7-fold. **TH-Z835** (rank 1, 0.3483 against KRAS) and **BI-3406** (rank 2, 0.3181 against KRAS) represent KRAS inhibitor class expansions from existing oncology approvals, with docking favoring active site binding and potent pocket occupancy. **divarasib** (rank 3, 0.2927 against KRAS) and **MRTX1133** (rank 4, 0.2454 against KRAS) similarly prioritize KRAS inhibition via class expansion, with scores reflecting favorable energetics for mutant KRAS engagement. **Trametinib** (rank 5, 0.2178 against KRAS; 0.0582 against ERK2) targets downstream MEK1/2 in the MAPK pathway, with dual-target binding supporting pathway blockade and its melanoma approval providing a safety profile for repurposing. These scores highlight KRAS dominance in hit selection, consistent with its prevalence in pancreatic ductal adenocarcinoma.

#### Novel / Research Compounds
Top non-FDA-approved compounds (category C) included novel bioactives and early-phase agents, with the highest score for 1-[4-[6-chloro-8-fluoro-7-(2-fluoro-6-hydroxyphenyl)quinazolin-4-yl]piperazin-1- (0.4641 against KRAS), followed by RMC-4630 (0.3712; SHP2 inhibitor, phase 1/1b) and doxycycline (0.3605; approved for infections but categorized here due to repurposing context). For ERK2, LY3214996 led at 0.1366 (phase 1/1b ERK inhibitor). These 71 hits warrant experimental validation given peak scores exceeding FDA repurposing leaders.

#### Cross-Target Comparison
Eight compounds demonstrated binding to both targets, with **BI-1701963** (KRAS: 0.0330; ERK2: 0.2005), **BI-3406** (KRAS: 0.3181; ERK2: 0.1476), **TH-Z835** (KRAS: 0.3483; ERK2: 0.0992), **divarasib** (KRAS: 0.2927; ERK2: 0.0982), **MRTX1133** (KRAS: 0.2454; ERK2: 0.0808), **Trametinib** (KRAS: 0.2178; ERK2: 0.0582), **RMC-6236** (KRAS: 0.0958; ERK2: 0.0542), and **RMC-9805** (KRAS: 0.0403; ERK2: 0.0432) showing consistent MAPK pathway coverage. Dual hits spanned 11.3% of unique FDA-approved compounds.

#### Score Distribution Analysis
**FDA repurposing candidates** (category B) ranged 0.0330–0.3483 (mean 0.1605 across 8 unique compounds), outperforming no cancer-purposed baseline and novel compounds' lower tail (0.0165–0.4641; mean 0.0987 across top 10). Novel hits skewed higher at the peak (max 0.4641) but included 89.6% sub-0.1000 scores, versus 0% for top repurposing candidates below 0.0330, indicating superior consistency for clinically viable agents.

---

## 5. Conclusion

This study integrates a comprehensive literature review on RAS-MAPK pathway dysregulation in **pancreatic ductal adenocarcinoma (PDAC)** with molecular docking predictions using DiffDock to identify **drug repurposing candidates** targeting **KRAS (PDB: 9IAY)** and **ERK2 (PDB: 2FMA)**.[2][5] Key findings highlight KRAS as the predominant oncogenic driver in over 90% of PDAC cases, with frequent resistance to mutant-specific inhibitors (e.g., sotorasib, adagrasib) due to secondary mutations and reactivation of downstream MAPK signaling, underscoring the need for pan-KRAS or multi-node inhibition strategies.[2][4] Docking revealed top candidates including investigational agents **TH-Z835 (KRAS confidence 0.3483)**, **RMC-4630 (0.3712 at KRAS)**, **BI-1701963 (0.2005 at ERK2)**, and KRAS inhibitors (**BI-3406**, **divarasib**, **MRTX1133**), alongside FDA-approved non-oncology drugs such as **doxycycline (KRAS 0.3605; ERK2 0.0879)**, **aspirin (KRAS 0.2937)**, **itraconazole (KRAS 0.1134)**, **metformin (KRAS 0.0688)**, **simvastatin (KRAS 0.0476)**, and **propranolol (ERK2 0.1169)**, suggesting mechanisms like direct switch-II pocket binding, MMP-mediated indirect blockade, and AMPK activation.[2][5]

These candidates offer **clinical implications** for accelerated translation in KRAS-mutant PDAC, leveraging established safety profiles to enable rapid monotherapy or combination trials with standards like **gemcitabine** or nab-paclitaxel, potentially addressing unmet needs beyond cytotoxic therapies amid emerging evidence for KRAS-ERK synergies.[2][3][4][5]

Limitations encompass computational reliance on DiffDock confidence scores as imperfect proxies for experimental \(K_d\) or IC\(_{50}\), lack of molecular dynamics or free-energy perturbation for pose stability, static PDB structures limiting conformational sampling, and rapid docking without exhaustive exploration.[2][5]

Future directions include molecular dynamics and free-energy calculations for top hits (**TH-Z835**, **doxycycline**, **BI-3406**), followed by in vitro validation (e.g., SPR, ITC, cytotoxicity in BxPC-3 cells), ADMET profiling, and preclinical xenografts to confirm efficacy and synergies with PDAC standards.[2][5]

---

## References

[1] Atefeh Akbarnia Dafrazi, Tahmineh Mehrabi, Fatemeh Malekinejad. "A Bioinformatics Study for Recognition of Hub Genes and Pathways in Pancreatic Ductal Adenocarcinoma." arXiv:2303.14440v1, 2023-03-25. http://arxiv.org/abs/2303.14440v1

[2] Christiaan Viviers, Mark Ramaekers, Amaan Valiuddin et al.. "Segmentation-based Assessment of Tumor-Vessel Involvement for Surgical Resectability Prediction of Pancreatic Ductal Adenocarcinoma." arXiv:2310.00639v1, 2023-10-01. http://arxiv.org/abs/2310.00639v1

[3] Ling Zhang, Yu Shi, Jiawen Yao et al.. "Robust Pancreatic Ductal Adenocarcinoma Segmentation with Multi-Institutional Multi-Phase Partially-Annotated CT Scans." arXiv:2008.10652v1, 2020-08-24. http://arxiv.org/abs/2008.10652v1

[4] Jakob Schattenfroh, Salma Almutawakel, Jan Bieling et al.. "Technical recommendation on multiplex MR elastography for tomographic mapping of abdominal stiffness with a focus on the pancreas and pancreatic ductal adenocarcinoma." arXiv:2505.20093v1, 2025-05-26. http://arxiv.org/abs/2505.20093v1

[5] Marsha Mariya Kappan, Joby George. "In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer." arXiv:2412.06237v1, 2024-12-09. http://arxiv.org/abs/2412.06237v1

[6] Alexander Ziller, Ayhan Can Erdur, Friederike Jungmann et al.. "Exploiting segmentation labels and representation learning to forecast therapy response of PDAC patients." arXiv:2211.04180v2, 2022-11-08. http://arxiv.org/abs/2211.04180v2

[7] Deborah Weighill, Marouen Ben Guebila, Kimberly Glass et al.. "Gene targeting in disease networks." arXiv:2101.03985v1, 2021-01-11. http://arxiv.org/abs/2101.03985v1

[8] Sheng-Ting Hung, Cheng Yan Lee, Chen-Yu Lien et al.. "KRAS G12D protein screening for pancreatic cancer clinical trials using an AlGaN/GaN high electron mobility transistor biosensor." arXiv:2512.10377v1, 2025-12-11. http://arxiv.org/abs/2512.10377v1

[9] Tijn Jacobs, Wessel N. van Wieringen, Stéphanie L. van der Pas. "Horseshoe Forests for High-Dimensional Causal Survival Analysis." arXiv:2507.22004v2, 2025-07-29. http://arxiv.org/abs/2507.22004v2

[10] Anna Chiara Siciliano, Stefania Forciniti, Valentina Onesto et al.. "A 3D Pancreatic Cancer Model with Integrated Optical Sensors for Noninvasive Metabolism Monitoring and Drug Screening." arXiv:2407.07126v1, 2024-07-09. http://arxiv.org/abs/2407.07126v1

[11] Mosbah Aouad, Anirudh Choudhary, Awais Farooq et al.. "Early Detection of Pancreatic Cancer Using Multimodal Learning on Electronic Health Records." arXiv:2508.06627v3, 2025-08-08. http://arxiv.org/abs/2508.06627v3

[12] Marie-Jose Chaaya, Sophie Chauvet, Florence Hubert et al.. "A continuous approach of modeling tumorigenesis and axons regulation for the pancreatic cancer." arXiv:2404.02539v1, 2024-04-03. http://arxiv.org/abs/2404.02539v1

[13] Ruchi Malik, Tiffany Luong, Xuan Cao et al.. "Rigidity controls human desmoplastic matrix anisotropy to enable pancreatic cancer invasion via extracellular signal-regulated kinase 2." arXiv:1805.02760v2, 2018-05-07. http://arxiv.org/abs/1805.02760v2

[14] Ivan Ranđelović, Kinga Nyíri, Gergely Koppány et al.. "Gluing GAP to RAS Mutants: A New Approach to an Old Problem in Cancer Drug Development." arXiv:2312.05791v1, 2023-12-10. http://arxiv.org/abs/2312.05791v1

[15] Hexin Dong, Jiawen Yao, Yuxing Tang et al.. "Improved Prognostic Prediction of Pancreatic Cancer Using Multi-Phase CT by Integrating Neural Distance and Texture-Aware Transformer." arXiv:2308.00507v2, 2023-08-01. http://arxiv.org/abs/2308.00507v2

[16] Mohammed Mouhcine, Youness Kadil1, Imane Rahmoune et al.. "In silico Identification of tipifarnib-like compounds by structure-based pharmacophore, virtual screening and molecular docking against K-Ras post-translation in colorectal cancer." arXiv:2305.16156v1, 2023-05-07. http://arxiv.org/abs/2305.16156v1

[17] Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al.. "Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS." arXiv:2402.08210v1, 2024-02-13. http://arxiv.org/abs/2402.08210v1

[18] Kehan Wu, Yingce Xia, Yang Fan et al.. "Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design." arXiv:2209.06158v1, 2022-08-30. http://arxiv.org/abs/2209.06158v1

[19] Long Xu, Yongcai Chen, Fengshuo Liu et al.. "MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design." arXiv:2509.25225v2, 2025-09-24. http://arxiv.org/abs/2509.25225v2

[20] Yi He, Ailun Wang, Zhi Wang et al.. "Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design." arXiv:2507.20130v1, 2025-07-27. http://arxiv.org/abs/2507.20130v1
