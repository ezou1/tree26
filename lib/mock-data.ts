export interface Protein {
  id: string
  name: string
  gene: string
  role: string
  confidence: number
  pathwayInvolvement: string
}

export interface Drug {
  id: string
  name: string
  genericName: string
  originalIndication: string
  mechanismOfAction: string
  confidence: number
  fdaStatus: "approved" | "phase-3" | "phase-2" | "phase-1" | "preclinical"
  targetProteins: string[]
  description: string
  molecularWeight: string
  halfLife: string
  routeOfAdmin: string
  sideEffects: string[]
  citations: number
  imageUrl: string
  pubchemCid: number
}

export const mockProteins: Protein[] = [
  {
    id: "p1",
    name: "Tumor Necrosis Factor Alpha",
    gene: "TNF",
    role: "Pro-inflammatory cytokine",
    confidence: 94,
    pathwayInvolvement: "NF-kB signaling pathway",
  },
  {
    id: "p2",
    name: "Interleukin-6",
    gene: "IL6",
    role: "Cytokine signaling mediator",
    confidence: 91,
    pathwayInvolvement: "JAK-STAT signaling pathway",
  },
  {
    id: "p3",
    name: "Janus Kinase 2",
    gene: "JAK2",
    role: "Tyrosine kinase",
    confidence: 88,
    pathwayInvolvement: "JAK-STAT signaling pathway",
  },
  {
    id: "p4",
    name: "Cyclooxygenase-2",
    gene: "COX2",
    role: "Prostaglandin synthesis enzyme",
    confidence: 85,
    pathwayInvolvement: "Arachidonic acid pathway",
  },
  {
    id: "p5",
    name: "Matrix Metalloproteinase-9",
    gene: "MMP9",
    role: "Extracellular matrix degradation",
    confidence: 79,
    pathwayInvolvement: "ECM remodeling pathway",
  },
  {
    id: "p6",
    name: "Vascular Endothelial Growth Factor A",
    gene: "VEGFA",
    role: "Angiogenesis regulator",
    confidence: 76,
    pathwayInvolvement: "VEGF signaling pathway",
  },
  {
    id: "p7",
    name: "Signal Transducer and Activator of Transcription 3",
    gene: "STAT3",
    role: "Transcription factor",
    confidence: 72,
    pathwayInvolvement: "JAK-STAT signaling pathway",
  },
]

export const mockDrugs: Drug[] = [
  {
    id: "d1",
    name: "Tofacitinib",
    genericName: "Tofacitinib Citrate",
    originalIndication: "Rheumatoid Arthritis",
    mechanismOfAction: "Selective JAK1/JAK3 inhibitor that blocks cytokine signaling through the JAK-STAT pathway, reducing inflammatory mediator production.",
    confidence: 92,
    fdaStatus: "approved",
    targetProteins: ["JAK2", "STAT3"],
    description: "Tofacitinib is a small-molecule Janus kinase inhibitor originally developed for rheumatoid arthritis. Literature analysis suggests strong potential for repurposing due to its inhibition of key inflammatory cascades identified in the disease pathway. Multiple studies have demonstrated efficacy in reducing TNF and IL-6 mediated inflammation.",
    molecularWeight: "312.37 g/mol",
    halfLife: "3.2 hours",
    routeOfAdmin: "Oral",
    sideEffects: ["Upper respiratory infections", "Headache", "Diarrhea", "Nasopharyngitis"],
    citations: 847,
    imageUrl: "/images/tofacitinib.jpg",
    pubchemCid: 9926791,
  },
  {
    id: "d2",
    name: "Baricitinib",
    genericName: "Baricitinib Phosphate",
    originalIndication: "Rheumatoid Arthritis",
    mechanismOfAction: "Selective JAK1/JAK2 inhibitor, blocking intracellular signaling of multiple cytokines involved in inflammation.",
    confidence: 87,
    fdaStatus: "approved",
    targetProteins: ["JAK2", "IL6", "STAT3"],
    description: "Baricitinib demonstrates significant promise for repurposing through its dual JAK1/JAK2 inhibition mechanism. Clinical data from COVID-19 trials provides additional evidence of anti-inflammatory efficacy beyond its original indication. The compound shows favorable pharmacokinetics for chronic administration.",
    molecularWeight: "371.42 g/mol",
    halfLife: "12.5 hours",
    routeOfAdmin: "Oral",
    sideEffects: ["Nausea", "Herpes simplex", "Thrombocytosis", "Elevated liver enzymes"],
    citations: 623,
    imageUrl: "/images/baricitinib.jpg",
    pubchemCid: 44205240,
  },
  {
    id: "d3",
    name: "Celecoxib",
    genericName: "Celecoxib",
    originalIndication: "Osteoarthritis / Pain Management",
    mechanismOfAction: "Selective COX-2 inhibitor that reduces prostaglandin synthesis, decreasing inflammation and pain signaling.",
    confidence: 83,
    fdaStatus: "approved",
    targetProteins: ["COX2", "TNF"],
    description: "Celecoxib's selective COX-2 inhibition presents a well-characterized mechanism for reducing inflammation in the target pathology. Its long safety track record and oral bioavailability make it an attractive candidate for rapid clinical translation. Network pharmacology analysis reveals synergistic effects with JAK inhibitors.",
    molecularWeight: "381.37 g/mol",
    halfLife: "11 hours",
    routeOfAdmin: "Oral",
    sideEffects: ["Abdominal pain", "Dyspepsia", "Peripheral edema", "Dizziness"],
    citations: 1203,
    imageUrl: "/images/celecoxib.jpg",
    pubchemCid: 2662,
  },
  {
    id: "d4",
    name: "Bevacizumab",
    genericName: "Bevacizumab",
    originalIndication: "Colorectal Cancer",
    mechanismOfAction: "Recombinant humanized monoclonal antibody that inhibits VEGF-A, suppressing angiogenesis and vascular permeability.",
    confidence: 74,
    fdaStatus: "phase-2",
    targetProteins: ["VEGFA", "MMP9"],
    description: "Bevacizumab targets VEGF-A signaling, which literature analysis has identified as a secondary but significant pathway in disease progression. Phase 2 trials for off-label use have shown moderate efficacy. The monoclonal antibody format may limit widespread adoption due to cost and intravenous administration requirements.",
    molecularWeight: "149 kDa",
    halfLife: "20 days",
    routeOfAdmin: "Intravenous",
    sideEffects: ["Hypertension", "Proteinuria", "Bleeding events", "Wound healing complications"],
    citations: 2156,
    imageUrl: "/images/bevacizumab.jpg",
    pubchemCid: 135314777,
  },
  {
    id: "d5",
    name: "Ruxolitinib",
    genericName: "Ruxolitinib Phosphate",
    originalIndication: "Myelofibrosis",
    mechanismOfAction: "Potent JAK1/JAK2 inhibitor that modulates cytokine signaling and immune-mediated inflammatory processes.",
    confidence: 69,
    fdaStatus: "phase-3",
    targetProteins: ["JAK2", "STAT3", "TNF"],
    description: "Ruxolitinib shows potential through its potent JAK1/JAK2 inhibition, offering broader pathway coverage than Tofacitinib. Current Phase 3 trials are investigating its efficacy in inflammatory conditions beyond hematologic malignancies. Topical formulations may provide localized treatment options with reduced systemic exposure.",
    molecularWeight: "306.37 g/mol",
    halfLife: "2.8 hours",
    routeOfAdmin: "Oral / Topical",
    sideEffects: ["Anemia", "Thrombocytopenia", "Bruising", "Weight gain"],
    citations: 534,
    imageUrl: "/images/ruxolitinib.jpg",
    pubchemCid: 25126798,
  },
  {
    id: "d6",
    name: "Infliximab",
    genericName: "Infliximab",
    originalIndication: "Crohn's Disease",
    mechanismOfAction: "Chimeric monoclonal antibody that binds and neutralizes soluble and transmembrane TNF-alpha.",
    confidence: 65,
    fdaStatus: "phase-1",
    targetProteins: ["TNF", "IL6"],
    description: "Infliximab directly targets TNF-alpha, the highest-confidence protein target identified in the literature review. While effective, its chimeric antibody structure carries immunogenicity risks. Biosimilar availability may reduce cost barriers for repurposed indications.",
    molecularWeight: "144.19 kDa",
    halfLife: "8-10 days",
    routeOfAdmin: "Intravenous",
    sideEffects: ["Infusion reactions", "Infections", "Hepatotoxicity", "Lupus-like syndrome"],
    citations: 3892,
    imageUrl: "/images/infliximab.jpg",
    pubchemCid: 135314753,
  },
]

export const literatureReviewSummary = {
  query: "Systemic Lupus Erythematosus (SLE)",
  papersAnalyzed: 2847,
  keyFindings: [
    "Strong evidence for JAK-STAT pathway dysregulation in SLE pathogenesis, with elevated IL-6 and TNF-alpha levels correlating with disease activity (n=47 studies).",
    "COX-2 overexpression observed in renal biopsies of lupus nephritis patients, suggesting prostaglandin-mediated tissue damage as a secondary mechanism.",
    "VEGF-A upregulation linked to vascular complications and accelerated atherosclerosis in SLE, particularly in patients with antiphospholipid antibodies.",
    "MMP-9 levels significantly elevated during disease flares, contributing to tissue remodeling and organ damage progression.",
    "Network analysis identifies JAK2-STAT3-IL6 signaling axis as the most druggable pathway node with multiple approved inhibitors available for repurposing.",
  ],
  methodology: "Systematic review across PubMed, Cochrane Library, and ClinicalTrials.gov. NLP-based extraction of protein-disease associations with confidence scoring using BioBERT embeddings.",
}
