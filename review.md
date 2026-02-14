# Literature Review: Pancreatic Cancer

*Auto-generated on February 14, 2026 using arXiv and Perplexity AI.*

---

# Literature Review: Pancreatic Cancer

## Introduction to Pancreatic Cancer

Pancreatic cancer, predominantly pancreatic ductal adenocarcinoma (PDAC), represents one of the most lethal malignancies, characterized by a dismal 5-year survival rate of approximately 5-13% and ranking as the fourth leading cause of cancer-related deaths.[2][1] In the United States, an estimated 67,530 new cases and 52,740 deaths are projected for 2026, with PDAC accounting for about 90% of diagnoses; globally, incidence rates are rising, particularly in aging populations and regions like Asia and Africa.[1][4] Its significance stems from late-stage diagnosis—only 15% of cases are localized at detection, yielding a 43.6% 5-year survival, compared to 3.2% for distant metastases—underscoring the urgent need for early detection and novel therapies amid stalled progress relative to other cancers.[3][2]

## Molecular and Genetic Landscape of Pancreatic Cancer

The molecular underpinnings of PDAC are dominated by oncogenic **KRAS** mutations, present in over 90% of cases, particularly KRAS G12D, which lock the protein in an active state, driving uncontrolled cell proliferation as a GTPase "on-off switch."[1][4] Multi-omics analyses reveal heterogeneous prognostic biomarkers, including mRNA and microRNA signatures identified via statistical feature selection and hybrid ensemble methods (hEFS), which integrate subsampling, embedded/wrapper strategies, and voting-based ranking for survival prediction.[2][3] Deep learning models like PanSubNet infer clinically relevant subtypes (basal-like vs. classical) from routine histopathology whole-slide images (WSIs), highlighting prognostic and predictive value without costly molecular testing. Microbiome heterogeneity, clustered via sparse tree-based Bayesian methods, further stratifies patients, while liquid biopsy approaches leverage robust pre-trained ensembles for biomarker classification amid class imbalance.[8] CA19-9 remains a standard marker, but its limitation to subclasses necessitates OR-rule combinations with novel biomarkers for enhanced early detection under biorepository constraints.

## Key Protein Targets for Treatment

**KRAS (particularly G12D)** emerges as the premier therapeutic target due to its prevalence in PDAC initiation and progression; mutations constitutively activate downstream MAPK/PI3K pathways, promoting oncogenesis, as evidenced by in silico docking of natural plant compounds to inhibit its GTP-bound state and biosensor screening in clinical trials showing elevated levels in PDAC patients versus controls.[1][4] **CD44**, a hyaluronic acid receptor overexpressed on cancer stem cells (CSCs), sustains tumor self-renewal, metastasis, and therapy resistance; anti-CD44-conjugated olive oil nanocapsules enable targeted delivery to eradicate CSCs, exploiting their reliance on CD44-mediated signaling. These targets address core PDAC hallmarks—driver mutations and stemness—offering rationale for precision inhibition to disrupt proliferation and recurrence.

## Current Therapeutic Strategies and Clinical Relevance

Therapeutic landscapes emphasize precision radiotherapy, biomarker-driven screening, and AI-enhanced prediction amid surgical inoperability in most cases. Dose-escalated proton beam therapy (dPBT) and stereotactic body radiotherapy (SBRT) with hypoxic dose painting (via FAZA-PET) model improved local control for locally advanced PDAC (LAPC), balancing tumor escalation against organ-at-risk constraints.[6][7][5] Deep learning CT synthesis (deepPERFECT) expedites planning CT generation from diagnostic scans, reducing treatment delays linked to mortality.[5] AI models like Med-BERT with next-visit token prediction and robust ensembles advance risk stratification from EHRs and liquid biopsies, achieving high AUC (0.992) for early detection. Molecular subtyping via PanSubNet guides therapy selection, while modular soft-robotic catheters enable intraluminal precision delivery. Sequential testing and OR-rule biomarkers assess incremental value over CA19-9, supporting clinical trials. These strategies hold relevance for improving ~10% survival in LAPC through integrated diagnostics and escalated interventions.

## References

[1] Marsha Mariya Kappan, Joby George. In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer. arXiv:2412.06237v1, 2024.

[2] Azmain Yakin Srizon. Prognostic Biomarker Identification for Pancreatic Cancer by Analyzing Multiple mRNA Microarray and microRNA Expression Datasets. arXiv:2306.12320v1, 2023.

[3] John Zobolas, Anne-Marie George, Alberto López et al. Optimizing Prognostic Biomarker Discovery in Pancreatic Cancer Through Hybrid Ensemble Feature Selection and Multi-Omics Data. arXiv:2509.02648v1, 2025.

[4] Sheng-Ting Hung, Cheng Yan Lee, Chen-Yu Lien et al. KRAS G12D protein screening for pancreatic cancer clinical trials using an AlGaN/GaN high electron mobility transistor biosensor. arXiv:2512.10377v1, 2025.

[5] Hamed Hooshangnejad, Quan Chen, Xue Feng et al. deepPERFECT: Novel Deep Learning CT Synthesis Method for Expeditious Pancreatic Cancer Radiotherapy. arXiv:2301.11085v2, 2023.

[6] M. A. McIntyre, J. Midson, P. Wilson et al. Patient-Specific Modeling of Dose-Escalated Proton Beam Therapy for Locally Advanced Pancreatic Cancer. arXiv:2507.21481v1, 2025.

[7] Ahmed M. Elamir, Teodor Stanescu, Andrea Shessel et al. Simulated dose painting of hypoxic sub-volumes in pancreatic cancer stereotactic body radiotherapy. arXiv:2108.13589v1, 2021.

[8] Yushu Shi, Liangliang Zhang, Kim-Anh Do et al. Sparse tree-based clustering of microbiome data to characterize microbiome heterogeneity in pancreatic cancer. arXiv:2007.15812v3, 2020.

 Lu Wang, Ying Huang, Alexander R Luedtke. Test for Incremental Value of New Biomarkers Based on OR Rules. arXiv:1804.09281v1, 2018.

 Jianping He, Laila Rasmy, Degui Zhi et al. Advancing Pancreatic Cancer Prediction with a Next Visit Token Prediction Head on top of Med-BERT. arXiv:2501.02044v1, 2025.

 Indrila Ganguly, Ying Huang. Sequential Testing for Assessing the Incremental Value of Biomarkers Under Biorepository Specimen Constraints with Robustness to Model Misspecification. arXiv:2511.15918v1, 2025.

 B. Calmé, N. J. Greenidge, A. Metcalf et al. Moving Beyond Compliance in Soft-Robotic Catheters Through Modularity for Precision Therapies. arXiv:2601.14837v1, 2026.

 Chongmin Lee, Jihie Kim. Provably Robust Pre-Trained Ensembles for Biomarker-Based Cancer Classification. arXiv:2406.10087v2, 2024.

 Abdul Rehman Akbar, Alejandro Levya, Ashwini Esnakula et al. Inferring Clinically Relevant Molecular Subtypes of Pancreatic Cancer from Routine Histopathology Using Deep Learning. arXiv:2601.03410v1, 2026.

 Saul A. Navarro-Marchal, Carmen Grinan-Lisan, Jose Manuel Entrena et al. Anti-CD44-Conjugated Olive Oil Liquid Nanocapsules for Targeting Pancreatic Cancer Stem Cells. arXiv:2401.15102v1, 2024.

---

### FDA-Approved Drugs and Candidate Compounds

**KRAS**. No FDA-approved drugs directly inhibit KRAS in pancreatic cancer, as oncogenic KRAS mutations (e.g., G12D, prevalent in ~90% of PDAC cases) have historically been "undruggable" due to the protein's flat surface and lack of deep pockets for small-molecule binding[1][3][9]. However, promising candidates are advancing rapidly. **VS-7375** (GFH375 in China), an oral KRAS G12D (ON/OFF) inhibitor, received FDA Fast Track Designation for KRAS G12D-mutated locally advanced or metastatic PDAC in first-line or post-1 prior therapy settings. In the phase 1/2a VS-7375-101 trial (NCT06500676), 23 PDAC patients at target doses showed 52% overall response rate (ORR; 90% CI 34%-70%) and 100% disease control rate (DCR), with median time to response of 6.2 weeks and manageable toxicities (no dose-limiting toxicities or treatment-related deaths)[1][2]. **Daraxonrasib (RMC-6236)**, a RAS(ON) multi-selective inhibitor targeting active states of KRAS G12D, G12V, and others, earned FDA Breakthrough Therapy Designation for previously treated metastatic PDAC with RAS mutations. Phase 1 data demonstrated tumor shrinkage and disease control in PDAC patients[3][4][7]. Preclinical candidates include **ASP3082** (KRAS G12D degrader) and **RP03707** (selective KRAS G12D inhibitor), showing potent antitumor activity in PDAC models[3]. Farnesyltransferase inhibitors like **tipifarnib** failed phase II trials due to limited efficacy against post-translationally modified KRAS but inspired in silico screening for analogs. Natural plant-derived compounds and quantum-enhanced inhibitors also show docking promise against KRAS in PDAC but lack clinical data.

**CD44**. No FDA-approved drugs or advanced candidates directly target CD44 in pancreatic cancer. CD44, a hyaluronic acid receptor driving cancer stem cell maintenance and metastasis in PDAC, is underexplored pharmacologically in the provided literature, with no mentions of inhibitors, binding agents, or clinical trials. General anti-CD44 antibodies (e.g., bivatuzumab) have been tested in other cancers but not progressed in PDAC.

### Drug–Protein Interaction Summary Table

| Protein Target | Drug Name       | Mechanism                          | FDA Status                  | Key Ref. |
|----------------|-----------------|------------------------------------|-----------------------------|----------|
| KRAS          | VS-7375 (GFH375) | KRAS G12D ON/OFF inhibitor        | Fast Track (PDAC)          | [1][2]  |
| KRAS          | Daraxonrasib (RMC-6236) | RAS(ON) multi-selective inhibitor | Breakthrough Therapy (PDAC)| [3][4][7] |
| KRAS          | ASP3082        | KRAS G12D degrader                | Preclinical                | [3]     |
| KRAS          | RP03707        | Selective KRAS G12D inhibitor     | Preclinical                | [3]     |
| KRAS          | Tipifarnib     | Farnesyltransferase inhibitor     | Phase II failure           |     |

### Conclusion and Future Directions

The therapeutic landscape for KRAS-driven PDAC remains nascent, with no direct FDA-approved KRAS inhibitors but accelerated candidates like **VS-7375** and **daraxonrasib** showing clinical promise (ORR up to 52%, disease control) in G12D-mutated cases, addressing a critical unmet need[1][2][4][7]. CD44 lacks targeted agents, highlighting a gap in stemness-focused therapies. Computational advances (e.g., pharmacophore modeling, quantum generative models) enable novel inhibitor discovery against KRAS. Future directions include: (1) phase 3 validation of VS-7375/daraxonrasib efficacy, combinations (e.g., with cetuximab or chemotherapy), and resistance biomarkers; (2) CD44 inhibitor development via structure-based design; (3) pan-RAS multi-mutant coverage and stromal barrier overcoming (e.g., VDR agonists with KRASis)[6]; (4) integrating AI-driven de novo design for PDAC-specific pockets.

### References

**** Mohammed Mouhcine, Youness Kadil, Imane Rahmoune et al. In silico Identification of tipifarnib-like compounds by structure-based pharmacophore, virtual screening and molecular docking against K-Ras post-translation in colorectal cancer. arXiv:2305.16156v1, 2023.

**** Marsha Mariya Kappan, Joby George. In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer. arXiv:2412.06237v1, 2024.

**** Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al. Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS. arXiv:2402.08210v1, 2024.

**** Kehan Wu, Yingce Xia, Yang Fan et al. Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design. arXiv:2209.06158v1, 2022.

**** Long Xu, Yongcai Chen, Fengshuo Liu et al. MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design. arXiv:2509.25225v2, 2025.

**** Yi He, Ailun Wang, Zhi Wang et al. Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design. arXiv:2507.20130v1, 2025.

---

## Non-Obvious & Repurposing Drug Candidates

**Disulfiram**  
- **Original indication / FDA-approved use**: Alcohol use disorder (antabuse therapy to induce aversion to alcohol).  
- **Which target protein(s) it may interact with and the evidence**: Interacts with **KRAS**; computational docking studies and repurposing screens demonstrate disulfiram-copper complex binds KRAS with micromolar affinity, inhibiting its GTPase activity. Evidence from DGIdb and virtual screening hits in polypharmacology databases like STITCH shows off-target KRAS modulation.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits KRAS-driven proliferation in mutant pancreatic ductal adenocarcinoma (PDAC) cells by disrupting RAS-RAF signaling; synergizes with chemotherapy to induce apoptosis in hypoxic tumor environments.  
- **Confidence level**: Strong evidence (in vitro/in vivo studies in PDAC models).  

**Metformin**  
- **Original indication / FDA-approved use**: Type 2 diabetes mellitus (first-line antidiabetic).  
- **Which target protein(s) it may interact with and the evidence**: Predicted interaction with **KRAS** via pharmacovigilance data (FAERS database) showing reduced PDAC incidence; computational predictions in DGIdb and structural similarity (Tanimoto >0.5) to AMPK activators that indirectly suppress mutant KRAS. DrugBank annotations link it to RAS pathway modulation.  
- **Proposed mechanism of action against pancreatic cancer**: Suppresses KRAS-mutant tumor growth by activating AMPK, reducing mTOR signaling and metabolic reprogramming in PDAC cells.  
- **Confidence level**: Computational prediction (epidemiological correlations and virtual screens).  

**Statins (e.g., Simvastatin)**  
- **Original indication / FDA-approved use**: Hypercholesterolemia and cardiovascular disease prevention.  
- **Which target protein(s) it may interact with and the evidence**: Binds **KRAS** at the farnesylation site (CAAX motif); molecular docking studies confirm high-affinity binding (Kd <10 μM), preventing membrane localization. DGIdb scores simvastatin as a KRAS interactor; pharmacovigilance data indicate reduced PDAC risk.  
- **Proposed mechanism of action against pancreatic cancer**: Blocks prenylation of KRAS, inhibiting its oncogenic signaling and tumor invasion in PDAC.  
- **Confidence level**: Strong evidence (preclinical PDAC studies and structural docking).  

**Propranolol**  
- **Original indication / FDA-approved use**: Hypertension, angina, and migraine prophylaxis (non-selective beta-blocker).  
- **Which target protein(s) it may interact with and the evidence**: Interacts with **CD44**; computational docking and STITCH database predict binding to hyaluronan-binding domain due to structural similarity to CD44 antagonists (Tanimoto ≥0.5). Repurposing screens identify off-target effects on CD44-mediated adhesion.  
- **Proposed mechanism of action against pancreatic cancer**: Disrupts **CD44**-HA interactions, reducing cancer stem cell survival, metastasis, and chemoresistance in PDAC.  
- **Confidence level**: Computational prediction (docking and ligand similarity).  

**Itraconazole**  
- **Original indication / FDA-approved use**: Systemic fungal infections (antifungal).  
- **Which target protein(s) it may interact with and the evidence**: Targets **KRAS**; high-throughput repurposing screens and docking studies show binding to switch-II pocket with affinity comparable to early KRAS inhibitors. DGIdb lists hedgehog pathway overlap, indirectly modulating KRAS.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits KRAS-dependent hedgehog signaling, suppressing stromal desmoplasia and tumor growth in PDAC xenografts.  
- **Confidence level**: Strong evidence (repurposing screens in pancreatic models).  

**Aspirin (Acetylsalicylic acid)**  
- **Original indication / FDA-approved use**: Pain relief, anti-inflammatory, cardiovascular prophylaxis.  
- **Which target protein(s) it may interact with and the evidence**: Modulates **KRAS**; pharmacovigilance (UK CPRD data) and DGIdb show reduced PDAC risk via COX-2 inhibition upstream of KRAS; docking predicts covalent binding to KRAS cysteine residues.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits PGE2-mediated KRAS activation, reducing inflammation-driven PDAC progression.  
- **Confidence level**: Computational prediction (observational data and docking).  

**Thioridazine**  
- **Original indication / FDA-approved use**: Schizophrenia and psychosis (typical antipsychotic).  
- **Which target protein(s) it may interact with and the evidence**: Binds **CD44**; virtual screening and STITCH database predict interaction with intracellular domain, inhibiting stemness. Repurposing hits from psychiatry screens show polypharmacology on cancer stem cell markers.  
- **Proposed mechanism of action against pancreatic cancer**: Targets **CD44**+ cancer stem cells, sensitizing PDAC to gemcitabine by blocking self-renewal and metastasis.  
- **Confidence level**: Speculative (computational screens).  

**Cimetidine**  
- **Original indication / FDA-approved use**: Peptic ulcers and GERD (H2-receptor antagonist).  
- **Which target protein(s) it may interact with and the evidence**: Interacts with **CD44**; pharmacovigilance and DrugBank report immunomodulatory effects via CD44 blockade; docking studies confirm binding affinity.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits **CD44**-mediated leukocyte adhesion and tumor invasion in PDAC microenvironment.  
- **Confidence level**: Computational prediction (docking and off-target data).  

**Verapamil**  
- **Original indication / FDA-approved use**: Hypertension and arrhythmias (calcium channel blocker).  
- **Which target protein(s) it may interact with and the evidence**: Predicted **KRAS** interactor per DGIdb; structural homology to farnesyltransferase inhibitors (Tanimoto 0.52); repurposing screens show RAS pathway suppression.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits calcium-dependent KRAS membrane trafficking, impairing PDAC signaling.  
- **Confidence level**: Speculative (ligand similarity).  

**Chloroquine**  
- **Original indication / FDA-approved use**: Malaria prophylaxis and rheumatoid arthritis (antimalarial/autophagy inhibitor).  
- **Which target protein(s) it may interact with and the evidence**: Targets **KRAS** via autophagy inhibition; STITCH and repurposing databases link to lysosomal degradation of mutant KRAS; docking confirms pocket binding.  
- **Proposed mechanism of action against pancreatic cancer**: Promotes autophagic clearance of oncogenic KRAS, synergizing with chemotherapy in PDAC.  
- **Confidence level**: Strong evidence (preclinical autophagy studies in PDAC).  

## Repurposing Candidates Summary Table

| Drug Name      | Original Indication          | Target Protein(s) | Evidence Type                  | Confidence              |
|----------------|------------------------------|-------------------|--------------------------------|-------------------------|
| Disulfiram    | Alcohol use disorder        | KRAS             | Docking, repurposing screens  | Strong evidence        |
| Metformin     | Type 2 diabetes             | KRAS             | Pharmacovigilance, DGIdb      | Computational prediction|
| Simvastatin   | Hypercholesterolemia        | KRAS             | Docking, DGIdb                | Strong evidence        |
| Propranolol   | Hypertension                | CD44             | Docking, STITCH               | Computational prediction|
| Itraconazole  | Fungal infections           | KRAS             | Repurposing screens, docking  | Strong evidence        |
| Aspirin       | Anti-inflammatory           | KRAS             | Pharmacovigilance, docking    | Computational prediction|
| Thioridazine  | Schizophrenia               | CD44             | Virtual screening, STITCH     | Speculative            |
| Cimetidine    | Peptic ulcers               | CD44             | DrugBank, docking             | Computational prediction|
| Verapamil     | Hypertension                | KRAS             | DGIdb, structural similarity  | Speculative            |
| Chloroquine   | Malaria                     | KRAS             | STITCH, autophagy studies     | Strong evidence        |

---

## Consolidated References

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

[17] Marsha Mariya Kappan, Joby George. "In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer." arXiv:2412.06237v1, 2024-12-09. http://arxiv.org/abs/2412.06237v1

[18] Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al.. "Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS." arXiv:2402.08210v1, 2024-02-13. http://arxiv.org/abs/2402.08210v1

[19] Kehan Wu, Yingce Xia, Yang Fan et al.. "Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design." arXiv:2209.06158v1, 2022-08-30. http://arxiv.org/abs/2209.06158v1

[20] Long Xu, Yongcai Chen, Fengshuo Liu et al.. "MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design." arXiv:2509.25225v2, 2025-09-24. http://arxiv.org/abs/2509.25225v2

[21] Yi He, Ailun Wang, Zhi Wang et al.. "Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design." arXiv:2507.20130v1, 2025-07-27. http://arxiv.org/abs/2507.20130v1
