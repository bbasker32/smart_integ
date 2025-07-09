from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
import time
import os
import psutil
import signal
import sys
import shutil

COMPANY_URL = os.environ.get("COMPANY_URL", "https://www.linkedin.com/company/OBBTech/")
JOB_DESCRIPTION = os.environ.get("JOB_DESCRIPTION", "🚀 Join LOGIQIA! We're hiring a Python Developer!\nApply now!")
AUTH_FILE = "linkedin_auth.json"
PROFILE_DIR = ".linkedin_profile"

# Fermer ancienne instance si elle utilise le même profil
for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
    try:
        if 'chrome.exe' in proc.info['name'].lower():
            if PROFILE_DIR in ' '.join(proc.info['cmdline']):
                print(f"Fermeture de l'ancienne instance Chromium (PID={proc.info['pid']})...")
                proc.terminate()
    except Exception:
        continue

# Ignorer signaux pour garder la fenêtre ouverte
def handler(signum, frame):
    print("Signal ignoré. Fenêtre conservée.")
signal.signal(signal.SIGTERM, handler)
signal.signal(signal.SIGINT, handler)

def wait_for_login(page, timeout=120):
    print("Connexion manuelle requise...")
    page.goto("https://www.linkedin.com/login")
    start_time = time.time()
    while True:
        try:
            if "feed" in page.url:
                print("Connexion détectée sur le fil d'actualité.")
                return True
            page.wait_for_url("**/feed/*", timeout=2000)
            return True
        except:
            pass
        if time.time() - start_time > timeout:
            print("⏱Temps écoulé pour se connecter.")
            page.screenshot(path="timeout_login.png")
            return False
        time.sleep(1)

def run_linkedin_company_post(description, company_url):
    with sync_playwright() as p:
        session_ok = False
        for attempt in range(3):
            print(f"Tentative {attempt + 1} ---")
            try:
                browser = p.chromium.launch_persistent_context(
                    user_data_dir=PROFILE_DIR,
                    headless=False,
                    args=["--start-maximized"]
                )
                page = browser.pages[0] if browser.pages else browser.new_page()

                page.set_extra_http_headers({
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                })
                page.goto("https://www.linkedin.com", timeout=60000)

                if "login" in page.url:
                   print("Non connecté. Connexion requise.")

                if os.path.exists(PROFILE_DIR):
                    print("L'utilisateur s'est déconnecté. Suppression des données de session...")
                    try:
                       shutil.rmtree(PROFILE_DIR)
                       print("✅ Session supprimée avec succès.")
                    except Exception as e:
                       print(f"❌ Erreur lors de la suppression du dossier de session : {e}")

                if not wait_for_login(page, 180):
                    print("Connexion échouée.")
                    continue

                    try:
                        browser.storage_state(path=AUTH_FILE)
                    except Exception as e:
                        print("Erreur sauvegarde session:", e)
                        continue

                print(f"Aller vers : {company_url}")
                try:
                    page.goto(company_url, timeout=60000)
                except Exception as e:
                    print("Erreur chargement de la page entreprise:", e)
                    page.screenshot(path="error_company_url.png")
                    continue

                # 📌 Ouverture modal post
                try:
                    page.wait_for_selector("button:has-text('Create')", timeout=20000)
                    page.click("button:has-text('Create')")
                    time.sleep(2)
                    page.wait_for_selector("//div[@role='dialog']//span[text()='Start a post']", timeout=10000)
                    page.click("//div[@role='dialog']//span[text()='Start a post']")
                    time.sleep(2)
                    page.wait_for_selector("div[role='textbox']", timeout=10000)
                except Exception as e:
                    print("Erreur ouverture modal:", e)
                    page.screenshot(path="error_modal.png")
                    continue

                page.fill("div[role='textbox']", description)
                print("Description collée.")
                print(description)
                print("Le navigateur reste ouvert. Cliquez sur 'Post' manuellement.")
                print("🟢 Fermez le navigateur manuellement quand vous avez terminé.")
                while True:
                   time.sleep(1)  # Boucle infinie pour que le script reste vivant


            except Exception as e:
                print("Erreur globale:", e)
                continue

        if not session_ok:
            print("Aucune tentative na réussi.")
            sys.exit(120)

if __name__ == "__main__":
    try:
        run_linkedin_company_post(JOB_DESCRIPTION, COMPANY_URL)
    except Exception as e:
        print("Erreur finale :", e)
    while True:
        time.sleep(1)

        
