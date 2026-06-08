from pathlib import Path
import sys
import yaml

project_dir = Path(sys.argv[1]).resolve()

project_yml = project_dir / "_project.yml"

if not project_yml.exists():
    raise RuntimeError(f"Missing {project_yml}")

with open(project_yml, "r", encoding="utf-8") as f:
    project = yaml.safe_load(f)

slug = project["slug"]

for md_file in project_dir.rglob("*.md"):

    text = md_file.read_text(encoding="utf-8")

    if not text.startswith("---"):
        continue

    parts = text.split("---", 2)

    if len(parts) < 3:
        continue

    frontmatter = yaml.safe_load(parts[1]) or {}

    frontmatter["layout"] = "project"
    frontmatter["project"] = slug

    with open(md_file, "w", encoding="utf-8") as f:
        f.write("---\n")
        yaml.safe_dump(
            frontmatter,
            f,
            sort_keys=False,
            allow_unicode=True
        )
        f.write("---")
        f.write(parts[2])

print(f"Prepared docs for {slug}")