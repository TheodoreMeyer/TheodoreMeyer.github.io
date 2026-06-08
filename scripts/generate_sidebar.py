from pathlib import Path
import yaml
import sys

root = Path(sys.argv[1]).resolve()
slug = root.name

def title(md):
    text = md.read_text(encoding="utf-8")
    if text.startswith("---"):
        front = yaml.safe_load(text.split("---",2)[1]) or {}
        return front.get("title", md.stem)
    return md.stem

tree = []

# root index
if (root / "index.md").exists():
    tree.append({
        "title": "Overview",
        "url": f"/projects/{slug}/"
    })

for folder in sorted([p for p in root.iterdir() if p.is_dir()]):
    section_index = folder / "index.md"
    if not section_index.exists():
        continue

    section = {
        "title": title(section_index),
        "url": f"/projects/{slug}/{folder.name}/",
        "children": []
    }

    for md in sorted(folder.glob("*.md")):
        if md.name == "index.md":
            continue

        section["children"].append({
            "title": title(md),
            "url": f"/projects/{slug}/{folder.name}/{md.stem}/"
        })

    tree.append(section)

out = {
    slug: {
        "title": slug,
        "links": tree
    }
}

Path("_data").mkdir(exist_ok=True)

with open(f"_data/{slug}_nav.yml", "w") as f:
    yaml.safe_dump(out, f, sort_keys=False)

print("Sidebar generated")