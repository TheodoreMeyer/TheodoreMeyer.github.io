from pathlib import Path
import sys
import yaml

src = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]).resolve()
slug = sys.argv[3]

out_root = out / slug
out_root.mkdir(parents=True, exist_ok=True)


def read_md(path):
    text = path.read_text(encoding="utf-8")

    if text.startswith("---"):
        _, front, body = text.split("---", 2)
        meta = yaml.safe_load(front) or {}
    else:
        meta = {}
        body = text

    return meta, body


def permalink(rel: Path):
    parts = list(rel.parts)

    if rel.name == "index.md":
        base = parts[:-1]
        return "/projects/" + slug + ("/" + "/".join(base) if base else "") + "/"

    return "/projects/" + slug + "/" + "/".join(parts).replace(".md", "") + "/"


# -----------------------
# BUILD FILES
# -----------------------
for md in src.rglob("*.md"):
    rel = md.relative_to(src)
    meta, body = read_md(md)

    meta["layout"] = "projects"
    meta["permalink"] = permalink(rel)

    target = out_root / rel
    target.parent.mkdir(parents=True, exist_ok=True)

    target.write_text(
        "---\n" +
        yaml.safe_dump(meta, sort_keys=False, allow_unicode=True) +
        "---\n" +
        body,
        encoding="utf-8"
    )


# -----------------------
# BUILD SIDEBAR TREE
# -----------------------
def title_of(md: Path):
    meta, _ = read_md(md)
    return meta.get("title", md.stem.replace("-", " ").title())


tree = []

root_index = out_root / "index.md"
if root_index.exists():
    tree.append({
        "title": title_of(root_index),
        "url": f"/projects/{slug}/"
    })

for folder in sorted([p for p in out_root.iterdir() if p.is_dir()]):
    if not (folder / "index.md").exists():
        continue

    section = {
        "title": title_of(folder / "index.md"),
        "url": f"/projects/{slug}/{folder.name}/",
        "children": []
    }

    for md in sorted(folder.glob("*.md")):
        if md.name == "index.md":
            continue

        section["children"].append({
            "title": title_of(md),
            "url": f"/projects/{slug}/{folder.name}/{md.stem}/"
        })

    tree.append(section)


# -----------------------
# WRITE SINGLE NAV FILE (IMPORTANT FIX)
# -----------------------
Path("_data").mkdir(exist_ok=True)

with open("_data/docs_nav.yml", "w", encoding="utf-8") as f:
    yaml.safe_dump({
        "docs": {
            slug: {
                "title": slug,
                "links": tree
            }
        }
    }, f, sort_keys=False, allow_unicode=True)

print("OK")