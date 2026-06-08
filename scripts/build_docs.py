# scripts/build_docs.py
from pathlib import Path
import sys
import yaml

src = Path(sys.argv[1]).resolve()     # svg/docs
out = Path(sys.argv[2]).resolve()     # projects
slug = sys.argv[3]

out_root = out / slug
out_root.mkdir(parents=True, exist_ok=True)

def read_md(path: Path):
    text = path.read_text(encoding="utf-8")

    if text.startswith("---"):
        _, front, body = text.split("---", 2)
        meta = yaml.safe_load(front) or {}
    else:
        meta = {}
        body = text

    return meta, body


def write_md(path: Path, meta, body, permalink):
    meta["layout"] = "projects"
    meta["permalink"] = permalink

    path.write_text(
        "---\n" +
        yaml.safe_dump(meta, sort_keys=False, allow_unicode=True) +
        "---\n" +
        body,
        encoding="utf-8"
    )


def to_permalink(rel: Path):
    parts = list(rel.parts)

    # index.md → folder URL
    if rel.name == "index.md":
        return f"/projects/{slug}/" + "/".join(parts[:-1]) + "/"

    return f"/projects/{slug}/" + "/".join(parts).replace(".md", "") + "/"


# -----------------------------
# COPY + CONVERT ALL FILES
# -----------------------------

for md in src.rglob("*.md"):
    rel = md.relative_to(src)

    meta, body = read_md(md)

    target = out_root / rel
    target.parent.mkdir(parents=True, exist_ok=True)

    permalink = to_permalink(rel)

    write_md(target, meta, body, permalink)


# -----------------------------
# GENERATE SIDEBAR TREE
# -----------------------------

tree = []

root_index = out_root / "index.md"
if root_index.exists():
    tree.append({
        "title": "Overview",
        "url": f"/projects/{slug}/"
    })

for folder in sorted([p for p in out_root.iterdir() if p.is_dir()]):
    section_index = folder / "index.md"
    if not section_index.exists():
        continue

    section = {
        "title": folder.name.title(),
        "url": f"/projects/{slug}/{folder.name}/",
        "children": []
    }

    for md in sorted(folder.glob("*.md")):
        if md.name == "index.md":
            continue

        section["children"].append({
            "title": md.stem.title(),
            "url": f"/projects/{slug}/{folder.name}/{md.stem}/"
        })

    tree.append(section)


data_file = Path("_data")
data_file.mkdir(exist_ok=True)

with open(data_file / f"{slug}_nav.yml", "w") as f:
    yaml.safe_dump({
        slug: {
            "title": slug,
            "links": tree
        }
    }, f, sort_keys=False)

print("Docs build complete")