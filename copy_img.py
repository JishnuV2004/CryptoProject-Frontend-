import shutil
import os

src = os.path.expanduser("~/.gemini/antigravity/brain/945228fb-f380-4594-aa15-c3ef38f4e852/institutional_chart_ui_1776155507253.png")
dst = "public/trading-mockup.png"

try:
    os.makedirs("public", exist_ok=True)
    shutil.copyfile(src, dst)
    print("Successfully copied!")
except Exception as e:
    print(f"Error: {e}")
