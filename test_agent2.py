"""Tests for Agent 2 — Structure Retrieval Agent.

All external API calls (RCSB PDB, PubChem) are mocked so tests run
offline and fast.  time.sleep is patched out globally via autouse fixture.
"""

import json
import os
from unittest.mock import MagicMock, patch

import pytest
from rdkit import Chem

import agent2


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _no_sleep(monkeypatch):
    """Eliminate all sleep calls so tests are instant."""
    monkeypatch.setattr("time.sleep", lambda _: None)


@pytest.fixture()
def agent1_json(tmp_path):
    """Write a minimal Agent 1 output file and return its path."""
    data = {
        "cancer_type": "glioblastoma",
        "protein_targets": ["MGMT"],
        "drugs": [
            {
                "drug": "temozolomide",
                "proteins": ["MGMT"],
                "mechanism": "Alkylates O6-guanine",
                "fda_status": "Approved (GBM, 2005)",
            },
            {
                "drug": "O6-benzylguanine",
                "proteins": ["MGMT"],
                "mechanism": "Inactivates MGMT enzyme",
                "fda_status": "Investigational",
            },
        ],
    }
    path = tmp_path / "review.json"
    path.write_text(json.dumps(data))
    return str(path)


def _mock_response(status_code=200, json_data=None, content=b""):
    """Helper to build a fake requests.Response."""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    resp.content = content
    resp.raise_for_status = MagicMock()
    if status_code >= 400:
        from requests.exceptions import HTTPError
        resp.raise_for_status.side_effect = HTTPError(f"{status_code}")
    return resp


# ===================================================================
# canonicalize_smiles
# ===================================================================

class TestCanonicalizeSmiles:
    def test_normalizes_kekulized_to_aromatic(self):
        """Kekulé SMILES (uppercase ring atoms) → aromatic lowercase."""
        raw = "CC(=O)OC1=CC=CC=C1C(=O)O"  # aspirin, Kekulé form
        canonical = agent2.canonicalize_smiles(raw)
        assert canonical == "CC(=O)Oc1ccccc1C(=O)O"

    def test_already_canonical_unchanged(self):
        canonical = "CCO"
        assert agent2.canonicalize_smiles(canonical) == "CCO"

    def test_isomeric_smiles_preserved(self):
        """Chirality markers are kept when using isomericSmiles=True."""
        chiral = "C[C@@H](O)CC"
        result = agent2.canonicalize_smiles(chiral)
        mol = Chem.MolFromSmiles(result)
        assert mol is not None
        assert "@" in result  # chirality marker preserved

    def test_empty_string_passthrough(self):
        assert agent2.canonicalize_smiles("") == ""

    def test_invalid_smiles_returns_original(self):
        """Unparseable SMILES are returned as-is (don't drop the compound)."""
        garbage = "NOT_A_REAL_SMILES[[[{"
        assert agent2.canonicalize_smiles(garbage) == garbage

    def test_idempotent(self):
        """Canonicalizing twice gives the same result."""
        raw = "C1=CC=CC=C1"  # benzene, Kekulé
        first = agent2.canonicalize_smiles(raw)
        second = agent2.canonicalize_smiles(first)
        assert first == second


# ===================================================================
# search_pdb
# ===================================================================

class TestSearchPdb:
    def test_returns_results(self):
        json_data = {
            "result_set": [
                {"identifier": "6GJ8", "score": 1.0},
                {"identifier": "4OBE", "score": 0.9},
            ]
        }
        with patch("agent2.requests.post", return_value=_mock_response(json_data=json_data)):
            results = agent2.search_pdb("KRAS")

        assert len(results) == 2
        assert results[0] == {"pdb_id": "6GJ8", "score": 1.0}
        assert results[1] == {"pdb_id": "4OBE", "score": 0.9}

    def test_empty_result_set(self):
        with patch("agent2.requests.post", return_value=_mock_response(json_data={"result_set": []})):
            results = agent2.search_pdb("NONEXISTENT_PROTEIN")

        assert results == []

    def test_http_error_returns_empty(self):
        with patch("agent2.requests.post", return_value=_mock_response(status_code=500)):
            results = agent2.search_pdb("KRAS")

        assert results == []

    def test_network_exception_returns_empty(self):
        with patch("agent2.requests.post", side_effect=ConnectionError("timeout")):
            results = agent2.search_pdb("KRAS")

        assert results == []

    def test_query_contains_protein_name(self):
        with patch("agent2.requests.post", return_value=_mock_response(json_data={"result_set": []})) as mock_post:
            agent2.search_pdb("KRAS G12D", max_results=5)

        call_json = mock_post.call_args.kwargs["json"]
        full_text_node = call_json["query"]["nodes"][0]
        assert full_text_node["parameters"]["value"] == "KRAS G12D"
        assert call_json["request_options"]["paginate"]["rows"] == 5

    def test_uses_correct_organism_attribute(self):
        """Verify the query uses ncbi_scientific_name (not the old taxonomy_lineage path)."""
        with patch("agent2.requests.post", return_value=_mock_response(json_data={"result_set": []})) as mock_post:
            agent2.search_pdb("KRAS")

        call_json = mock_post.call_args.kwargs["json"]
        organism_node = call_json["query"]["nodes"][1]
        assert organism_node["parameters"]["attribute"] == "rcsb_entity_source_organism.ncbi_scientific_name"


# ===================================================================
# get_pdb_metadata
# ===================================================================

class TestGetPdbMetadata:
    def test_parses_list_resolution(self):
        json_data = {
            "struct": {"title": "Crystal structure of KRAS"},
            "rcsb_entry_info": {
                "resolution_combined": [1.95],
                "nonpolymer_entity_count": 2,
            },
        }
        with patch("agent2.requests.get", return_value=_mock_response(json_data=json_data)):
            meta = agent2.get_pdb_metadata("6GJ8")

        assert meta["pdb_id"] == "6GJ8"
        assert meta["resolution"] == 1.95
        assert meta["has_ligand"] is True
        assert meta["nonpolymer_count"] == 2
        assert meta["title"] == "Crystal structure of KRAS"

    def test_parses_scalar_resolution(self):
        json_data = {
            "struct": {"title": "Some protein"},
            "rcsb_entry_info": {
                "resolution_combined": 2.1,
                "nonpolymer_entity_count": 0,
            },
        }
        with patch("agent2.requests.get", return_value=_mock_response(json_data=json_data)):
            meta = agent2.get_pdb_metadata("1ABC")

        assert meta["resolution"] == 2.1
        assert meta["has_ligand"] is False

    def test_missing_fields_graceful(self):
        with patch("agent2.requests.get", return_value=_mock_response(json_data={})):
            meta = agent2.get_pdb_metadata("1XYZ")

        assert meta["pdb_id"] == "1XYZ"
        assert meta["resolution"] is None
        assert meta["has_ligand"] is False
        assert meta["title"] == ""

    def test_exception_returns_fallback(self):
        with patch("agent2.requests.get", side_effect=ConnectionError("fail")):
            meta = agent2.get_pdb_metadata("FAIL")

        assert meta["pdb_id"] == "FAIL"
        assert meta["resolution"] is None
        assert meta["has_ligand"] is False


# ===================================================================
# pick_best_structure
# ===================================================================

class TestPickBestStructure:
    def test_empty_candidates(self):
        assert agent2.pick_best_structure([]) is None

    def test_prefers_ligand_over_better_resolution(self):
        candidates = [
            {"pdb_id": "AAA"},
            {"pdb_id": "BBB"},
        ]
        metadata = {
            "AAA": {"pdb_id": "AAA", "title": "", "resolution": 1.5, "has_ligand": False, "nonpolymer_count": 0},
            "BBB": {"pdb_id": "BBB", "title": "", "resolution": 2.0, "has_ligand": True, "nonpolymer_count": 1},
        }
        with patch("agent2.get_pdb_metadata", side_effect=lambda pid: metadata[pid]):
            best = agent2.pick_best_structure(candidates)

        assert best["pdb_id"] == "BBB"

    def test_picks_best_resolution_among_liganded(self):
        candidates = [{"pdb_id": "A"}, {"pdb_id": "B"}, {"pdb_id": "C"}]
        metadata = {
            "A": {"pdb_id": "A", "title": "", "resolution": 2.5, "has_ligand": True, "nonpolymer_count": 1},
            "B": {"pdb_id": "B", "title": "", "resolution": 1.8, "has_ligand": True, "nonpolymer_count": 1},
            "C": {"pdb_id": "C", "title": "", "resolution": 1.0, "has_ligand": False, "nonpolymer_count": 0},
        }
        with patch("agent2.get_pdb_metadata", side_effect=lambda pid: metadata[pid]):
            best = agent2.pick_best_structure(candidates)

        assert best["pdb_id"] == "B"  # best resolution WITH ligand

    def test_falls_back_to_no_ligand(self):
        candidates = [{"pdb_id": "X"}, {"pdb_id": "Y"}]
        metadata = {
            "X": {"pdb_id": "X", "title": "", "resolution": 3.0, "has_ligand": False, "nonpolymer_count": 0},
            "Y": {"pdb_id": "Y", "title": "", "resolution": 1.5, "has_ligand": False, "nonpolymer_count": 0},
        }
        with patch("agent2.get_pdb_metadata", side_effect=lambda pid: metadata[pid]):
            best = agent2.pick_best_structure(candidates)

        assert best["pdb_id"] == "Y"  # better resolution

    def test_handles_none_resolution(self):
        candidates = [{"pdb_id": "N"}]
        metadata = {
            "N": {"pdb_id": "N", "title": "", "resolution": None, "has_ligand": False, "nonpolymer_count": 0},
        }
        with patch("agent2.get_pdb_metadata", side_effect=lambda pid: metadata[pid]):
            best = agent2.pick_best_structure(candidates)

        assert best["pdb_id"] == "N"

    def test_only_checks_first_ten(self):
        candidates = [{"pdb_id": str(i)} for i in range(15)]
        call_count = 0

        def counting_meta(pid):
            nonlocal call_count
            call_count += 1
            return {"pdb_id": pid, "title": "", "resolution": 2.0, "has_ligand": False, "nonpolymer_count": 0}

        with patch("agent2.get_pdb_metadata", side_effect=counting_meta):
            agent2.pick_best_structure(candidates)

        assert call_count == 10


# ===================================================================
# download_pdb
# ===================================================================

class TestDownloadPdb:
    def test_downloads_and_saves(self, tmp_path):
        pdb_content = b"HEADER    MOCK PDB FILE\nATOM      1  N   ALA A   1\nEND\n"
        with patch("agent2.requests.get", return_value=_mock_response(content=pdb_content)):
            path = agent2.download_pdb("6GJ8", str(tmp_path))

        assert path == str(tmp_path / "6GJ8.pdb")
        assert os.path.exists(path)
        assert open(path, "rb").read() == pdb_content

    def test_skips_existing_pdb(self, tmp_path):
        existing = tmp_path / "6GJ8.pdb"
        existing.write_text("already here")

        with patch("agent2.requests.get") as mock_get:
            path = agent2.download_pdb("6GJ8", str(tmp_path))

        mock_get.assert_not_called()
        assert path == str(existing)

    def test_falls_back_to_cif_and_converts(self, tmp_path):
        """If .pdb returns 404, downloads .cif, converts to .pdb via gemmi,
        and removes the intermediate .cif file."""
        pdb_404 = _mock_response(status_code=404)

        cif_content = b"data_9E3S\n_entry.id 9E3S\n"
        cif_ok = _mock_response(content=cif_content)

        pdb_path = str(tmp_path / "9E3S.pdb")

        mock_structure = MagicMock()
        # Make write_pdb actually create the file so getsize works
        def fake_write_pdb(path):
            with open(path, "w") as f:
                f.write("HEADER  MOCK\nEND\n")
        mock_structure.write_pdb.side_effect = fake_write_pdb

        with patch("agent2.requests.get", side_effect=[pdb_404, cif_ok]), \
             patch("gemmi.read_structure", return_value=mock_structure) as mock_read, \
             patch("os.remove") as mock_remove:
            path = agent2.download_pdb("9E3S", str(tmp_path))

        assert path == pdb_path
        mock_read.assert_called_once_with(str(tmp_path / "9E3S.cif"))
        mock_structure.write_pdb.assert_called_once_with(pdb_path)
        mock_remove.assert_called_once_with(str(tmp_path / "9E3S.cif"))

    def test_creates_output_directory(self, tmp_path):
        nested = tmp_path / "deep" / "structures"
        pdb_content = b"HEADER\nEND\n"
        with patch("agent2.requests.get", return_value=_mock_response(content=pdb_content)):
            path = agent2.download_pdb("1ABC", str(nested))

        assert os.path.isdir(str(nested))
        assert os.path.exists(path)


# ===================================================================
# lookup_smiles
# ===================================================================

class TestLookupSmiles:
    def test_found(self):
        json_data = {
            "PropertyTable": {
                "Properties": [
                    {
                        "CID": 5394,
                        "CanonicalSMILES": "CC(=O)NC1=CC=C(O)C=C1",
                        "IUPACName": "N-(4-hydroxyphenyl)acetamide",
                        "MolecularFormula": "C8H9NO2",
                    }
                ]
            }
        }
        with patch("agent2.requests.get", return_value=_mock_response(json_data=json_data)):
            result = agent2.lookup_smiles("temozolomide")

        assert result is not None
        assert result["cid"] == 5394
        # SMILES is RDKit-canonicalized (aromatic ring normalization)
        assert result["smiles"] == agent2.canonicalize_smiles("CC(=O)NC1=CC=C(O)C=C1")
        assert result["iupac_name"] == "N-(4-hydroxyphenyl)acetamide"

    def test_not_found_returns_none(self):
        resp = _mock_response(status_code=404)
        resp.raise_for_status = MagicMock()  # 404 doesn't raise, handled by status_code check
        with patch("agent2.requests.get", return_value=resp):
            result = agent2.lookup_smiles("totally_fake_drug_xyz")

        assert result is None

    def test_exception_returns_none(self):
        with patch("agent2.requests.get", side_effect=ConnectionError("fail")):
            result = agent2.lookup_smiles("temozolomide")

        assert result is None

    def test_empty_properties_graceful(self):
        json_data = {"PropertyTable": {"Properties": [{}]}}
        with patch("agent2.requests.get", return_value=_mock_response(json_data=json_data)):
            result = agent2.lookup_smiles("something")

        assert result is not None
        assert result["cid"] is None
        assert result["smiles"] == ""

    def test_reads_connectivity_smiles_key(self):
        """PubChem sometimes returns ConnectivitySMILES instead of CanonicalSMILES."""
        json_data = {
            "PropertyTable": {
                "Properties": [{
                    "CID": 137278711,
                    "ConnectivitySMILES": "CC1CN(CCN1)C(=O)C=C",
                    "IUPACName": "sotorasib",
                    "MolecularFormula": "C30H30F2N6O3",
                }]
            }
        }
        with patch("agent2.requests.get", return_value=_mock_response(json_data=json_data)):
            result = agent2.lookup_smiles("sotorasib")

        assert result is not None
        assert result["smiles"] == agent2.canonicalize_smiles("CC1CN(CCN1)C(=O)C=C")

    def test_parenthetical_name_retry(self):
        """'daraxonrasib (RMC-6236)' fails, but 'RMC-6236' alone succeeds."""
        not_found = _mock_response(status_code=404)
        not_found.raise_for_status = MagicMock()

        alias_resp = _mock_response(json_data={
            "PropertyTable": {
                "Properties": [{
                    "CID": 99999,
                    "CanonicalSMILES": "CC(=O)N",
                    "IUPACName": "RMC-6236",
                    "MolecularFormula": "C3H5NO",
                }]
            }
        })

        # First call: full name 404, second call: "daraxonrasib" 404, third: "RMC-6236" found
        with patch("agent2.requests.get", side_effect=[not_found, not_found, alias_resp]):
            result = agent2.lookup_smiles("daraxonrasib (RMC-6236)")

        assert result is not None
        assert result["cid"] == 99999
        assert result["smiles"] == agent2.canonicalize_smiles("CC(=O)N")

    def test_parenthetical_name_no_retry_without_parens(self):
        """Simple names without parentheses don't trigger retry."""
        not_found = _mock_response(status_code=404)
        not_found.raise_for_status = MagicMock()

        with patch("agent2.requests.get", return_value=not_found) as mock_get:
            result = agent2.lookup_smiles("zoldonrasib")

        assert result is None
        # Should only call once — no parenthetical parts to retry
        assert mock_get.call_count == 1


# ===================================================================
# search_compounds_for_target
# ===================================================================

class TestSearchCompoundsForTarget:
    def _assay_response(self, cids):
        """Build a mock PubChem assay response with given CIDs."""
        return _mock_response(json_data={
            "InformationList": {
                "Information": [{"CID": cids}]
            }
        })

    def _property_response(self, compounds):
        """Build a mock PubChem property batch response."""
        return _mock_response(json_data={
            "PropertyTable": {"Properties": compounds}
        })

    def test_strategy1_assay_search(self):
        assay_resp = self._assay_response([100, 200])
        prop_resp = self._property_response([
            {"CID": 100, "CanonicalSMILES": "CCO", "IUPACName": "ethanol", "MolecularFormula": "C2H6O"},
            {"CID": 200, "CanonicalSMILES": "CC=O", "IUPACName": "acetaldehyde", "MolecularFormula": "C2H4O"},
        ])

        with patch("agent2.requests.get", side_effect=[assay_resp, prop_resp]):
            compounds = agent2.search_compounds_for_target("KRAS")

        assert len(compounds) == 2
        assert compounds[0]["cid"] == 100
        assert compounds[0]["smiles"] == "CCO"

    def test_fallback_to_gene_symbol(self):
        """If assay search returns nothing, falls back to gene/symbol endpoint."""
        empty_resp = _mock_response(status_code=404)
        empty_resp.raise_for_status = MagicMock()

        gene_resp = self._assay_response([300])
        prop_resp = self._property_response([
            {"CID": 300, "CanonicalSMILES": "C(=O)O", "IUPACName": "formic acid", "MolecularFormula": "CH2O2"},
        ])

        with patch("agent2.requests.get", side_effect=[empty_resp, gene_resp, prop_resp]):
            compounds = agent2.search_compounds_for_target("MGMT")

        assert len(compounds) == 1
        assert compounds[0]["cid"] == 300
        assert compounds[0]["smiles"] == agent2.canonicalize_smiles("C(=O)O")

    def test_both_strategies_fail(self):
        fail_resp = _mock_response(status_code=404)
        fail_resp.raise_for_status = MagicMock()

        with patch("agent2.requests.get", side_effect=[fail_resp, fail_resp]):
            compounds = agent2.search_compounds_for_target("NONEXISTENT")

        assert compounds == []

    def test_deduplicates_cids(self):
        assay_resp = self._assay_response([100, 100, 200, 100])
        prop_resp = self._property_response([
            {"CID": 100, "CanonicalSMILES": "CCO", "IUPACName": "ethanol", "MolecularFormula": "C2H6O"},
            {"CID": 200, "CanonicalSMILES": "CC=O", "IUPACName": "acetaldehyde", "MolecularFormula": "C2H4O"},
        ])

        with patch("agent2.requests.get", side_effect=[assay_resp, prop_resp]):
            compounds = agent2.search_compounds_for_target("KRAS")

        assert len(compounds) == 2

    def test_respects_max_compounds(self):
        many_cids = list(range(1, 200))
        assay_resp = self._assay_response(many_cids)
        prop_resp = self._property_response([
            {"CID": c, "CanonicalSMILES": f"SMILES_{c}", "IUPACName": f"compound_{c}", "MolecularFormula": "C"}
            for c in range(1, 6)  # only 5 returned in property batch
        ])

        with patch("agent2.requests.get", side_effect=[assay_resp, prop_resp]):
            compounds = agent2.search_compounds_for_target("KRAS", max_compounds=5)

        # max_compounds limits the CIDs queried, not the final count
        assert len(compounds) <= 5

    def test_strips_mutation_from_name(self):
        assay_resp = self._assay_response([])
        # Assay returns empty for "KRAS" -> fallback also empty
        fail_resp = _mock_response(status_code=404)
        fail_resp.raise_for_status = MagicMock()

        with patch("agent2.requests.get", side_effect=[assay_resp, fail_resp]) as mock_get:
            agent2.search_compounds_for_target("KRAS G12D")

        # First call should use "KRAS" not "KRAS G12D"
        first_url = mock_get.call_args_list[0].args[0]
        assert "KRAS" in first_url
        assert "G12D" not in first_url

    def test_batch_property_fetch_failure_graceful(self):
        assay_resp = self._assay_response([100, 200])

        with patch("agent2.requests.get", side_effect=[assay_resp, ConnectionError("fail")]):
            compounds = agent2.search_compounds_for_target("KRAS")

        assert compounds == []  # property fetch failed, no compounds returned

    def test_reads_connectivity_smiles_in_batch(self):
        """Batch property fetch handles ConnectivitySMILES key from PubChem."""
        assay_resp = self._assay_response([100])
        prop_resp = self._property_response([
            {"CID": 100, "ConnectivitySMILES": "CCO", "IUPACName": "ethanol", "MolecularFormula": "C2H6O"},
        ])

        with patch("agent2.requests.get", side_effect=[assay_resp, prop_resp]):
            compounds = agent2.search_compounds_for_target("KRAS")

        assert len(compounds) == 1
        assert compounds[0]["smiles"] == "CCO"


# ===================================================================
# main (end-to-end integration with mocks)
# ===================================================================

class TestMain:
    def test_full_pipeline(self, agent1_json, tmp_path, monkeypatch):
        """End-to-end: reads Agent 1 JSON, mocks all APIs, writes Agent 3 JSON."""
        output_path = str(tmp_path / "agent2_output.json")
        structures_dir = str(tmp_path / "structures")

        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", agent1_json, "-o", output_path, "--structures-dir", structures_dir],
        )

        # Mock PDB search -> returns one candidate
        pdb_search_resp = _mock_response(json_data={
            "result_set": [{"identifier": "1EH4", "score": 1.0}]
        })

        # Mock PDB metadata -> has a ligand
        pdb_meta_resp = _mock_response(json_data={
            "struct": {"title": "Human MGMT"},
            "rcsb_entry_info": {
                "resolution_combined": [2.3],
                "nonpolymer_entity_count": 1,
            },
        })

        # Mock PDB download
        pdb_download_resp = _mock_response(content=b"HEADER MOCK\nEND\n")

        # Mock PubChem SMILES lookups (temozolomide, O6-benzylguanine)
        tmz_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{
                "CID": 5394,
                "CanonicalSMILES": "CC1=NN=C2N1C=NC2=O",
                "IUPACName": "temozolomide",
                "MolecularFormula": "C6H6N6O2",
            }]}
        })
        o6bg_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{
                "CID": 2345,
                "CanonicalSMILES": "C1=CC=C(C=C1)COC2=NC(=NC3=C2NC=N3)N",
                "IUPACName": "O6-benzylguanine",
                "MolecularFormula": "C12H11N5O",
            }]}
        })

        # Mock PubChem target search -> one extra compound
        assay_resp = _mock_response(json_data={
            "InformationList": {"Information": [{"CID": [9999]}]}
        })
        extra_prop_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{
                "CID": 9999,
                "CanonicalSMILES": "CC(=O)O",
                "IUPACName": "acetic acid",
                "MolecularFormula": "C2H4O2",
            }]}
        })

        # Wire up mock calls in sequence:
        # POST: pdb_search
        # GET:  pdb_meta, pdb_download, tmz_lookup, o6bg_lookup, assay_search, extra_props
        with patch("agent2.requests.post", return_value=pdb_search_resp), \
             patch("agent2.requests.get", side_effect=[
                 pdb_meta_resp,
                 pdb_download_resp,
                 tmz_resp,
                 o6bg_resp,
                 assay_resp,
                 extra_prop_resp,
             ]):
            agent2.main()

        # Verify output file exists and has correct structure
        assert os.path.exists(output_path)
        with open(output_path) as f:
            output = json.load(f)

        assert output["cancer_type"] == "glioblastoma"
        assert len(output["targets"]) == 1

        target = output["targets"][0]
        assert target["protein"] == "MGMT"
        assert target["pdb_id"] == "1EH4"
        assert target["pdb_file"] == os.path.join(structures_dir, "1EH4.pdb")

        # 2 from Agent 1 + 1 discovered
        assert len(target["ligands"]) == 3

        names = [lig["name"] for lig in target["ligands"]]
        assert "temozolomide" in names
        assert "O6-benzylguanine" in names

        # Check SMILES are populated
        for lig in target["ligands"]:
            assert lig["smiles"] != ""
            assert "source" in lig

    def test_missing_input_file(self, tmp_path, monkeypatch):
        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", str(tmp_path / "nonexistent.json")],
        )
        with pytest.raises(SystemExit) as exc_info:
            agent2.main()
        assert exc_info.value.code == 1

    def test_gene_name_fallback(self, tmp_path, monkeypatch):
        """If PDB search for 'KRAS G12D' fails, retries with 'KRAS'."""
        data = {
            "cancer_type": "pancreatic",
            "protein_targets": ["KRAS G12D"],
            "drugs": [],
        }
        input_path = str(tmp_path / "input.json")
        with open(input_path, "w") as f:
            json.dump(data, f)

        output_path = str(tmp_path / "out.json")
        structures_dir = str(tmp_path / "structs")

        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", input_path, "-o", output_path, "--structures-dir", structures_dir],
        )

        # First search ("KRAS G12D") -> empty, second ("KRAS") -> hit
        empty_search = _mock_response(json_data={"result_set": []})
        kras_search = _mock_response(json_data={
            "result_set": [{"identifier": "4OBE", "score": 1.0}]
        })
        meta_resp = _mock_response(json_data={
            "struct": {"title": "KRAS structure"},
            "rcsb_entry_info": {
                "resolution_combined": [1.6],
                "nonpolymer_entity_count": 2,
            },
        })
        download_resp = _mock_response(content=b"HEADER\nEND\n")

        # No drugs, so PubChem assay returns nothing
        assay_empty = _mock_response(json_data={"InformationList": {"Information": []}})
        gene_empty = _mock_response(status_code=404)
        gene_empty.raise_for_status = MagicMock()

        with patch("agent2.requests.post", side_effect=[empty_search, kras_search]), \
             patch("agent2.requests.get", side_effect=[meta_resp, download_resp, assay_empty, gene_empty]):
            agent2.main()

        with open(output_path) as f:
            output = json.load(f)

        assert output["targets"][0]["pdb_id"] == "4OBE"
        assert output["targets"][0]["pdb_file"] == os.path.join(structures_dir, "4OBE.pdb")

    def test_drug_with_no_smiles_filtered_out(self, tmp_path, monkeypatch):
        """Drugs that PubChem can't find get excluded from final output."""
        data = {
            "cancer_type": "glioblastoma",
            "protein_targets": ["MGMT"],
            "drugs": [
                {"drug": "real_drug", "proteins": ["MGMT"], "mechanism": "works", "fda_status": "Approved"},
                {"drug": "fake_drug_xyz", "proteins": ["MGMT"], "mechanism": "unknown", "fda_status": "Investigational"},
            ],
        }
        input_path = str(tmp_path / "input.json")
        with open(input_path, "w") as f:
            json.dump(data, f)

        output_path = str(tmp_path / "out.json")
        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", input_path, "-o", output_path, "--structures-dir", str(tmp_path / "s")],
        )

        pdb_search = _mock_response(json_data={"result_set": [{"identifier": "1EH4", "score": 1.0}]})
        pdb_meta = _mock_response(json_data={
            "struct": {"title": "MGMT"},
            "rcsb_entry_info": {"resolution_combined": [2.0], "nonpolymer_entity_count": 1},
        })
        pdb_dl = _mock_response(content=b"HEADER\nEND\n")

        # real_drug found, fake_drug 404
        real_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{"CID": 111, "CanonicalSMILES": "CCO", "IUPACName": "real", "MolecularFormula": "C2H6O"}]}
        })
        fake_resp = _mock_response(status_code=404)
        fake_resp.raise_for_status = MagicMock()

        # No extra compounds
        assay_empty = _mock_response(json_data={"InformationList": {"Information": []}})
        gene_empty = _mock_response(status_code=404)
        gene_empty.raise_for_status = MagicMock()

        with patch("agent2.requests.post", return_value=pdb_search), \
             patch("agent2.requests.get", side_effect=[pdb_meta, pdb_dl, real_resp, fake_resp, assay_empty, gene_empty]):
            agent2.main()

        with open(output_path) as f:
            output = json.load(f)

        ligands = output["targets"][0]["ligands"]
        assert len(ligands) == 1
        assert ligands[0]["name"] == "real_drug"

    def test_no_pdb_structure_still_outputs(self, tmp_path, monkeypatch):
        """If no PDB structure is found, the target still appears with pdb_id=None."""
        data = {
            "cancer_type": "rare_cancer",
            "protein_targets": ["OBSCURE"],
            "drugs": [],
        }
        input_path = str(tmp_path / "input.json")
        with open(input_path, "w") as f:
            json.dump(data, f)

        output_path = str(tmp_path / "out.json")
        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", input_path, "-o", output_path, "--structures-dir", str(tmp_path / "s")],
        )

        empty_search = _mock_response(json_data={"result_set": []})
        assay_empty = _mock_response(json_data={"InformationList": {"Information": []}})
        gene_empty = _mock_response(status_code=404)
        gene_empty.raise_for_status = MagicMock()

        with patch("agent2.requests.post", return_value=empty_search), \
             patch("agent2.requests.get", side_effect=[assay_empty, gene_empty]):
            agent2.main()

        with open(output_path) as f:
            output = json.load(f)

        target = output["targets"][0]
        assert target["protein"] == "OBSCURE"
        assert target["pdb_id"] is None
        assert target["pdb_file"] is None
        assert target["ligands"] == []

    def test_smiles_dedup_between_agent1_and_discovery(self, tmp_path, monkeypatch):
        """If PubChem discovery finds the same SMILES as an Agent 1 drug, it's not duplicated."""
        data = {
            "cancer_type": "test",
            "protein_targets": ["TP53"],
            "drugs": [
                {"drug": "aspirin", "proteins": ["TP53"], "mechanism": "COX inhibitor", "fda_status": "Approved"},
            ],
        }
        input_path = str(tmp_path / "input.json")
        with open(input_path, "w") as f:
            json.dump(data, f)

        output_path = str(tmp_path / "out.json")
        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", input_path, "-o", output_path, "--structures-dir", str(tmp_path / "s")],
        )

        pdb_search = _mock_response(json_data={"result_set": [{"identifier": "2XWR", "score": 1.0}]})
        pdb_meta = _mock_response(json_data={
            "struct": {"title": "TP53"},
            "rcsb_entry_info": {"resolution_combined": [1.8], "nonpolymer_entity_count": 1},
        })
        pdb_dl = _mock_response(content=b"HEADER\nEND\n")

        aspirin_raw = "CC(=O)OC1=CC=CC=C1C(=O)O"
        aspirin_canonical = agent2.canonicalize_smiles(aspirin_raw)
        aspirin_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{"CID": 2244, "CanonicalSMILES": aspirin_raw, "IUPACName": "aspirin", "MolecularFormula": "C9H8O4"}]}
        })

        # Discovery finds same aspirin + one new compound
        assay_resp = _mock_response(json_data={
            "InformationList": {"Information": [{"CID": [2244, 5555]}]}
        })
        prop_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [
                {"CID": 2244, "CanonicalSMILES": aspirin_raw, "IUPACName": "aspirin", "MolecularFormula": "C9H8O4"},
                {"CID": 5555, "CanonicalSMILES": "CCCC", "IUPACName": "butane", "MolecularFormula": "C4H10"},
            ]}
        })

        with patch("agent2.requests.post", return_value=pdb_search), \
             patch("agent2.requests.get", side_effect=[pdb_meta, pdb_dl, aspirin_resp, assay_resp, prop_resp]):
            agent2.main()

        with open(output_path) as f:
            output = json.load(f)

        ligands = output["targets"][0]["ligands"]
        smiles_list = [l["smiles"] for l in ligands]

        # aspirin SMILES should appear only once (canonicalized form)
        assert smiles_list.count(aspirin_canonical) == 1
        # butane is the new discovery
        assert "CCCC" in smiles_list
        assert len(ligands) == 2


# ===================================================================
# Output format contract (what Agent 3 expects)
# ===================================================================

class TestOutputContract:
    """Verify the output JSON has the exact shape Agent 3 (DiffDock) needs."""

    def test_schema_shape(self, agent1_json, tmp_path, monkeypatch):
        output_path = str(tmp_path / "out.json")
        monkeypatch.setattr(
            "sys.argv",
            ["agent2.py", "-i", agent1_json, "-o", output_path, "--structures-dir", str(tmp_path / "s")],
        )

        pdb_search = _mock_response(json_data={"result_set": [{"identifier": "1EH4", "score": 1.0}]})
        pdb_meta = _mock_response(json_data={
            "struct": {"title": "MGMT"},
            "rcsb_entry_info": {"resolution_combined": [2.0], "nonpolymer_entity_count": 1},
        })
        pdb_dl = _mock_response(content=b"HEADER\nEND\n")
        tmz_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{"CID": 5394, "CanonicalSMILES": "C=O", "IUPACName": "tmz", "MolecularFormula": "C"}]}
        })
        o6bg_resp = _mock_response(json_data={
            "PropertyTable": {"Properties": [{"CID": 2345, "CanonicalSMILES": "CCO", "IUPACName": "o6bg", "MolecularFormula": "C"}]}
        })
        assay = _mock_response(json_data={"InformationList": {"Information": []}})
        gene = _mock_response(status_code=404)
        gene.raise_for_status = MagicMock()

        with patch("agent2.requests.post", return_value=pdb_search), \
             patch("agent2.requests.get", side_effect=[pdb_meta, pdb_dl, tmz_resp, o6bg_resp, assay, gene]):
            agent2.main()

        with open(output_path) as f:
            output = json.load(f)

        # Top-level keys
        assert "cancer_type" in output
        assert "targets" in output
        assert isinstance(output["targets"], list)

        for target in output["targets"]:
            # Target keys
            assert "protein" in target
            assert "pdb_id" in target
            assert "pdb_file" in target
            assert "ligands" in target
            assert isinstance(target["ligands"], list)

            for ligand in target["ligands"]:
                # Ligand keys — what Agent 3 reads
                assert "name" in ligand
                assert "smiles" in ligand
                assert "mechanism" in ligand
                assert "fda_status" in ligand
                assert "source" in ligand
                # SMILES must be non-empty (filtered upstream)
                assert ligand["smiles"] != ""
