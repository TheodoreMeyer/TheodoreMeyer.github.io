from pathlib import Path
import sys
import yaml
import os

root = Path(sys.argv[1]).resolve()
slug = root.name

def to_url_path(p: Path):
    rel = p.relative_to(root)

    if rel.name == "index.md":
        return f"/projects/{slug}/{rel.parent.as_posix()}/"

    return f"/projects/{slug}/{rel.with_suffix('').as_posix()}/"

for md in root.rglob("*.md"):
    text = md.read_text(encoding="utf-8")

    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) < 3:
            continue
        front = yaml.safe_load(parts[1]) or {}
        body = parts[2]
    else:
        front = {}
        body = text

    url = to_url_path(md)

    front.update({
        "layout": "project",
        "permalink": url
    })

    md.write_text(
        "---\n" +
        yaml.safe_dump(front, sort_keys=False, allow_unicode=True) +
        "---\n" +
        body,
        encoding="utf-8"
    )

print("Docs prepared with permalinks")