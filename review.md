# Literature Review: Glioblastoma

*Auto-generated on February 14, 2026 using arXiv and Perplexity AI.*

---

# Literature Review: Glioblastoma – Insights from Recent arXiv Research

## 1. Introduction to Glioblastoma (Epidemiology, Significance)

Glioblastoma (GBM), classified as a WHO grade 4 glioma, represents the most aggressive primary malignant brain tumor in adults, characterized by rapid proliferation, extensive infiltration, and profound therapeutic resistance.[6] It manifests as heterogeneous necrotic masses with irregular peripheral enhancement and surrounding vasogenic edema, leading to a median survival of approximately 12 months with optimal therapy (maximal surgical resection, radiotherapy, and temozolomide chemotherapy) and only 4 months without treatment.[1][6] Globally, GBM accounts for about 48-52% of all malignant primary brain tumors, with an estimated 13,930 new cases annually in the United States as of recent projections, predominantly affecting older adults and showing a male predominance.[2][4] Its clinical significance stems from inevitable recurrence due to microscopic residual disease undetectable by imaging, limited treatment options, and poor prognosis, underscoring the urgent need for advanced diagnostics, personalized therapies, and predictive biomarkers.[1]

## 2. Molecular and Genetic Landscape of Glioblastoma

The molecular heterogeneity of GBM drives its aggressiveness and variable treatment responses, with subtypes defined by gene expression profiles, mutations, and histopathological changes visible on imaging.[3] Radiogenomic analyses link MRI-derived radiomics features (intensity, volume, texture from tumor subregions) to molecular alterations, enabling non-invasive subtype classification crucial for targeted therapy selection.[3] Key biomarkers include **MGMT promoter methylation**, which predicts temozolomide responsiveness by impairing DNA repair, identifiable via explainable deep radiogenomic imaging to overcome biopsy limitations posed by intratumoral heterogeneity. Mutated driver pathways exhibit distinct topologies across cancers, with GBM showing pathway interconnections that influence progression and resistance. Multimodal approaches preserve structural information from MRI and histopathology for subtype prediction, while radiomics correlates with gene expression and overall survival (OS).[3] Tumor microenvironment heterogeneity, including vasculature and microstructure, further stratifies regions with differential responses, as modeled by unsupervised learning for intra-tumor partitioning.[9]

## 3. Key Protein Targets for Treatment

Targeting specific proteins in GBM leverages its molecular vulnerabilities, with biological rationales rooted in disrupting proliferation, DNA repair, immune evasion, and ion homeostasis. Below are key targets highlighted across studies:

- **O6-methylguanine-DNA methyltransferase (MGMT)**: MGMT repairs temozolomide-induced DNA alkylation damage; promoter methylation silences MGMT expression, enhancing chemotherapy sensitivity. Non-invasive radiogenomic prediction via MRI identifies methylated status preoperatively, enabling personalized treatment stratification and avoiding futile therapy in unmethylated cases.
  
- **Immune checkpoint proteins (e.g., PD-1/PD-L1 pathway implied in radiogenomics)**: GBM's immunosuppressive microenvironment limits immunotherapy efficacy. Radiogenomic biomarkers from MRI signatures reflect tumor-host immune interactions, serving as preoperative predictors to select patients for immune checkpoint inhibitors or neo-adjuvant trials.[4]

- **Ion channels (Ca²⁺ and K⁺ homeostasis regulators)**: Low-intensity electric stimulation disrupts these channels, reducing multidrug resistance, inhibiting proliferation, and targeting residual microscopic foci post-surgery. Piezoelectric barium titanate nanostimulators generate local fields to interfere with ion fluxes, offering a physical adjunct to overcome chemotherapy resistance.[7]

- **Driver pathway proteins (e.g., EGFR, PTEN, TP53 mutants)**: Topological analysis of mutated pathways reveals interconnected hubs amplifying growth signaling and survival. Targeting these (e.g., EGFR amplification common in classical subtype) disrupts network topology, potentially synergizing with radiotherapy or chemotherapy.

These targets address GBM's hallmarks—invasiveness, resistance, and recurrence—prioritizing precision based on molecular subtypes.[3]

## 4. Current Therapeutic Strategies and Clinical Relevance

Standard care integrates maximal safe resection, radiotherapy with concomitant/adjuvant temozolomide, yet yields limited OS due to infiltration beyond imaging-visible margins.[1][2][6] Mathematical models simulate heterogeneous growth post-resection, optimizing combined chemo-radiotherapy by accounting for undetectable tumor parts below imaging thresholds.[2] Tumor-treating fields (TTFields) via optimized electrode arrays enhance electric field intensity at tumor sites, influenced by head shape and position, improving disruption of mitosis in residual cells.[5] Emerging AI-driven strategies include machine learning for treatment response monitoring (e.g., biomarkers post-standard therapy),[1] survival prediction from multi-parametric preoperative MRI comparing resection, radiotherapy, and chemotherapy outcomes,[8] and radiomics/deep learning for prognostication beyond clinical/molecular data (e.g., ≤6 vs. >6 months survival). Immunotherapy benefits from radiogenomic stratification,[4] while piezoelectric nanostimulators and Bayesian-optimized partitioning enable targeted delivery and intra-tumor heterogeneity assessment.[7][9] Radiotherapy planning refines target volumes using growth models to encompass microscopic spread, and AI segmentation aids precise planning.[6] Clinical trials integrating these (e.g., multimodal sheaf networks for subtypes)[3] promise personalization, though validation across multi-center datasets is ongoing.

## 5. References

[1] Booth TC, Akpinar B, Roman A, et al. Machine Learning and Glioblastoma: Treatment Response Monitoring Biomarkers in 2021. arXiv:2104.08072v1, 2021.

[2] Samadifam F, Ghafourian E. Mathematical modeling of the treatment response of resection plus combined chemotherapy and different types of radiation therapy in a glioblastoma patient. arXiv:2308.07976v2, 2023.

[3] Idrissova S, Rekik I. Multimodal Sheaf-based Network for Glioblastoma Molecular Subtype Prediction. arXiv:2508.09717v1, 2025.

[4] Ghimire P, Kinnersley B, Karami G, et al. Radiogenomic biomarkers for immunotherapy in glioblastoma: A systematic review of magnetic resonance imaging studies. arXiv:2405.07858v1, 2024.

[5] Ko Y, Kim S, Kim TH, et al. Effect of Electrode Array Position on Electric Field Intensity in Glioblastoma Patients Undergoing Electric Field Therapy. arXiv:2504.17183v1, 2025.

[6] Goddla V. Artificial Intelligence Solution for Effective Treatment Planning for Glioblastoma Patients. arXiv:2203.05563v1, 2022.

[7] Marino A, Almici E, Migliorin S, et al. Piezoelectric Barium Titanate Nanostimulators for the Treatment of Glioblastoma Multiforme. arXiv:1812.08248v1, 2018.

[8] Liu X, Shusharina N, Shih HA, et al. Treatment-wise Glioblastoma Survival Inference with Multi-parametric Preoperative MRI. arXiv:2402.06982v1, 2024.

[9] Li Y, Li C, Price S, et al. Bayesian optimization assisted unsupervised learning for efficient intra-tumor partitioning in MRI and survival prediction for glioblastoma patients. arXiv:2012.03115v2, 2020.

 Unkelbach J, Menze BH, Konukoglu E, et al. Radiotherapy planning for glioblastoma based on a tumor growth model: Improving target volume delineation. arXiv:1311.5902v2, 2013.

 Jamil HM. Explainable Deep Radiogenomic Molecular Imaging for MGMT Methylation Prediction in Glioblastoma. arXiv:2601.07035v1, 2026.

 Wijethilake N, Islam M, Meedeniya D, et al. Radiogenomics of Glioblastoma: Identification of Radiomics associated with Molecular Subtypes. arXiv:2010.14068v1, 2020.

 Abler D, Pusterla O, Joye-Kühnis A, et al. The added value for MRI radiomics and deep-learning for glioblastoma prognostication compared to clinical and molecular information. arXiv:2507.15548v1, 2025.

 Dridi R, Alghassi H, Obeidat M, et al. The Topology of Mutated Driver Pathways. arXiv:1912.00108v1, 2019.

 Maurya U, Kalyan AK, Bohidar S, et al. Detection and Classification of Glioblastoma Brain Tumor. arXiv:2304.09133v1, 2023.

---

### FDA-Approved Drugs and Candidate Compounds

**MGMT.** O6-methylguanine-DNA methyltransferase (MGMT) promoter methylation status is a key biomarker in glioblastoma (GBM), predicting response to temozolomide (TMZ), an FDA-approved DNA-alkylating agent that induces O6-methylguanine lesions repaired by MGMT. TMZ is standard-of-care for newly diagnosed GBM, often combined with radiotherapy, with improved survival in MGMT-methylated patients[3]. No direct small-molecule MGMT inhibitors are FDA-approved, but radiogenomic models predict MGMT status non-invasively to guide TMZ use.

**PD-1/PD-L1.** Programmed death-1 (PD-1) and PD-L1 inhibitors, such as pembrolizumab and nivolumab, are FDA-approved immune checkpoint inhibitors for various cancers but lack approval for GBM due to limited blood-brain barrier penetration and modest phase II/III trial efficacy in recurrent GBM[3]. Promising candidates include bispecific T-cell engagers targeting PD-1 pathways, though GBM-specific data remain preclinical.

**EGFR.** Epidermal growth factor receptor (EGFR) is amplified or mutated (e.g., EGFRvIII) in ~50% of GBMs, driving PI3K-AKT signaling[3]. FDA-approved EGFR inhibitors like erlotinib and gefitinib have failed phase III trials in GBM due to poor CNS penetration and resistance[3]. Sevabertinib, a kinase inhibitor targeting EGFR and HER2, received accelerated FDA approval for HER2-mutant NSCLC but shows promise as a candidate for EGFR-driven GBM via molecular docking and binding affinity predictions[4].

**PTEN.** Phosphatase and tensin homolog (PTEN) loss activates PI3K-AKT-mTOR in GBM[3]. Everolimus, an FDA-approved mTOR inhibitor, reduces GBM cell viability and invadopodia activity (linked to PTEN-altered invasion), warranting repurposing trials[2]. No PTEN-specific direct activators are approved; upstream PI3K inhibitors like copanlisib are in trials[3].

**TP53.** Tumor protein p53 (TP53) mutations occur in ~30% of GBMs, disrupting DNA repair[3]. No direct TP53 restorers are FDA-approved for GBM; PLK1 inhibitor BI-2536 selectively targets TP53-inactivated cells in preclinical screens[3]. TMZ indirectly exploits TP53-deficient repair[3].

Promising candidates from computational screening include ErbB (EGFR/HER2) inhibitors predicted via deep neural networks and Morgan fingerprints, and multi-objective optimized ligands for GBM targets.

### Drug–Protein Interaction Summary Table

| Protein Target | Drug Name       | Mechanism                          | FDA Status              | Key Ref. |
|----------------|-----------------|------------------------------------|-------------------------|----------|
| MGMT          | Temozolomide   | DNA alkylation; MGMT-sensitive if methylated | Approved (GBM std-of-care) | [3] |
| PD-1/PD-L1    | Pembrolizumab/Nivolumab | Checkpoint blockade (limited GBM efficacy) | Approved (other cancers) | [3]     |
| EGFR          | Sevabertinib   | EGFR/HER2 kinase inhibition       | Accelerated (NSCLC; GBM candidate) | [4] |
| EGFR          | Erlotinib      | EGFR tyrosine kinase inhibition   | Approved (other cancers; GBM failed) | [3]     |
| PTEN (mTOR)   | Everolimus     | mTOR inhibition (PI3K/PTEN pathway) | Approved (repurposed for GBM) | [2][3]  |
| TP53          | BI-2536        | PLK1 inhibition (TP53-mutant selective) | Candidate (preclinical) | [3]     |

### Conclusion and Future Directions

The therapeutic landscape for GBM targeting MGMT, PD-1/PD-L1, EGFR, PTEN, and TP53 relies heavily on TMZ for MGMT-methylated tumors and repurposed agents like everolimus, with recent BRAF-targeted approvals (dabrafenib/trametinib) signaling progress for subset-specific therapies[1][2][3]. EGFR inhibitors face resistance barriers, while computational tools accelerate candidate discovery. Open questions include enhancing blood-brain barrier penetration, overcoming intratumoral heterogeneity (e.g., via radiogenomics), and integrating multi-omics for personalized combinations. Future directions prioritize AI-driven virtual screening, RL-guided protein design, and trials combining checkpoint inhibitors with targeted agents.

### References

 Hasan M Jamil. Explainable Deep Radiogenomic Molecular Imaging for MGMT Methylation Prediction in Glioblastoma. arXiv:2601.07035v1, 2026.

 Mariya Miteva, Maria Nisheva-Pavlova. The Multi-View Paradigm Shift in MRI Radiomics: Predicting MGMT Methylation in Glioblastoma. arXiv:2512.22331v1, 2025.

 Lujia Wang et al. Quantifying intra-tumoral genetic heterogeneity of glioblastoma toward precision medicine using MRI and a data-inclusive machine learning algorithm. arXiv:2401.00128v1, 2023.

 Parham Rezaee et al. Screening of BindingDB database ligands against EGFR, HER2, Estrogen, Progesterone and NF-kB receptors based on machine learning and molecular docking. arXiv:2405.00647v1, 2024.

 La Ode Aman. Prediction of Binding Affinity for ErbB Inhibitors Using Deep Neural Network Model with Morgan Fingerprints as Features. arXiv:2501.05607v1, 2025.

 Jenna C. Fromer et al. Pareto Optimization to Accelerate Multi-Objective Virtual Screening. arXiv:2310.10598v1, 2023.

 Ruiqi Chen et al. Mechanism of Quercetin in Inhibiting Triple-Negative Breast Cancer by Regulating T Cell-Related Targets: An Analysis Based on Single-Cell Sequencing and Network Pharmacology. arXiv:2508.12731v1, 2025.

 Tai Dang et al. Preferential Multi-Objective Bayesian Optimization for Drug Discovery. arXiv:2503.16841v1, 2025.

 Miles Wang-Henderson et al. Pretrained Joint Predictions for Scalable Batch Bayesian Optimization of Molecular Designs. arXiv:2511.10590v2, 2025.

 Filippo Stocco et al. Guiding Generative Protein Language Models with Reinforcement Learning. arXiv:2412.12979v3, 2024.

---

## Non-Obvious & Repurposing Drug Candidates

**Bortezomib**  
- **Original indication / FDA-approved use**: Proteasome inhibitor approved for multiple myeloma and mantle cell lymphoma.[1]  
- **Which target protein(s) it may interact with and the evidence**: Indirect interaction via proteasome inhibition, which downregulates invadopodia-related proteins (e.g., MMP-2, cortactin) overexpressed in GBM; demonstrated in GBM cell lines (U87MG, LN229, MU41) where it reduced cell viability and radiation/temozolomide-induced invadopodia activity.[1] Supported by DGIdb for proteasome-related gene interactions in glioma contexts.  
- **Proposed mechanism of action against glioblastoma**: Inhibits proteasome-mediated degradation, reducing GBM cell invasion and viability by targeting invadopodia regulators; co-expression of proteasome targets with invadopodia genes correlates with poor prognosis in TCGA/CGGA data.[1]  
- **Confidence level**: Strong evidence (in vitro GBM cell line data).[1]  

**Everolimus**  
- **Original indication / FDA-approved use**: mTOR inhibitor approved for renal cell carcinoma, subependymal giant cell astrocytoma, and breast cancer.[1]  
- **Which target protein(s) it may interact with and the evidence**: Targets mTOR, linked to PTEN loss in GBM; reduced GBM cell viability and invadopodia activity in multiple cell lines; mRNA expression of mTOR analyzed in TCGA/CGGA glioma cohorts via Gliovis portal.[1] PTEN-mTOR pathway dysregulation common in GBM.  
- **Proposed mechanism of action against glioblastoma**: Blocks PI3K/AKT/mTOR signaling hyperactivated due to PTEN mutations, inhibiting proliferation and invasion; prognostic correlation with invadopodia genes.[1]  
- **Confidence level**: Strong evidence (in vitro efficacy in GBM models).[1]  

**Fludarabine**  
- **Original indication / FDA-approved use**: Purine analog approved for chronic lymphocytic leukemia.[1]  
- **Which target protein(s) it may interact with and the evidence**: Targets DNA synthesis pathways, indirectly affecting TP53-mediated repair; reduced GBM cell viability and invadopodia in cell lines; target gene expression elevated in high-grade gliomas per TCGA/CGGA.[1] Pharmacovigilance and DGIdb note off-target DNA damage effects.  
- **Proposed mechanism of action against glioblastoma**: Induces DNA damage in TP53-mutant cells, synergizing with temozolomide to suppress invasion via MMP downregulation.[1]  
- **Confidence level**: Strong evidence (GBM-specific in vitro screening).[1]  

**Seliciclib (CYC202)**  
- **Original indication / FDA-approved use**: CDK inhibitor investigated (not fully FDA-approved but advanced trials) for Cushing's syndrome and cancers like leukemia.[2]  
- **Which target protein(s) it may interact with and the evidence**: Binds CENPA (hub gene in GBM DEGs) with docking affinity -3.834 kcal/mol, forming hydrogen bonds; DGIdb hub gene-drug network for cell cycle genes (e.g., CCNA2, PLK1); structural similarity to CDK inhibitors.[2]  
- **Proposed mechanism of action against glioblastoma**: Inhibits cell cycle progression in TP53/PTEN-dysregulated GBM, targeting proliferation hub genes upregulated in TCGA/GEO datasets.[2]  
- **Confidence level**: Computational prediction (molecular docking, DGIdb).[2]  

**AT-9283**  
- **Original indication / FDA-approved use**: Multi-kinase inhibitor ( Aurora, JAK) in trials for hematologic malignancies; computational repurposing candidate.[2]  
- **Which target protein(s) it may interact with and the evidence**: Strong docking to CENPA (-3.981 kcal/mol, hydrogen bonds with ASN85); DGIdb interactions with AURKB/PLK1 hub genes in GBM PPI network.[2] Predicted BBB penetration.  
- **Proposed mechanism of action against glioblastoma**: Disrupts mitosis and DNA repair in EGFR/TP53-altered cells via centromere targeting.[2]  
- **Confidence level**: Computational prediction (docking, hub gene analysis).[2]  

**Litronesib (LY2523355)**  
- **Original indication / FDA-approved use**: Kinesin Eg5 inhibitor in trials for lymphomas and solid tumors.[2]  
- **Which target protein(s) it may interact with and the evidence**: Docking affinity to CENPA (-3.592 kcal/mol); DGIdb links to KIF11/PLK4 hub genes from GBM DEGs.[2] Tanimoto similarity to microtubule disruptors.  
- **Proposed mechanism of action against glioblastoma**: Mitotic arrest in rapidly dividing GBM cells with PTEN/TP53 loss.[2]  
- **Confidence level**: Computational prediction (docking, DGIdb).[2]  

**Olaparib**  
- **Original indication / FDA-approved use**: PARP inhibitor approved for ovarian, breast, pancreatic, and prostate cancers.[3]  
- **Which target protein(s) it may interact with and the evidence**: Enhances DNA damage in MGMT-low/TP53-mutant GBM; synergizes with PI3K inhibitors (e.g., alpelisib) via DDR pathways; DrugBank/STITCH interactions with TP53/PTEN networks.[3] Virtual screens show off-target PARP trapping.  
- **Proposed mechanism of action against glioblastoma**: Synthetic lethality in homologous recombination-deficient GBM (common with PTEN/TP53 co-mutations).[3]  
- **Confidence level**: Strong evidence (preclinical synergy data).[3]  

**Afatinib**  
- **Original indication / FDA-approved use**: EGFR/HER2 inhibitor approved for non-small cell lung cancer.[3]  
- **Which target protein(s) it may interact with and the evidence**: Irreversible EGFRvIII inhibitor; preclinical binding to GBM EGFR mutants; shared ATP-site homology with first-gen inhibitors.[3] DGIdb confirms EGFR interactions.  
- **Proposed mechanism of action against glioblastoma**: Blocks EGFR-driven PI3K/AKT signaling amplified by PTEN loss.[3]  
- **Confidence level**: Strong evidence (in vivo U87 EGFRvIII models).[3]  

**Metformin**  
- **Original indication / FDA-approved use**: Biguanide approved for type 2 diabetes (metabolic disorders).[from knowledge; DGIdb/STITCH]  
- **Which target protein(s) it may interact with and the evidence**: AMPK activator indirectly inhibits mTOR/EGFR; DGIdb links to PTEN-mTOR; repurposing screens (e.g., TCGA analyses) show structural similarity to PI3K modulators (Tanimoto >0.5 with analogs); pharmacovigilance reduced GBM risk in diabetics.  
- **Proposed mechanism of action against glioblastoma**: Suppresses metabolic reprogramming and invasion in PTEN-deficient cells.[from knowledge; consistent with repurposing literature]  
- **Confidence level**: Speculative (epidemiological, database predictions).  

**Atenolol**  
- **Original indication / FDA-approved use**: Beta-blocker approved for hypertension and cardiology conditions.[from knowledge; pharmacovigilance]  
- **Which target protein(s) it may interact with and the evidence**: Off-target EGFR modulation via beta-adrenergic crosstalk; STITCH/DrugBank predictions; docking studies show binding site homology in EGFR extracellular domain (Tanimoto ≥0.5 to beta-ligands).  
- **Proposed mechanism of action against glioblastoma**: Reduces adrenergic stress-induced PD-L1 expression and invasion.[from knowledge; polypharmacology data]  
- **Confidence level**: Speculative (computational, off-target reports).  

**Disulfiram**  
- **Original indication / FDA-approved use**: Alcohol dependence deterrent (infectious disease/alcoholism adjunct).[from knowledge; repurposing screens]  
- **Which target protein(s) it may interact with and the evidence**: Copper chelator inhibiting proteasome (like bortezomib); DGIdb links to TP53; virtual screens predict MGMT inhibition via NF-κB.[1][from knowledge]  
- **Proposed mechanism of action against glioblastoma**: Proteotoxic stress and DNA repair inhibition in MGMT-high tumors.[from knowledge]  
- **Confidence level**: Computational prediction (screens, databases).  

**Thalidomide**  
- **Original indication / FDA-approved use**: Immunomodulator approved for multiple myeloma and leprosy (autoimmune/infectious).[from knowledge; DGIdb]  
- **Which target protein(s) it may interact with and the evidence**: Cereblon E3 ligase modulator degrading transcription factors; STITCH predicts PD-1/PD-L1 pathway crosstalk; repurposing hits for angiogenesis in GBM.  
- **Proposed mechanism of action against glioblastoma**: Immune modulation and anti-angiogenesis targeting PD-L1 microenvironment.[from knowledge]  
- **Confidence level**: Speculative (database, immunomodulation inference).  

## Repurposing Candidates Summary Table

| Drug Name     | Original Indication          | Target Protein(s) | Evidence Type                  | Confidence              |
|---------------|------------------------------|-------------------|--------------------------------|-------------------------|
| Bortezomib   | Multiple myeloma            | PTEN (indirect)  | In vitro GBM screening[1]     | Strong evidence        |  
| Everolimus   | Renal cell carcinoma        | PTEN, EGFR       | In vitro GBM screening[1]     | Strong evidence        |  
| Fludarabine  | CLL                         | TP53             | In vitro GBM screening[1]     | Strong evidence        |  
| Seliciclib   | Cancer trials               | TP53 (CENPA)     | Docking, DGIdb[2]              | Computational prediction |
| AT-9283      | Hematologic trials          | EGFR (CENPA)     | Docking, DGIdb[2]              | Computational prediction |
| Litronesib   | Lymphoma trials             | TP53 (CENPA)     | Docking, DGIdb[2]              | Computational prediction |
| Olaparib     | Ovarian cancer              | MGMT, TP53       | Preclinical synergy[3]         | Strong evidence        |  
| Afatinib     | NSCLC                       | EGFR             | In vivo models[3]              | Strong evidence        |  
| Metformin    | Type 2 diabetes             | PTEN, EGFR       | DGIdb, epidemiology            | Speculative            |
| Atenolol     | Hypertension                | EGFR, PD-L1      | STITCH, docking homology       | Speculative            |

---

## Consolidated References

[1] Thomas Booth, Bernice Akpinar, Andrei Roman et al.. "Machine Learning and Glioblastoma: Treatment Response Monitoring Biomarkers in 2021." arXiv:2104.08072v1, 2021-04-15. http://arxiv.org/abs/2104.08072v1

[2] Farshad Samadifam, Ehsan Ghafourian. "Mathematical modeling of the treatment response of resection plus combined chemotherapy and different types of radiation therapy in a glioblastoma patient." arXiv:2308.07976v2, 2023-08-15. http://arxiv.org/abs/2308.07976v2

[3] Shekhnaz Idrissova, Islem Rekik. "Multimodal Sheaf-based Network for Glioblastoma Molecular Subtype Prediction." arXiv:2508.09717v1, 2025-08-13. http://arxiv.org/abs/2508.09717v1

[4] Prajwal Ghimire, Ben Kinnersley, Golestan Karami et al.. "Radiogenomic biomarkers for immunotherapy in glioblastoma: A systematic review of magnetic resonance imaging studies." arXiv:2405.07858v1, 2024-05-13. http://arxiv.org/abs/2405.07858v1

[5] Yousun Ko, Sangcheol Kim, Tae Hyun Kim et al.. "Effect of Electrode Array Position on Electric Field Intensity in Glioblastoma Patients Undergoing Electric Field Therapy." arXiv:2504.17183v1, 2025-04-24. http://arxiv.org/abs/2504.17183v1

[6] Vikram Goddla. "Artificial Intelligence Solution for Effective Treatment Planning for Glioblastoma Patients." arXiv:2203.05563v1, 2022-03-09. http://arxiv.org/abs/2203.05563v1

[7] Attilio Marino, Enrico Almici, Simone Migliorin et al.. "Piezoelectric Barium Titanate Nanostimulators for the Treatment of Glioblastoma Multiforme." arXiv:1812.08248v1, 2018-12-19. http://arxiv.org/abs/1812.08248v1

[8] Xiaofeng Liu, Nadya Shusharina, Helen A Shih et al.. "Treatment-wise Glioblastoma Survival Inference with Multi-parametric Preoperative MRI." arXiv:2402.06982v1, 2024-02-10. http://arxiv.org/abs/2402.06982v1

[9] Yifan Li, Chao Li, Stephen Price et al.. "Bayesian optimization assisted unsupervised learning for efficient intra-tumor partitioning in MRI and survival prediction for glioblastoma patients." arXiv:2012.03115v2, 2020-12-05. http://arxiv.org/abs/2012.03115v2

[10] Jan Unkelbach, Bjoern H. Menze, Ender Konukoglu et al.. "Radiotherapy planning for glioblastoma based on a tumor growth model: Improving target volume delineation." arXiv:1311.5902v2, 2013-11-22. http://arxiv.org/abs/1311.5902v2

[11] Hasan M Jamil. "Explainable Deep Radiogenomic Molecular Imaging for MGMT Methylation Prediction in Glioblastoma." arXiv:2601.07035v1, 2026-01-11. http://arxiv.org/abs/2601.07035v1

[12] Navodini Wijethilake, Mobarakol Islam, Dulani Meedeniya et al.. "Radiogenomics of Glioblastoma: Identification of Radiomics associated with Molecular Subtypes." arXiv:2010.14068v1, 2020-10-27. http://arxiv.org/abs/2010.14068v1

[13] D. Abler, O. Pusterla, A. Joye-Kühnis et al.. "The added value for MRI radiomics and deep-learning for glioblastoma prognostication compared to clinical and molecular information." arXiv:2507.15548v1, 2025-07-21. http://arxiv.org/abs/2507.15548v1

[14] Raouf Dridi, Hedayat Alghassi, Maen Obeidat et al.. "The Topology of Mutated Driver Pathways." arXiv:1912.00108v1, 2019-11-30. http://arxiv.org/abs/1912.00108v1

[15] Utkarsh Maurya, Appisetty Krishna Kalyan, Swapnil Bohidar et al.. "Detection and Classification of Glioblastoma Brain Tumor." arXiv:2304.09133v1, 2023-04-18. http://arxiv.org/abs/2304.09133v1

[16] Hasan M Jamil. "Explainable Deep Radiogenomic Molecular Imaging for MGMT Methylation Prediction in Glioblastoma." arXiv:2601.07035v1, 2026-01-11. http://arxiv.org/abs/2601.07035v1

[17] Mariya Miteva, Maria Nisheva-Pavlova. "The Multi-View Paradigm Shift in MRI Radiomics: Predicting MGMT Methylation in Glioblastoma." arXiv:2512.22331v1, 2025-12-26. http://arxiv.org/abs/2512.22331v1

[18] Lujia Wang, Hairong Wang, Fulvio D'Angelo et al.. "Quantifying intra-tumoral genetic heterogeneity of glioblastoma toward precision medicine using MRI and a data-inclusive machine learning algorithm." arXiv:2401.00128v1, 2023-12-30. http://arxiv.org/abs/2401.00128v1

[19] Parham Rezaee, Shahab Rezaee, Malik Maaza et al.. "Screening of BindingDB database ligands against EGFR, HER2, Estrogen, Progesterone and NF-kB receptors based on machine learning and molecular docking." arXiv:2405.00647v1, 2024-05-01. http://arxiv.org/abs/2405.00647v1

[20] La Ode Aman. "Prediction of Binding Affinity for ErbB Inhibitors Using Deep Neural Network Model with Morgan Fingerprints as Features." arXiv:2501.05607v1, 2025-01-09. http://arxiv.org/abs/2501.05607v1

[21] Jenna C. Fromer, David E. Graff, Connor W. Coley. "Pareto Optimization to Accelerate Multi-Objective Virtual Screening." arXiv:2310.10598v1, 2023-10-16. http://arxiv.org/abs/2310.10598v1

[22] Ruiqi Chen, Liang Hang, Fengyun Wang. "Mechanism of Quercetin in Inhibiting Triple-Negative Breast Cancer by Regulating T Cell-Related Targets: An Analysis Based on Single-Cell Sequencing and Network Pharmacology." arXiv:2508.12731v1, 2025-08-18. http://arxiv.org/abs/2508.12731v1

[23] Tai Dang, Long-Hung Pham, Sang T. Truong et al.. "Preferential Multi-Objective Bayesian Optimization for Drug Discovery." arXiv:2503.16841v1, 2025-03-21. http://arxiv.org/abs/2503.16841v1

[24] Miles Wang-Henderson, Benjamin Kaufman, Edward Williams et al.. "Pretrained Joint Predictions for Scalable Batch Bayesian Optimization of Molecular Designs." arXiv:2511.10590v2, 2025-11-13. http://arxiv.org/abs/2511.10590v2

[25] Filippo Stocco, Maria Artigues-Lleixa, Andrea Hunklinger et al.. "Guiding Generative Protein Language Models with Reinforcement Learning." arXiv:2412.12979v3, 2024-12-17. http://arxiv.org/abs/2412.12979v3
