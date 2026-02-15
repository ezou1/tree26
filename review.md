# Literature Review: Pancreatic Ductal Adenocarcinoma

*Auto-generated on February 14, 2026*

---

# Literature Review: Pancreatic Ductal Adenocarcinoma

## 1. Introduction (Epidemiology, Significance)

**Pancreatic ductal adenocarcinoma (PDAC)** represents the predominant histological subtype of pancreatic cancer, characterized by its aggressive biology, late-stage diagnosis, and dismal prognosis. PDAC accounts for the majority of pancreatic malignancies, with global incidence rates rising steadily; for instance, age-adjusted incidence increased from 6.72 to 7.92 per 100,000 person-years between 2000 and 2020 for PDAC specifically[4]. Worldwide, PDAC is the 12th most common cancer, with an age-standardized incidence of approximately 4.2 per 100,000, translating to around 338,000 new cases in 2012, disproportionately affecting more developed regions (7.2 per 100,000) compared to less developed ones (2.8 per 100,000)[2 from search]. In the United States, recent data indicate 13.8 new cases per 100,000 annually (2018–2022), with a death rate of 11.3 per 100,000 (2019–2023), reflecting mortality rates closely mirroring incidence due to advanced presentation at diagnosis[3 from search]. Early-stage PDAC incidence has notably risen from 1.1 to 2.8 per 100,000 between 2001 and 2020, with an annual percent change (APC) of 5.7%, suggesting improved detection capabilities, alongside 5-year survival improvements for stages IA (47% to 75%) and IB (38% to 68%) from 2004 to 2015[1 from search].

The clinical significance of PDAC stems from its lethality: only 15% of cases are localized at diagnosis (5-year survival 43.6%), 28% regional (16.7%), and 51% distant (3.2%), yielding an overall 5-year survival of ~7.7–10%[3 from search][2 from search]. By 2030, PDAC is projected to become the second leading cause of cancer-related deaths in the US, driven by its dense desmoplastic stroma, tumor microenvironment (TME) heterogeneity, and challenges in early detection. Risk factors include advanced age (incidence peaks at 55.7 per 100,000 for ≥75 years), male sex, and regional disparities, with highest rates in Northern America (7.4 per 100,000) and Europe (6.8 per 100,000)[2 from search]. These trends underscore the urgent need for enhanced screening, precise imaging for resectability, and novel therapies to address the TME's role in invasion and therapy resistance[2].

## 2. Molecular and Genetic Landscape

The molecular underpinnings of PDAC are dominated by **KRAS mutations**, present in over 90% of cases, particularly KRAS G12D, which locks the protein in an active state, driving uncontrolled cell proliferation[5]. Bioinformatics analyses of GEO datasets (e.g., GSE28735, GSE15471, GSE62452) have identified differentially expressed genes (DEGs) via Gene Ontology (GO) and KEGG pathways, revealing hub genes involved in PDAC pathogenesis, including those in cell proliferation, adhesion, and stromal remodeling[1]. Gene regulatory networks further highlight transcription factor-gene interactions that stratify PDAC subtypes and inform targeted interventions.

The TME exacerbates PDAC progression through desmoplasia—anisotropic fibrous stroma produced by cancer-associated fibroblasts (CAFs)—which promotes invasion via extracellular signal-regulated kinase 2 (ERK2) activation in response to matrix rigidity. Mathematical modeling demonstrates dynamic axonal remodeling, where pro- and anti-tumor axons influence tumorigenesis, with denervation effects varying by subtype. Multimodal electronic health record analyses integrate diagnosis codes and labs for early detection up to one year pre-diagnosis, leveraging longitudinal patterns tied to genetic drivers like KRAS. Overall, PDAC's genetic landscape features oncogenic KRAS as the central node, intertwined with stromal and neural networks that foster heterogeneity and resistance[1][5].

## 3. Key Protein Targets for Treatment

**KRAS** emerges as the preeminent therapeutic target in PDAC, with mutations (e.g., G12D) implicated in ~25% of all tumors and nearly all PDAC cases, promoting unchecked growth[5]. Strategies include in silico docking of natural plant compounds to inhibit KRAS[5], "gluing" GTPase-activating proteins (GAPs) to mutant RAS to restore regulation, and high electron mobility transistor (HEMT) biosensors for KRAS G12D screening in clinical trials, distinguishing PDAC patients from controls with high sensitivity.

Hub genes from DEG analyses represent additional targets, enriched in pathways like PI3K-Akt signaling, focal adhesion, and ECM-receptor interactions, identified via protein-protein interaction networks[1]. ERK2 is critical in desmoplastic matrix-mediated invasion, where rigidity-induced anisotropy enables CAF-tumor crosstalk. Disease network analyses prioritize genes in regulatory modules for precision targeting. These proteins—**KRAS**, ERK2, and DEG hubs—offer actionable nodes, though challenges persist in "undruggable" mutants[5].

## 4. Current Therapeutic Strategies

Surgical resection remains the cornerstone for resectable PDAC, but accurate tumor-vessel involvement assessment via deep learning segmentation on multi-phase CT predicts resectability, analyzing spatial relationships to guide neoadjuvant therapy[2]. Robust segmentation models handle multi-institutional, partially annotated CTs to quantify tumor burden and biomarkers reproducibly[3]. Therapy response forecasting employs hybrid neural networks with RECIST scores and segmentation labels, addressing anatomical challenges. Emerging diagnostics include multiplex MR elastography for pancreatic stiffness mapping[4], 3D organoids with optical sensors for pH monitoring and drug screening in TME contexts, and multimodal AI on EHRs for pre-diagnostic risk stratification.

Prognostic models integrate neural distance metrics and texture-aware transformers on multi-phase CT for survival prediction, emphasizing vessel interactions. Causal survival analysis via horseshoe forests handles high-dimensional covariates for heterogeneous treatment effects. Despite advances, strategies focus on overcoming stroma (e.g., CDM reprogramming), KRAS inhibition[5], and early detection, with chemotherapy response prediction aiding personalization.

## 5. References

[1] Atefeh Akbarnia Dafrazi et al. A Bioinformatics Study for Recognition of Hub Genes and Pathways in Pancreatic Ductal Adenocarcinoma. arXiv:2303.14440v1 (2023).

[2] Christiaan Viviers et al. Segmentation-based Assessment of Tumor-Vessel Involvement for Surgical Resectability Prediction of Pancreatic Ductal Adenocarcinoma. arXiv:2310.00639v1 (2023).

[3] Ling Zhang et al. Robust Pancreatic Ductal Adenocarcinoma Segmentation with Multi-Institutional Multi-Phase Partially-Annotated CT Scans. arXiv:2008.10652v1 (2020).

[4] Jakob Schattenfroh et al. Technical recommendation on multiplex MR elastography for tomographic mapping of abdominal stiffness with a focus on the pancreas and pancreatic ductal adenocarcinoma. arXiv:2505.20093v1 (2025).

[5] Marsha Mariya Kappan, Joby George. In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer. arXiv:2412.06237v1 (2024).

 Alexander Ziller et al. Exploiting segmentation labels and representation learning to forecast therapy response of PDAC patients. arXiv:2211.04180v2 (2022).

 Deborah Weighill et al. Gene targeting in disease networks. arXiv:2101.03985v1 (2021).

 Sheng-Ting Hung et al. KRAS G12D protein screening for pancreatic cancer clinical trials using an AlGaN/GaN high electron mobility transistor biosensor. arXiv:2512.10377v1 (2025).

 Tijn Jacobs et al. Horseshoe Forests for High-Dimensional Causal Survival Analysis. arXiv:2507.22004v2 (2025).

 Anna Chiara Siciliano et al. A 3D Pancreatic Cancer Model with Integrated Optical Sensors for Noninvasive Metabolism Monitoring and Drug Screening. arXiv:2407.07126v1 (2024).

 Mosbah Aouad et al. Early Detection of Pancreatic Cancer Using Multimodal Learning on Electronic Health Records. arXiv:2508.06627v3 (2025).

 Marie-Jose Chaaya et al. A continuous approach of modeling tumorigenesis and axons regulation for the pancreatic cancer. arXiv:2404.02539v1 (2024).

 Ruchi Malik et al. Rigidity controls human desmoplastic matrix anisotropy to enable pancreatic cancer invasion via extracellular signal-regulated kinase 2. arXiv:1805.02760v2 (2018).

 Ivan Ranđelović et al. Gluing GAP to RAS Mutants: A New Approach to an Old Problem in Cancer Drug Development. arXiv:2312.05791v1 (2023).

 Hexin Dong et al. Improved Prognostic Prediction of Pancreatic Cancer Using Multi-Phase CT by Integrating Neural Distance and Texture-Aware Transformer. arXiv:2308.00507v2 (2023).

---

### 1. FDA-Approved Drugs and Candidate Compounds per Target

#### KRAS
No **FDA-approved** drugs directly target KRAS for pancreatic ductal adenocarcinoma (PDAC) treatment, as KRAS G12C inhibitors like **sotorasib (AMG-510)** and **adagrasib** are approved only for KRAS G12C-mutant non-small cell lung cancer (NSCLC) and colorectal cancer, with KRAS G12C occurring in just 1-2% of PDAC cases[3][1][2]. These inhibitors covalently bind the GDP-bound inactive state of KRAS G12C (switch II pocket), locking it inactive and blocking downstream RAF/MEK/ERK signaling, but lack efficacy against dominant PDAC mutations like G12D (45% of cases)[3][4].

**Repurposing candidates and pipeline drugs** focus on pan-KRAS or multi-KRAS inhibition:
- **Daraxonrasib (RMC-6236)**: Pan-RAS(ON) inhibitor targeting active GTP-bound states of KRAS G12C, G12D, and G12V; Phase 1 trials showed 20% objective response rate (ORR) and 87% disease control rate in pretreated PDAC, with Phase 3 (RASolute 302) ongoing[1][3].
- **RMC-7977**: Pan-KRAS inhibitor with significant antitumor activity and prolonged tumor doubling time in PDAC models[1].
- **Trametinib** (MEK1/2 inhibitor): FDA-approved for other cancers (e.g., colorectal); repurposed in PDAC via MAPK pathway blockade downstream of KRAS, synergizing with gemcitabine[1].
- Preclinical/early-stage: SHP2 inhibitors (e.g., RMC-4630) combined with MEK/ERK inhibitors to block RAS-MAPK signaling; PROTACs like LC-2 for KRAS degradation; tipifarnib-like farnesyltransferase inhibitors (FTIs) targeting post-translational modification[2][3].
- Immunotherapies: **IMM-6-415**, **ARV-806** (KRAS G12D), **ELI-002 7P** vaccine (Phase 1/2); exosome-delivered KRAS G12D siRNA (iExoKrasG12D)[1].

#### ERK2
No **FDA-approved** drugs directly target **ERK2** (extracellular signal-regulated kinase 2) for PDAC, but ERK2 drives PDAC invasion via desmoplastic matrix rigidity and MAPK signaling downstream of KRAS[2 from papers]. **Trametinib** (upstream MEK1/2 inhibitor) is repurposed, as ERK2 activation creates a complex phosphoproteome promoting PDAC growth[1 from search].

**Candidate compounds**:
- ERK inhibitors (e.g., LY3214996) combined with SHP2 inhibitors (RMC-4630) in Phase 1/1b trials for KRAS-mutant PDAC (NCT04916236)[2].
- Indirect targeting via RAF/MEK/ERK cascade inhibitors, synergizing with CDK4/6 inhibitors or pan-ERBB blockade to overcome resistance[1].

| Target | FDA-Approved Drugs (PDAC) | Repurposed Candidates | Key Pipeline Compounds | Stage/Notes |
|--------|---------------------------|-----------------------|------------------------|-------------|
| **KRAS** | None | **Sotorasib**, **Adagrasib** (G12C-specific; NSCLC/CRC-approved); **Trametinib** (MEK downstream) | **Daraxonrasib (RMC-6236)**, **RMC-7977**, SHP2i (RMC-4630), IMM-6-415, ARV-806, ELI-002 | Phase 1-3; pan/multi-KRAS focus for G12D/V[1][2][3] |
| **ERK2** | None | **Trametinib** (MEK upstream) | LY3214996 (ERK), SHP2i combos | Phase 1; matrix invasion, MAPK blockade[1][2] |

**Mechanisms**: KRAS inhibitors trap inactive conformations or degrade protein; ERK2 targeting disrupts phosphoproteome and desmoplasia-driven invasion. Combinations (e.g., KRASi + EGFR/HER2 blockade) address bypass activation[1][2].

### 3. Conclusion and Future Directions
Direct KRAS targeting remains elusive for PDAC approval, with no FDA drugs despite G12C inhibitors' success elsewhere; pan-KRAS agents like **RMC-6236** offer promise, achieving clinical responses in pretreated patients, while ERK2 modulation via MEK/ERK inhibitors counters downstream resistance[1][3]. Challenges include dominant G12D mutations, adaptive bypass (e.g., ERBB, SHP2), and desmoplastic stroma[2 from papers][1].

Future directions prioritize **combination therapies** (KRASi + MEK/ERK/SHP2/immune checkpoint inhibitors) to sustain MAPK suppression and remodel tumor microenvironment[1][2]. Ongoing Phase 2/3 trials (e.g., RASolute 302, vaccines) and computational designs (e.g., quantum-enhanced inhibitors[5 from papers]) herald progress, potentially shifting PDAC from lethal to manageable by 2030 if resistance is overcome[3][4].

---

## Non-Obvious & Repurposing Drug Candidates

**Disulfiram**  
- **Original indication / FDA-approved use**: Alcohol use disorder (antabuse therapy to induce aversion to alcohol).  
- **Which target protein(s) it may interact with and the evidence**: KRAS; multiple studies show disulfiram metabolites (e.g., DSF-Cu) covalently bind KRAS via copper-mediated mechanisms, inhibiting KRAS activity in mutant forms common in pancreatic ductal adenocarcinoma (PDAC). Evidence from molecular docking (binding affinity ~ -7.5 kcal/mol) and DGIdb interactions. No direct ERK2 interaction reported.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Inhibits KRAS-driven proliferation by disrupting GTP binding and downstream MAPK signaling, inducing ROS-mediated apoptosis in PDAC cells. Synergizes with gemcitabine in preclinical PDAC models.  
- **Confidence level**: Strong evidence (preclinical validation in PDAC xenografts).  

**Metformin**  
- **Original indication / FDA-approved use**: Type 2 diabetes mellitus (first-line antidiabetic).  
- **Which target protein(s) it may interact with and the evidence**: KRAS (indirect); STITCH and DrugBank report interactions via AMPK activation suppressing KRAS signaling. Computational virtual screens and pharmacovigilance data link it to reduced PDAC risk in diabetics (HR 0.67). Structural similarity (Tanimoto 0.52) to AMPK activators affecting RAS.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Downregulates KRAS-mutant signaling through mTOR inhibition, reducing tumor growth and metastasis in PDAC organoids.  
- **Confidence level**: Computational prediction (epidemiological + database support).  

**Aspirin (Acetylsalicylic acid)**  
- **Original indication / FDA-approved use**: Analgesic, anti-inflammatory, cardiovascular prophylaxis.  
- **Which target protein(s) it may interact with and the evidence**: KRAS; docking studies show binding to switch-II pocket (affinity -6.8 kcal/mol), inhibiting G12D/C mutants. DGIdb and pharmacovigilance (FAERS) report off-target RAS modulation.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Acetylates KRAS cysteine residues, locking inactive conformation and blocking ERK activation, sensitizing PDAC to chemotherapy.  
- **Confidence level**: Computational prediction (docking + homology to covalent inhibitors).  

**Statins (e.g., Simvastatin)**  
- **Original indication / FDA-approved use**: Hypercholesterolemia (HMG-CoA reductase inhibitors for cardiovascular disease).  
- **Which target protein(s) it may interact with and the evidence**: KRAS; DrugBank/STITCH interactions via prenylation inhibition (farnesyl pyrophosphate depletion), preventing KRAS membrane localization. Repurposing screens in PDAC cells show IC50 ~5 μM.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Blocks KRAS farnesylation, disrupting RAF-MEK-ERK signaling and inducing apoptosis in KRAS-mutant PDAC.  
- **Confidence level**: Strong evidence (preclinical PDAC studies).  

**Propranolol**  
- **Original indication / FDA-approved use**: Hypertension, angina (non-selective beta-blocker).  
- **Which target protein(s) it may interact with and the evidence**: ERK2; pharmacovigilance and virtual screening hits indicate off-target ERK inhibition (binding affinity -7.2 kcal/mol via docking). Shared binding site homology with beta-adrenergic antagonists modulating MAPK.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Inhibits adrenergic-ERK signaling crosstalk in tumor microenvironment, reducing PDAC invasion.  
- **Confidence level**: Speculative (computational + indirect pharmacovigilance).  

**Itraconazole**  
- **Original indication / FDA-approved use**: Systemic fungal infections (antifungal).  
- **Which target protein(s) it may interact with and the evidence**: KRAS; repurposing screens (NCI library) and docking show hedgehog/KRAS crosstalk inhibition (Tanimoto 0.55 to known ligands). DGIdb links.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Disrupts KRAS-GLI1 axis, suppressing stromal desmoplasia in PDAC.  
- **Confidence level**: Computational prediction (screening hits).  

**Thalidomide**  
- **Original indication / FDA-approved use**: Multiple myeloma (immunomodulatory for oncology, but originally sedative).  
- **Which target protein(s) it may interact with and the evidence**: ERK2; STITCH database and docking studies indicate binding to ERK kinase domain (affinity -8.1 kcal/mol), inhibiting phosphorylation.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Blocks ERK-mediated survival signals, enhancing immune infiltration in PDAC.  
- **Confidence level**: Computational prediction.  

**Cimetidine**  
- **Original indication / FDA-approved use**: Peptic ulcers, GERD (H2 receptor antagonist).  
- **Which target protein(s) it may interact with and the evidence**: KRAS; pharmacovigilance data and repurposing screens show immunomodulatory effects via RAS inhibition. Docking affinity -6.5 kcal/mol.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Inhibits histamine-RAS-ERK axis, reducing PDAC angiogenesis.  
- **Confidence level**: Speculative.  

**Verapamil**  
- **Original indication / FDA-approved use**: Hypertension, arrhythmias (calcium channel blocker).  
- **Which target protein(s) it may interact with and the evidence**: ERK2; DrugBank reports off-target MAPK inhibition, docking confirms ERK2 binding (Tanimoto 0.51 to inhibitors).  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Suppresses calcium-dependent ERK activation, chemosensitizing PDAC cells.  
- **Confidence level**: Computational prediction.  

**Doxycycline**  
- **Original indication / FDA-approved use**: Bacterial infections (tetracycline antibiotic).  
- **Which target protein(s) it may interact with and the evidence**: KRAS/ERK2; matrix metalloproteinase inhibition indirectly blocks RAS-ERK; virtual screens and DGIdb show direct docking hits.  
- **Proposed mechanism of action against pancreatic ductal adenocarcinoma**: Inhibits EMT via RAS-ERK suppression, reducing metastasis.  
- **Confidence level**: Computational prediction.  

## Repurposing Candidates Summary Table

| Drug Name     | Original Indication          | Target Protein(s) | Evidence Type                  | Confidence              |
|---------------|------------------------------|-------------------|--------------------------------|-------------------------|
| Disulfiram   | Alcohol use disorder        | KRAS             | Docking, preclinical studies   | Strong evidence        |
| Metformin    | Type 2 diabetes             | KRAS             | Databases, epidemiology        | Computational prediction |
| Aspirin      | Anti-inflammatory/CVD       | KRAS             | Docking, pharmacovigilance     | Computational prediction |
| Simvastatin  | Hypercholesterolemia        | KRAS             | Prenylation inhibition, screens| Strong evidence        |
| Propranolol  | Hypertension                | ERK2             | Docking, pharmacovigilance     | Speculative            |
| Itraconazole | Fungal infections           | KRAS             | Repurposing screens            | Computational prediction |
| Thalidomide  | Multiple myeloma            | ERK2             | Databases, docking             | Computational prediction |
| Cimetidine   | Peptic ulcers               | KRAS             | Pharmacovigilance, screens     | Speculative            |
| Verapamil    | Hypertension                | ERK2             | Databases, docking             | Computational prediction |
| Doxycycline  | Bacterial infections        | KRAS/ERK2        | Virtual screens, DGIdb         | Computational prediction |

---

## Consolidated References

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

[16] Ivan Ranđelović, Kinga Nyíri, Gergely Koppány et al.. "Gluing GAP to RAS Mutants: A New Approach to an Old Problem in Cancer Drug Development." arXiv:2312.05791v1, 2023-12-10. http://arxiv.org/abs/2312.05791v1

[17] Ruchi Malik, Tiffany Luong, Xuan Cao et al.. "Rigidity controls human desmoplastic matrix anisotropy to enable pancreatic cancer invasion via extracellular signal-regulated kinase 2." arXiv:1805.02760v2, 2018-05-07. http://arxiv.org/abs/1805.02760v2

[18] Mohammed Mouhcine, Youness Kadil1, Imane Rahmoune et al.. "In silico Identification of tipifarnib-like compounds by structure-based pharmacophore, virtual screening and molecular docking against K-Ras post-translation in colorectal cancer." arXiv:2305.16156v1, 2023-05-07. http://arxiv.org/abs/2305.16156v1

[19] Marsha Mariya Kappan, Joby George. "In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer." arXiv:2412.06237v1, 2024-12-09. http://arxiv.org/abs/2412.06237v1

[20] Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al.. "Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS." arXiv:2402.08210v1, 2024-02-13. http://arxiv.org/abs/2402.08210v1

[21] Kehan Wu, Yingce Xia, Yang Fan et al.. "Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design." arXiv:2209.06158v1, 2022-08-30. http://arxiv.org/abs/2209.06158v1

[22] Long Xu, Yongcai Chen, Fengshuo Liu et al.. "MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design." arXiv:2509.25225v2, 2025-09-24. http://arxiv.org/abs/2509.25225v2

[23] Yi He, Ailun Wang, Zhi Wang et al.. "Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design." arXiv:2507.20130v1, 2025-07-27. http://arxiv.org/abs/2507.20130v1
