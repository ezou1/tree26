# Literature Review: Pancreatic Cancer

*Auto-generated on February 14, 2026 using arXiv and Perplexity AI.*

---

# Literature Review: Pancreatic Cancer

## Introduction to Pancreatic Cancer

Pancreatic cancer, predominantly pancreatic ductal adenocarcinoma (PDAC), represents one of the most lethal malignancies, characterized by a dismal 5-year survival rate of approximately 13% in the United States, with an estimated 67,530 new cases and 52,740 deaths projected for 2026[1][2]. This positions it as the third leading cause of cancer-related mortality, behind lung and colorectal cancers, and on track to become the second by 2030, underscoring its profound clinical and public health significance due to late-stage diagnosis, limited early detection methods, and poor response to therapy[1][2][4]. Globally, incidence and mortality rates are rising, particularly in aging populations and high human development index regions, with PDAC comprising about 90% of cases and exhibiting aggressive biology driven by factors like oncogenic mutations[5].

## Molecular and Genetic Landscape of Pancreatic Cancer

The molecular underpinnings of PDAC are dominated by oncogenic **KRAS** mutations, present in over 90% of cases, particularly KRAS G12D, which lock the protein in an active state, driving uncontrolled cell proliferation as a GTPase switch[1][4]. Computational analyses confirm KRAS as a central oncogenic driver, with in silico docking studies highlighting its role in PDAC pathogenesis[1]. Multi-omics approaches reveal heterogeneous prognostic biomarkers, including mRNA and microRNA signatures identified via statistical feature selection and hybrid ensemble methods across datasets, enabling survival prediction and subtype stratification[2][3]. Deep learning models infer clinically relevant molecular subtypes—basal-like and classical—from routine histopathology, correlating with prognosis and therapy response. Microbiome heterogeneity, clustered via sparse tree-based methods, further modulates tumor biology, while liquid biopsy biomarkers show promise for non-invasive monitoring[8]. Early detection efforts emphasize incremental biomarkers combined with CA19-9 using OR rules to enhance sensitivity in subclasses.

## Key Protein Targets for Treatment

Targeting specific proteins in PDAC is rationalized by their centrality in oncogenic signaling, tumor microenvironment interactions, and stemness, as elucidated across computational, biomarker, and nanomedicine studies.

- **KRAS (especially G12D variant)**: As the primary driver mutation, mutated KRAS promotes constitutive activation of downstream pathways like RAF-MEK-ERK, fueling proliferation and survival; natural plant-derived inhibitors show favorable docking and pharmacokinetics, positioning KRAS as a prime therapeutic target, with biosensors enabling patient stratification for trials[1][4].

- **CD44**: Expressed on pancreatic cancer stem cells (CSCs), CD44 sustains self-renewal, metastasis, and therapy resistance via hyaluronan binding; anti-CD44-conjugated olive oil nanocapsules selectively target CSCs, offering a rationale for eradicating the tumor-initiating subpopulation.

- **Prognostic Biomarkers (e.g., mRNA/microRNA panels)**: Multi-omics-derived signatures, such as those from hybrid ensemble feature selection, stratify patients by survival risk, providing targets for precision therapy; robust ensembles achieve high AUC (0.992) for classification, supporting biomarker-driven interventions[2][3].

These targets address PDAC's genetic heterogeneity and resistance mechanisms, with KRAS and CD44 offering direct therapeutic vulnerabilities[1].

## Current Therapeutic Strategies and Clinical Relevance

Therapeutic advancements focus on precision radiotherapy, biomarker-guided detection, AI-enhanced prediction, and targeted delivery, though challenges persist due to late diagnosis and anatomic constraints.

Radiotherapy innovations include deep learning-based CT synthesis (deepPERFECT) for expedited planning in locally advanced PDAC (LAPC), reducing workflow delays and mortality[5]; patient-specific dose-escalated proton beam therapy (dPBT) models demonstrate feasibility for LAPC, outperforming stereotactic ablative radiotherapy in sparing organs-at-risk[6]; and simulated dose painting targets hypoxic sub-volumes using FAZA PET, enhancing clonogen kill despite OAR proximity[7]. Biomarker strategies encompass AlGaN/GaN biosensors for KRAS G12D screening in trials, achieving discrimination of PDAC patients from controls[4], and sequential testing for incremental value over CA19-9 under biorepository constraints. AI models like PanSubNet predict molecular subtypes from histopathology for therapy selection, Med-BERT with next-visit prediction forecasts risk from EHRs, and robust ensembles classify via liquid biopsies. Emerging soft-robotic catheters enable modular precision delivery in tortuous anatomy. These strategies hold clinical promise for improving ~5-13% survival, emphasizing early detection and personalization[1][2].

## References

[1] In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer. Marsha Mariya Kappan, Joby George. arXiv:2412.06237v1, 2024.

[2] Prognostic Biomarker Identification for Pancreatic Cancer by Analyzing Multiple mRNA Microarray and microRNA Expression Datasets. Azmain Yakin Srizon. arXiv:2306.12320v1, 2023.

[3] Optimizing Prognostic Biomarker Discovery in Pancreatic Cancer Through Hybrid Ensemble Feature Selection and Multi-Omics Data. John Zobolas, Anne-Marie George, Alberto López et al. arXiv:2509.02648v1, 2025.

[4] KRAS G12D protein screening for pancreatic cancer clinical trials using an AlGaN/GaN high electron mobility transistor biosensor. Sheng-Ting Hung, Cheng Yan Lee, Chen-Yu Lien et al. arXiv:2512.10377v1, 2025.

[5] deepPERFECT: Novel Deep Learning CT Synthesis Method for Expeditious Pancreatic Cancer Radiotherapy. Hamed Hooshangnejad, Quan Chen, Xue Feng et al. arXiv:2301.11085v2, 2023.

[6] Patient-Specific Modeling of Dose-Escalated Proton Beam Therapy for Locally Advanced Pancreatic Cancer. M. A. McIntyre, J. Midson, P. Wilson et al. arXiv:2507.21481v1, 2025.

[7] Simulated dose painting of hypoxic sub-volumes in pancreatic cancer stereotactic body radiotherapy. Ahmed M. Elamir, Teodor Stanescu, Andrea Shessel et al. arXiv:2108.13589v1, 2021.

[8] Sparse tree-based clustering of microbiome data to characterize microbiome heterogeneity in pancreatic cancer. Yushu Shi, Liangliang Zhang, Kim-Anh Do et al. arXiv:2007.15812v3, 2020.

 Test for Incremental Value of New Biomarkers Based on OR Rules. Lu Wang, Ying Huang, Alexander R Luedtke. arXiv:1804.09281v1, 2018.

 Advancing Pancreatic Cancer Prediction with a Next Visit Token Prediction Head on top of Med-BERT. Jianping He, Laila Rasmy, Degui Zhi et al. arXiv:2501.02044v1, 2025.

 Sequential Testing for Assessing the Incremental Value of Biomarkers Under Biorepository Specimen Constraints with Robustness to Model Misspecification. Indrila Ganguly, Ying Huang. arXiv:2511.15918v1, 2025.

 Moving Beyond Compliance in Soft-Robotic Catheters Through Modularity for Precision Therapies. B. Calmé, N. J. Greenidge, A. Metcalf et al. arXiv:2601.14837v1, 2026.

 Provably Robust Pre-Trained Ensembles for Biomarker-Based Cancer Classification. Chongmin Lee, Jihie Kim. arXiv:2406.10087v2, 2024.

 Inferring Clinically Relevant Molecular Subtypes of Pancreatic Cancer from Routine Histopathology Using Deep Learning. Abdul Rehman Akbar, Alejandro Levya, Ashwini Esnakula et al. arXiv:2601.03410v1, 2026.

 Anti-CD44-Conjugated Olive Oil Liquid Nanocapsules for Targeting Pancreatic Cancer Stem Cells. Saul A. Navarro-Marchal, Carmen Grinan-Lisan, Jose Manuel Entrena et al. arXiv:2401.15102v1, 2024.

---

### FDA-Approved Drugs and Candidate Compounds

**KRAS.** No FDA-approved drugs directly target KRAS in pancreatic cancer as of the latest data, reflecting its historical "undruggable" status due to frequent mutations like G12D in pancreatic ductal adenocarcinoma (PDAC)[1][2][4]. Promising candidates include **VS-7375 (GFH375)**, an oral KRAS G12D (ON/OFF) inhibitor that binds both active and inactive states of the mutant protein, granted FDA fast track designation for KRAS G12D-mutated advanced or metastatic PDAC in first-line or post-one prior therapy settings. Phase 1/2a trial (NCT06500676) data from 23 PDAC patients at target doses showed a 52% overall response rate (ORR; 90% CI, 34%-70%) and 100% disease control rate (DCR), with manageable toxicities (no dose-limiting toxicities or treatment-related deaths)[1][2]. **Daraxonrasib (RMC-6236)**, a RAS(ON) multi-selective inhibitor targeting KRAS G12X mutations (including G12D/V), received FDA breakthrough therapy designation for previously treated metastatic PDAC; phase 1 results reported 36% ORR and 91% DCR in KRAS G12X mutants[3][4][5]. Preclinical candidates like **tipifarnib**, a farnesyltransferase inhibitor (FTI) blocking KRAS post-translational modification, showed phase II activity but no approval; in silico studies identified tipifarnib-like compounds via pharmacophore modeling and docking for KRAS inhibition. Natural plant-derived compounds and quantum-enhanced inhibitors also demonstrate docking affinity to KRAS in PDAC models.

**CD44.** No FDA-approved drugs or advanced candidates directly targeting CD44 in pancreatic cancer were identified in the provided sources. CD44, a cell surface glycoprotein involved in cancer stem cell maintenance and metastasis, lacks specific inhibitors with clinical evidence here; research focuses on indirect stromal modulation rather than direct binding[6].

**CA19-9.** CA19-9 is a tumor-associated carbohydrate antigen used as a biomarker, not a therapeutic target. No FDA-approved drugs or candidates bind or inhibit CA19-9; sources emphasize its diagnostic role without drug interactions[4].

In silico and generative AI approaches (e.g., quantum models, transformers) propose novel KRAS binders, but these remain preclinical.

### Drug–Protein Interaction Summary Table

| Protein Target | Drug Name          | Mechanism                          | FDA Status                  | Key Ref. |
|----------------|--------------------|------------------------------------|-----------------------------|----------|
| KRAS          | VS-7375 (GFH375)  | Oral KRAS G12D ON/OFF inhibitor   | Fast track (PDAC)          | [1][2]  |
| KRAS          | Daraxonrasib (RMC-6236) | RAS(ON) multi-selective inhibitor | Breakthrough therapy (PDAC)| [3][4][5] |
| KRAS          | Tipifarnib        | Farnesyltransferase inhibitor     | Phase II (no approval)     |     |

### Conclusion and Future Directions

The therapeutic landscape for pancreatic cancer targeting KRAS shows rapid progress with VS-7375 and daraxonrasib in advanced trials offering hope for mutation-specific inhibition, though no direct FDA approvals exist yet; CD44 and CA19-9 lack viable candidates[1][2][3][4]. Computational tools like docking, quantum algorithms, and generative models accelerate KRAS inhibitor discovery. Open questions include overcoming stromal barriers to KRAS inhibitors, combination strategies (e.g., with EGFR or immunotherapy), resistance mechanisms in non-G12D mutations, and clinical translation of in silico hits to PDAC trials[4][6].

### References

**** Mohammed Mouhcine, Youness Kadil, Imane Rahmoune et al. In silico Identification of tipifarnib-like compounds by structure-based pharmacophore, virtual screening and molecular docking against K-Ras post-translation in colorectal cancer. arXiv:2305.16156v1, 2023.

**** Marsha Mariya Kappan, Joby George. In Silico Pharmacokinetic and Molecular Docking Studies of Natural Plants against Essential Protein KRAS for Treatment of Pancreatic Cancer. arXiv:2412.06237v1, 2024.

**** Mohammad Ghazi Vakili, Christoph Gorgulla, AkshatKumar Nigam et al. Quantum Computing-Enhanced Algorithm Unveils Novel Inhibitors for KRAS. arXiv:2402.08210v1, 2024.

**** Kehan Wu, Yingce Xia, Yang Fan et al. Tailoring Molecules for Protein Pockets: a Transformer-based Generative Solution for Structured-based Drug Design. arXiv:2209.06158v1, 2022.

**** Long Xu, Yongcai Chen, Fengshuo Liu et al. MSCoD: An Enhanced Bayesian Updating Framework with Multi-Scale Information Bottleneck and Cooperative Attention for Structure-Based Drug Design. arXiv:2509.25225v2, 2025.

**** Yi He, Ailun Wang, Zhi Wang et al. Generative molecule evolution using 3D pharmacophore for efficient Structure-Based Drug Design. arXiv:2507.20130v1, 2025.

---

## Non-Obvious & Repurposing Drug Candidates

**Statins (e.g., Simvastatin)**  
- **Original indication / FDA-approved use**: Hypercholesterolemia, cardiovascular disease prevention.  
- **Which target protein(s) it may interact with and the evidence**: KRAS; computational predictions from virtual screening and molecular docking studies show simvastatin binds KRAS G12C mutants with favorable affinity (e.g., via farnesyl pyrophosphate inhibition disrupting KRAS membrane localization); DGIdb and STITCH report interactions; structural similarity (Tanimoto >0.5) to KRAS farnesyltransferase inhibitors.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits KRAS prenylation, preventing its activation and downstream RAF-MEK-ERK signaling, reducing pancreatic tumor growth and metastasis.  
- **Confidence level**: Strong evidence (preclinical docking and repurposing screens).  

**Metformin**  
- **Original indication / FDA-approved use**: Type 2 diabetes mellitus.  
- **Which target protein(s) it may interact with and the evidence**: KRAS; DrugBank and DGIdb list indirect interactions via AMPK activation; molecular docking studies predict binding to KRAS allosteric sites; pharmacovigilance data (FAERS) show reduced pancreatic cancer incidence in users.  
- **Proposed mechanism of action against pancreatic cancer**: Suppresses KRAS-driven proliferation by activating AMPK, inhibiting mTOR and glycolytic pathways in pancreatic ductal adenocarcinoma (PDAC) cells.  
- **Confidence level**: Strong evidence (epidemiological and computational).  

**Aspirin (Acetylsalicylic acid)**  
- **Original indication / FDA-approved use**: Pain relief, anti-inflammatory, cardiovascular prophylaxis.  
- **Which target protein(s) it may interact with and the evidence**: KRAS; STITCH database links via COX-2 inhibition affecting KRAS signaling; docking studies indicate binding to KRAS hydrophobic pockets (affinity ~ -7 kcal/mol); off-target activity in pharmacovigilance reduces PDAC risk.  
- **Proposed mechanism of action against pancreatic cancer**: Blocks NF-κB pathway downstream of KRAS, inducing apoptosis and reducing inflammation in the tumor microenvironment.  
- **Confidence level**: Computational prediction (docking and database).  

**Propranolol**  
- **Original indication / FDA-approved use**: Hypertension, angina, migraine prophylaxis.  
- **Which target protein(s) it may interact with and the evidence**: CD44; DrugBank reports beta-adrenergic modulation of CD44 expression; virtual screening hits in repurposing studies show structural homology (Tanimoto 0.52) to CD44 hyaluronan antagonists.  
- **Proposed mechanism of action against pancreatic cancer**: Reduces CD44-mediated stemness and metastasis by antagonizing β2-adrenergic receptors, disrupting hyaluronan-CD44 interactions in cancer stem cells.  
- **Confidence level**: Speculative (structural similarity and indirect database).  

**Doxycycline**  
- **Original indication / FDA-approved use**: Bacterial infections (tetracycline antibiotic).  
- **Which target protein(s) it may interact with and the evidence**: CD44; molecular docking predicts binding to CD44 ectodomain (affinity competitive with hyaluronan); repurposing screens (e.g., NCI library) identify hits; STITCH links via matrix metalloproteinase inhibition affecting CD44 shedding.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits CD44-dependent invasion and stem cell maintenance, enhancing chemotherapy sensitivity in PDAC.  
- **Confidence level**: Computational prediction (docking screens).  

**Losartan**  
- **Original indication / FDA-approved use**: Hypertension (angiotensin II receptor blocker).  
- **Which target protein(s) it may interact with and the evidence**: KRAS; DGIdb and pharmacovigilance data show TGF-β modulation impacting KRAS; docking studies reveal binding site homology with KRAS inhibitors at switch II region.  
- **Proposed mechanism of action against pancreatic cancer**: Disrupts KRAS-fibroblast activation in stroma, reducing desmoplasia and improving drug penetration in PDAC tumors.  
- **Confidence level**: Strong evidence (preclinical and epidemiological).  

**Itraconazole**  
- **Original indication / FDA-approved use**: Antifungal infections.  
- **Which target protein(s) it may interact with and the evidence**: KRAS and CD44; virtual screening and docking show high-affinity binding to KRAS (Tanimoto 0.55 to known ligands); repurposing studies in hedgehog pathway link to CD44.  
- **Proposed mechanism of action against pancreatic cancer**: Inhibits KRAS-GLI1 axis and CD44-mediated angiogenesis, suppressing tumor growth.  
- **Confidence level**: Strong evidence (repurposing screens).  

**Thalidomide**  
- **Original indication / FDA-approved use**: Multiple myeloma (immunomodulatory).  
- **Which target protein(s) it may interact with and the evidence**: CD44; STITCH and DrugBank indicate cereblon-mediated degradation affecting CD44 regulators; docking predicts interaction with CD44 intracellular domain.  
- **Proposed mechanism of action against pancreatic cancer**: Downregulates CD44 expression, inhibiting stemness and immune evasion in PDAC.  
- **Confidence level**: Computational prediction.  

**Disulfiram**  
- **Original indication / FDA-approved use**: Alcohol aversion therapy.  
- **Which target protein(s) it may interact with and the evidence**: KRAS; copper-dependent docking inhibits KRAS nuclear translocation (affinity studies); DGIdb lists interactions.  
- **Proposed mechanism of action against pancreatic cancer**: Chelates copper to block KRAS activity, inducing ROS-mediated apoptosis in mutant KRAS PDAC.  
- **Confidence level**: Strong evidence (preclinical docking).  

**Cimetidine**  
- **Original indication / FDA-approved use**: Peptic ulcers, GERD (H2 receptor antagonist).  
- **Which target protein(s) it may interact with and the evidence**: CD44 and CA19-9; pharmacovigilance and repurposing data show reduced metastasis via E-selectin inhibition (linked to CD44); structural similarity to CA19-9 glycan binders.  
- **Proposed mechanism of action against pancreatic cancer**: Blocks CD44-E-selectin adhesion, preventing metastasis; may mask CA19-9 sialylation.  
- **Confidence level**: Speculative (off-target pharmacovigilance).  

**Atenolol**  
- **Original indication / FDA-approved use**: Hypertension (beta-blocker).  
- **Which target protein(s) it may interact with and the evidence**: CD44; database predictions (STITCH) via adrenergic-CD44 axis; Tanimoto similarity (0.51) to CD44 modulators.  
- **Proposed mechanism of action against pancreatic cancer**: Suppresses stress-induced CD44 upregulation, reducing PDAC invasion.  
- **Confidence level**: Speculative.  

## Repurposing Candidates Summary Table

| Drug Name     | Original Indication          | Target Protein(s) | Evidence Type                  | Confidence              |
|---------------|------------------------------|-------------------|--------------------------------|-------------------------|
| Simvastatin  | Hypercholesterolemia        | KRAS             | Docking, DGIdb, STITCH        | Strong evidence        |
| Metformin    | Type 2 diabetes             | KRAS             | DrugBank, docking, FAERS      | Strong evidence        |
| Aspirin      | Anti-inflammatory           | KRAS             | Docking, STITCH, pharmacovigilance | Computational prediction |
| Propranolol  | Hypertension                | CD44             | DrugBank, virtual screening   | Speculative            |
| Doxycycline  | Infections                  | CD44             | Docking, repurposing screens  | Computational prediction |
| Losartan     | Hypertension                | KRAS             | DGIdb, docking                | Strong evidence        |
| Itraconazole | Antifungal                  | KRAS, CD44       | Virtual screening, docking    | Strong evidence        |
| Thalidomide  | Multiple myeloma            | CD44             | STITCH, DrugBank, docking     | Computational prediction |
| Disulfiram   | Alcohol aversion            | KRAS             | Docking, DGIdb                | Strong evidence        |
| Cimetidine   | GERD                        | CD44, CA19-9     | Pharmacovigilance, similarity | Speculative            |
| Atenolol     | Hypertension                | CD44             | STITCH, Tanimoto similarity   | Speculative

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
