import os
import re
import sys
import yaml
from pathlib import Path

project_dir = Path(sys.argv[1]).resolve()

project_yml = project_dir / "_project.yml"

if not project_yml.exists():
    raise RuntimeError(f"Missing {project_yml}")

with open(project_yml, "r", encoding="utf-8") as f:
    project = yaml.safe_load(f)

slug = project["slug"]
project_title = project["title"]

nav = {
    slug: {
        "title": project_title,
        "links": []
    }
}

root_url = f"/projects/{slug}/"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

def read_title(md_file: Path) -> str:
    """
    Reads title from Markdown frontmatter.
    """

    text = md_file.read_text(encoding="utf-8")

    match = re.match(
        r"^---\s*\n(.*?)\n---",
        text,
        re.DOTALL
    )

    if not match:
        return md_file.stem.replace("-", " ").title()

    frontmatter = yaml.safe_load(match.group(1))

    return frontmatter.get(
        "title",
        md_file.stem.replace("-", " ").title()
    )

# --------------------------------------------------
# Root page
# --------------------------------------------------

root_index = project_dir / "index.md"

if root_index.exists():
    nav[slug]["links"].append({
        "title": read_title(root_index),
        "url": root_url
    })

# --------------------------------------------------
# Depth 1 folders
# --------------------------------------------------

for folder in sorted(project_dir.iterdir()):

    if not folder.is_dir():
        continue

    if folder.name.startswith("."):
        continue

    section_index = folder / "index.md"

    if not section_index.exists():
        continue

    section = {
        "title": read_title(section_index),
        "url": f"{root_url}{folder.name}/"
    }

    children = []

    for file in sorted(folder.glob("*.md")):

        if file.name == "index.md":
            continue

        children.append({
            "title": read_title(file),
            "url": (
                f"{root_url}"
                f"{folder.name}/"
                f"{file.stem}/"
            )
        })

    if children:
        section["children"] = children

    nav[slug]["links"].append(section)

# --------------------------------------------------
# Write output
# --------------------------------------------------

output_dir = Path("_data")
output_dir.mkdir(exist_ok=True)

output_file = output_dir / "docs_nav.yml"

with open(output_file, "w", encoding="utf-8") as f:
    yaml.safe_dump(
        nav,
        f,
        sort_keys=False,
        allow_unicode=True
    )

print(f"Generated {output_file}")