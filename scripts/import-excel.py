#!/usr/bin/env python3
"""Convert an .xlsx workbook or a folder of CSV sheets into canonical JSON.

Excel is an authoring format only. The renderer never reads spreadsheets.
"""

from __future__ import annotations

import argparse
import csv
import json
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def load_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []
    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values: list[str] = []
    for item in root.findall("m:si", NS):
        values.append("".join(node.text or "" for node in item.iter("{%s}t" % NS["m"])))
    return values


def cell_value(cell: ET.Element, shared: list[str]) -> str:
    kind = cell.get("t")
    raw = cell.find("m:v", NS)
    if raw is None or raw.text is None:
        return ""
    if kind == "s":
        return shared[int(raw.text)]
    return raw.text


def column_index(cell_ref: str) -> int:
    letters = "".join(character for character in cell_ref if character.isalpha())
    index = 0
    for character in letters:
        index = index * 26 + (ord(character.upper()) - 64)
    return index - 1


def read_sheet(archive: zipfile.ZipFile, shared: list[str], name: str) -> list[list[str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_ns = {"r": "http://schemas.openxmlformats.org/package/2006/relationships"}
    targets = {
        rel.get("Id"): rel.get("Target")
        for rel in rels.findall("r:Relationship", rel_ns)
    }
    sheet_ns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    target = None
    for sheet in workbook.find("m:sheets", NS) or []:
        if sheet.get("name") == name:
            target = targets[sheet.get("{%s}id" % sheet_ns)]
            break
    if not target:
        return []
    path = "xl/" + target.lstrip("/") if not target.startswith("xl/") else target
    root = ET.fromstring(archive.read(path))
    rows: list[list[str]] = []
    for row in root.findall("m:sheetData/m:row", NS):
        values: list[str] = []
        for cell in row.findall("m:c", NS):
            index = column_index(cell.get("r", "A1"))
            while len(values) <= index:
                values.append("")
            values[index] = cell_value(cell, shared)
        if any(values):
            rows.append(values)
    return rows


def rows_to_objects(rows: list[list[str]]) -> list[dict[str, str]]:
    if not rows:
        return []
    headers = [cell.strip() for cell in rows[0]]
    records = []
    for row in rows[1:]:
        record = {}
        for index, header in enumerate(headers):
            record[header] = row[index].strip() if index < len(row) else ""
        records.append(record)
    return records


def load_xlsx(path: Path) -> dict[str, list[dict[str, str]]]:
    sheets = {}
    with zipfile.ZipFile(path) as archive:
        shared = load_shared_strings(archive)
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        names = [sheet.get("name") for sheet in workbook.find("m:sheets", NS) or []]
        for name in names:
            sheets[name] = rows_to_objects(read_sheet(archive, shared, name))
    return sheets


def load_csv_dir(path: Path) -> dict[str, list[dict[str, str]]]:
    sheets = {}
    for file in sorted(path.glob("*.csv")):
        with file.open(newline="", encoding="utf-8") as handle:
            sheets[file.stem] = list(csv.DictReader(handle))
    return sheets


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", help="xlsx file or directory of CSV sheets")
    parser.add_argument("--out", required=True, help="Write parsed sheets as JSON")
    args = parser.parse_args()
    source = Path(args.source)
    sheets = load_xlsx(source) if source.suffix.lower() == ".xlsx" else load_csv_dir(source)
    Path(args.out).write_text(json.dumps(sheets, indent=2), encoding="utf-8")
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
